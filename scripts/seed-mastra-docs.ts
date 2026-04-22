/**
 * Seed the `mastra-docs` collection from mastra.ai.
 *
 * Fetches:
 *  - https://mastra.ai/llms.txt           → index of Mastra documentation pages
 *  - https://mastra.ai/.well-known/skills/index.json → installable skills metadata
 *
 * Each page/skill is chunked + embedded + upserted into Pinecone under the
 * `mastra-docs` namespace using the same ingestion pipeline as the runtime
 * tools. Run with:
 *
 *   PINECONE_API_KEY=... OPENAI_API_KEY=... npx tsx scripts/seed-mastra-docs.ts
 *
 * Requires PINECONE_API_KEY and OPENAI_API_KEY.
 */
import { ingestParsed } from '../src/mastra/tools/rag/ingest-tool';

const LLMS_TXT_URL = 'https://mastra.ai/llms.txt';
const SKILLS_INDEX_URL = 'https://mastra.ai/.well-known/skills/index.json';
const COLLECTION_ID = 'mastra-docs';
const MAX_CONCURRENT_FETCHES = 6;

type DocLink = {
  title: string;
  url: string;
  section: string;
  description?: string;
};

async function main() {
  assertEnv();
  console.log(`Seeding collection "${COLLECTION_ID}"...`);

  const [docLinks, skills] = await Promise.all([fetchDocLinks(), fetchSkills()]);

  console.log(`  Found ${docLinks.length} doc pages and ${skills.length} skills`);

  let totalChunks = 0;
  let successDocs = 0;
  let failedDocs = 0;

  const chunks = chunk(docLinks, MAX_CONCURRENT_FETCHES);
  for (const [i, batch] of chunks.entries()) {
    console.log(`  Processing doc batch ${i + 1}/${chunks.length}...`);
    const results = await Promise.all(batch.map(ingestDocLink));
    for (const r of results) {
      if (r.ok) {
        successDocs++;
        totalChunks += r.chunksCreated;
      } else {
        failedDocs++;
        console.warn(`    ✗ ${r.title}: ${r.error}`);
      }
    }
  }

  console.log(`  Ingesting ${skills.length} skills...`);
  let successSkills = 0;
  let failedSkills = 0;
  for (const skill of skills) {
    try {
      const result = await ingestSkill(skill);
      successSkills++;
      totalChunks += result.chunksCreated;
    } catch (err) {
      failedSkills++;
      console.warn(`    ✗ ${skill.name ?? 'unknown skill'}: ${err}`);
    }
  }

  console.log('\nSeed complete:');
  console.log(`  Docs:   ${successDocs} ingested, ${failedDocs} failed`);
  console.log(`  Skills: ${successSkills} ingested, ${failedSkills} failed`);
  console.log(`  Total chunks upserted: ${totalChunks}`);
}

function assertEnv() {
  const missing = ['PINECONE_API_KEY', 'OPENAI_API_KEY'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function fetchDocLinks(): Promise<DocLink[]> {
  const res = await fetch(LLMS_TXT_URL);
  if (!res.ok) throw new Error(`Failed to fetch ${LLMS_TXT_URL}: ${res.status}`);
  const text = await res.text();
  return parseLlmsTxt(text);
}

function parseLlmsTxt(text: string): DocLink[] {
  const links: DocLink[] = [];
  const lines = text.split('\n');
  let currentSection = 'general';

  const sectionRe = /^##\s+(.+)$/;
  const linkRe = /^-\s*\[(.+?)\]\((https?:\/\/[^)]+)\)(?::\s*(.+))?$/;

  for (const line of lines) {
    const sectionMatch = line.match(sectionRe);
    if (sectionMatch) {
      currentSection = sectionMatch[1]!.trim();
      continue;
    }
    const linkMatch = line.match(linkRe);
    if (linkMatch) {
      links.push({
        title: linkMatch[1]!.trim(),
        url: linkMatch[2]!.trim(),
        section: currentSection,
        description: linkMatch[3]?.trim(),
      });
    }
  }
  return links;
}

async function ingestDocLink(
  link: DocLink,
): Promise<{ ok: true; title: string; chunksCreated: number } | { ok: false; title: string; error: string }> {
  try {
    const res = await fetch(link.url);
    if (!res.ok) {
      return { ok: false, title: link.title, error: `HTTP ${res.status}` };
    }
    const raw = await res.text();
    const text = stripHtml(raw);
    if (text.trim().length < 200) {
      return { ok: false, title: link.title, error: 'content too short' };
    }

    const header = `# ${link.title}\n\nSource: ${link.url}\nSection: ${link.section}\n${
      link.description ? `\n${link.description}\n` : ''
    }\n---\n\n`;

    const result = await ingestParsed({
      parsed: { text: header + text, format: 'markdown' },
      collectionId: COLLECTION_ID,
      documentName: link.title,
      sourceType: 'mastra-docs',
      sourceUri: link.url,
      tags: ['mastra', 'docs', slugify(link.section)],
      extraMetadata: {
        section: link.section,
      },
    });

    return { ok: true, title: link.title, chunksCreated: result.chunksCreated };
  } catch (err) {
    return { ok: false, title: link.title, error: String(err) };
  }
}

type SkillEntry = {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  url?: string;
  [k: string]: any;
};

async function fetchSkills(): Promise<SkillEntry[]> {
  try {
    const res = await fetch(SKILLS_INDEX_URL);
    if (!res.ok) {
      console.warn(`  Skills index unavailable (${res.status}) — skipping skills`);
      return [];
    }
    const data = (await res.json()) as unknown;
    if (Array.isArray(data)) return data as SkillEntry[];
    if (data && typeof data === 'object' && Array.isArray((data as any).skills)) {
      return (data as any).skills as SkillEntry[];
    }
    return [];
  } catch (err) {
    console.warn(`  Failed to fetch skills index: ${err} — skipping`);
    return [];
  }
}

async function ingestSkill(skill: SkillEntry) {
  const name = skill.name ?? skill.slug ?? 'unknown-skill';
  const lines: string[] = [`# Skill: ${name}`];
  if (skill.category) lines.push(`Category: ${skill.category}`);
  if (skill.url) lines.push(`Source: ${skill.url}`);
  lines.push('');
  if (skill.description) lines.push(skill.description);
  lines.push('');
  lines.push('## Full metadata');
  lines.push('```json');
  lines.push(JSON.stringify(skill, null, 2));
  lines.push('```');

  return ingestParsed({
    parsed: { text: lines.join('\n'), format: 'markdown' },
    collectionId: COLLECTION_ID,
    documentName: `skill-${slugify(name)}`,
    sourceType: 'mastra-skill',
    sourceUri: skill.url ?? SKILLS_INDEX_URL,
    tags: ['mastra', 'skill', skill.category ? slugify(skill.category) : 'uncategorized'],
    extraMetadata: {
      skillName: name,
      category: skill.category ?? 'uncategorized',
    },
  });
}

function stripHtml(input: string): string {
  // llms.txt entries often link to pages that can be fetched as markdown-ish HTML.
  // Strip tags and collapse whitespace; we don't need perfect fidelity, only retrievable chunks.
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'item';
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
