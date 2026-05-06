import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { Octokit } from 'octokit';

// ───────────────────────────────────────────────────────────────────────────
// Types — match the shape produced by the original `gh` CLI fetch in
// `mastra-triage/triage-dashboard/src/types.ts` so the dashboard's existing
// JSON files (carried over to workspace/triage) and ported UI keep working.
// ───────────────────────────────────────────────────────────────────────────

export interface GitHubUser {
  login: string;
  id?: string | number;
  url?: string;
  avatarUrl?: string;
  is_bot?: boolean;
  name?: string;
}

export interface GitHubLabel {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface GitHubMilestone {
  number: number;
  title: string;
  description: string;
  dueOn: string | null;
  state: string;
}

export interface GitHubReactionGroup {
  content: string;
  totalCount: number;
  users: GitHubUser[];
}

export interface GitHubComment {
  id: string;
  author: GitHubUser;
  body: string;
  createdAt: string;
  updatedAt?: string;
  reactionGroups?: GitHubReactionGroup[];
}

export interface GitHubReview {
  id: string;
  author: GitHubUser;
  body: string;
  state: string;
  submittedAt: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  stateReason: string | null;
  author: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  comments: GitHubComment[];
  reactionGroups: GitHubReactionGroup[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  url: string;
  isPinned: boolean;
  closedByPullRequestsReferences: { number: number; title: string; url: string }[];
  hidden?: boolean;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string;
  state: string;
  author: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  comments: GitHubComment[];
  reviews: GitHubReview[];
  reactionGroups: GitHubReactionGroup[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
  mergedBy: GitHubUser | null;
  url: string;
  isDraft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
  headRefName: string;
  baseRefName: string;
  reviewDecision: string;
  mergeable: string;
  hidden?: boolean;
}

export interface FetchMetadata {
  fetchedAt: string;
  repo: string;
  issueCount: number;
  prCount: number;
}

export interface AssignedDeveloper {
  name: string;
  role: string;
  matchedTags: string[];
  score: number;
}

export interface TriageAssignment {
  itemNumber: number;
  itemType: 'issue' | 'pr';
  assignedDevelopers: AssignedDeveloper[];
  matchedTags: string[];
}

export interface TriageResult {
  generatedAt: string;
  assignments: TriageAssignment[];
}

interface ExpertiseContributor {
  name: string;
  commits: number;
}
interface ExpertiseTag {
  lead: string;
  description: string;
  contributors: ExpertiseContributor[];
}
export interface DeveloperExpertise {
  tags: Record<string, ExpertiseTag>;
  developers: Record<string, { role: string; top_tags: string[] }>;
}

// ───────────────────────────────────────────────────────────────────────────
// Workspace IO
// ───────────────────────────────────────────────────────────────────────────

// Mirror of resolveWorkspaceRoot() from artifact-files-route — the bundler
// can run from a few different cwds depending on dev vs build.
function resolveWorkspaceRoot(): string {
  if (process.env.MASTRA_BOWL_WORKSPACE) {
    return path.resolve(process.env.MASTRA_BOWL_WORKSPACE);
  }
  const candidates = [
    path.resolve(process.cwd(), 'workspace'),
    path.resolve(process.cwd(), '..', 'workspace'),
    path.resolve(process.cwd(), '..', '..', 'workspace'),
    path.resolve(process.cwd(), '..', '..', '..', 'workspace'),
    path.resolve(process.cwd(), 'src', 'mastra', 'public', 'workspace'),
  ];
  for (const c of candidates) {
    try {
      if (existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return candidates[0];
}

export const TRIAGE_DIR = path.join(resolveWorkspaceRoot(), 'triage');

async function ensureTriageDir(): Promise<void> {
  await fs.mkdir(TRIAGE_DIR, { recursive: true });
}

async function readJson<T>(filename: string): Promise<T | null> {
  const file = path.join(TRIAGE_DIR, filename);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(filename: string, data: unknown): Promise<void> {
  await ensureTriageDir();
  const file = path.join(TRIAGE_DIR, filename);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

// ───────────────────────────────────────────────────────────────────────────
// Octokit
// ───────────────────────────────────────────────────────────────────────────

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN is not set. Add a fine-grained PAT with public-repo read access to .env.',
    );
  }
  return new Octokit({ auth: token });
}

const REACTION_CONTENT_MAP: Record<string, string> = {
  '+1': 'THUMBS_UP',
  '-1': 'THUMBS_DOWN',
  laugh: 'LAUGH',
  hooray: 'HOORAY',
  confused: 'CONFUSED',
  heart: 'HEART',
  rocket: 'ROCKET',
  eyes: 'EYES',
};

function reactionsToGroups(reactions: any): GitHubReactionGroup[] {
  if (!reactions) return [];
  const groups: GitHubReactionGroup[] = [];
  for (const [key, content] of Object.entries(REACTION_CONTENT_MAP)) {
    const totalCount = Number(reactions[key] ?? 0);
    if (totalCount > 0) groups.push({ content, totalCount, users: [] });
  }
  return groups;
}

function userFromApi(user: any): GitHubUser {
  if (!user) return { login: 'unknown' };
  return {
    login: user.login,
    id: user.id,
    url: user.html_url,
    avatarUrl: user.avatar_url,
    is_bot: user.type === 'Bot',
  };
}

function labelFromApi(label: any): GitHubLabel {
  return {
    id: String(label.id ?? label.node_id ?? label.name),
    name: label.name,
    description: label.description ?? '',
    color: label.color ?? '',
  };
}

function milestoneFromApi(m: any): GitHubMilestone | null {
  if (!m) return null;
  return {
    number: m.number,
    title: m.title ?? '',
    description: m.description ?? '',
    dueOn: m.due_on ?? null,
    state: m.state ?? '',
  };
}

function commentFromApi(c: any): GitHubComment {
  return {
    id: String(c.id),
    author: userFromApi(c.user),
    body: c.body ?? '',
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    reactionGroups: reactionsToGroups(c.reactions),
  };
}

function reviewFromApi(r: any): GitHubReview {
  return {
    id: String(r.id),
    author: userFromApi(r.user),
    body: r.body ?? '',
    state: r.state ?? '',
    submittedAt: r.submitted_at ?? r.created_at ?? '',
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Fetchers
// ───────────────────────────────────────────────────────────────────────────

const DEFAULT_REPO = 'mastra-ai/mastra';

function parseRepo(repo: string): { owner: string; name: string } {
  const [owner, name] = repo.split('/');
  if (!owner || !name) throw new Error(`Invalid repo "${repo}" — expected "owner/name"`);
  return { owner, name };
}

async function fetchAllOpenIssues(repo: string): Promise<GitHubIssue[]> {
  const octokit = getOctokit();
  const { owner, name } = parseRepo(repo);

  // listForRepo returns issues AND PRs by default. Filter PRs out via the
  // pull_request field; pulls have it set, real issues don't.
  const rawItems = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo: name,
    state: 'open',
    per_page: 100,
  });
  const issuesOnly = rawItems.filter((i: any) => !i.pull_request);

  // Fetch comments only for issues with comments > 0, in parallel-but-bounded.
  const out: GitHubIssue[] = [];
  const concurrency = 8;
  for (let i = 0; i < issuesOnly.length; i += concurrency) {
    const slice = issuesOnly.slice(i, i + concurrency);
    const enriched = await Promise.all(
      slice.map(async (issue: any) => {
        let comments: GitHubComment[] = [];
        if ((issue.comments ?? 0) > 0) {
          try {
            const raw = await octokit.paginate(octokit.rest.issues.listComments, {
              owner,
              repo: name,
              issue_number: issue.number,
              per_page: 100,
            });
            comments = raw.map(commentFromApi);
          } catch {
            comments = [];
          }
        }
        const out: GitHubIssue = {
          number: issue.number,
          title: issue.title ?? '',
          body: issue.body ?? '',
          state: issue.state,
          stateReason: issue.state_reason ?? null,
          author: userFromApi(issue.user),
          assignees: (issue.assignees ?? []).map(userFromApi),
          labels: (issue.labels ?? []).map(labelFromApi),
          milestone: milestoneFromApi(issue.milestone),
          comments,
          reactionGroups: reactionsToGroups(issue.reactions),
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          closedAt: issue.closed_at,
          url: issue.html_url,
          isPinned: false,
          // The REST endpoint doesn't include linked-PR refs; leave empty.
          closedByPullRequestsReferences: [],
        };
        return out;
      }),
    );
    out.push(...enriched);
  }
  return out;
}

async function fetchAllOpenPRs(repo: string): Promise<GitHubPullRequest[]> {
  const octokit = getOctokit();
  const { owner, name } = parseRepo(repo);

  // Bulk list — light fields only.
  const list = await octokit.paginate(octokit.rest.pulls.list, {
    owner,
    repo: name,
    state: 'open',
    per_page: 100,
  });

  // Per-PR detail (additions/deletions/changedFiles/mergeable need .get),
  // plus reviews and comments. Bound concurrency to keep the API happy.
  const out: GitHubPullRequest[] = [];
  const concurrency = 6;
  for (let i = 0; i < list.length; i += concurrency) {
    const slice = list.slice(i, i + concurrency);
    const enriched = await Promise.all(
      slice.map(async (pr: any) => {
        let detail: any = pr;
        try {
          const res = await octokit.rest.pulls.get({
            owner,
            repo: name,
            pull_number: pr.number,
          });
          detail = res.data;
        } catch {
          /* fall back to list-level fields */
        }

        let comments: GitHubComment[] = [];
        let reviews: GitHubReview[] = [];
        try {
          const [c, r] = await Promise.all([
            octokit.paginate(octokit.rest.issues.listComments, {
              owner,
              repo: name,
              issue_number: pr.number,
              per_page: 100,
            }),
            octokit.paginate(octokit.rest.pulls.listReviews, {
              owner,
              repo: name,
              pull_number: pr.number,
              per_page: 100,
            }),
          ]);
          comments = c.map(commentFromApi);
          reviews = r.map(reviewFromApi);
        } catch {
          /* keep empties */
        }

        const reviewDecision: string =
          detail.merged
            ? 'APPROVED'
            : reviews.find((r) => r.state === 'CHANGES_REQUESTED')
              ? 'CHANGES_REQUESTED'
              : reviews.find((r) => r.state === 'APPROVED')
                ? 'APPROVED'
                : 'REVIEW_REQUIRED';

        const result: GitHubPullRequest = {
          number: pr.number,
          title: pr.title ?? '',
          body: pr.body ?? '',
          state: pr.state,
          author: userFromApi(pr.user),
          assignees: (pr.assignees ?? []).map(userFromApi),
          labels: (pr.labels ?? []).map(labelFromApi),
          milestone: milestoneFromApi(pr.milestone),
          comments,
          reviews,
          reactionGroups: reactionsToGroups(detail.reactions),
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          closedAt: pr.closed_at,
          mergedAt: pr.merged_at,
          mergedBy: pr.merged_by ? userFromApi(pr.merged_by) : null,
          url: pr.html_url,
          isDraft: !!pr.draft,
          additions: detail.additions ?? 0,
          deletions: detail.deletions ?? 0,
          changedFiles: detail.changed_files ?? 0,
          headRefName: pr.head?.ref ?? '',
          baseRefName: pr.base?.ref ?? '',
          reviewDecision,
          mergeable: detail.mergeable_state ?? detail.mergeable ?? 'unknown',
        };
        return result;
      }),
    );
    out.push(...enriched);
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// Developer assignment — programmatic port of the original triage.ts
// ───────────────────────────────────────────────────────────────────────────

function normalizeTag(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchTags(
  labels: string[],
  suggestedLabels: string[],
  category: string | undefined,
  tagNames: string[],
): string[] {
  const matched = new Set<string>();
  const allLabels = [...labels, ...suggestedLabels];

  for (const tag of tagNames) {
    const normTag = normalizeTag(tag);
    for (const label of allLabels) {
      const normLabel = normalizeTag(label);
      if (
        normLabel === normTag ||
        normTag.includes(normLabel) ||
        normLabel.includes(normTag)
      ) {
        matched.add(tag);
      }
    }
  }

  if (category) {
    const categoryMap: Record<string, string[]> = {
      documentation: ['Documentation'],
      performance: ['Observability (AI Telemetry)'],
      security: ['Authentication'],
      devex: ['CLI', 'Getting Started'],
    };
    for (const tag of categoryMap[category] || []) {
      matched.add(tag);
    }
  }

  return Array.from(matched);
}

function scoreDevelopers(
  matchedTags: string[],
  expertise: DeveloperExpertise,
): AssignedDeveloper[] {
  const scores = new Map<string, { score: number; tags: Set<string> }>();
  for (const tag of matchedTags) {
    const tagData = expertise.tags[tag];
    if (!tagData) continue;
    for (const contributor of tagData.contributors) {
      const existing = scores.get(contributor.name) || {
        score: 0,
        tags: new Set<string>(),
      };
      existing.score += contributor.commits;
      existing.tags.add(tag);
      scores.set(contributor.name, existing);
    }
  }
  return Array.from(scores.entries())
    .map(([name, data]) => ({
      name,
      role: expertise.developers[name]?.role || 'Contributor',
      matchedTags: Array.from(data.tags),
      score: data.score,
    }))
    .sort((a, b) => b.score - a.score);
}

export async function assignDevelopers(
  issues: GitHubIssue[],
  prs: GitHubPullRequest[],
  expertise: DeveloperExpertise,
  issueAnalyses?: Array<{
    issueNumber: number;
    suggestedLabels?: string[];
    category?: string;
  }>,
): Promise<TriageResult> {
  const tagNames = Object.keys(expertise.tags);
  const assignments: TriageAssignment[] = [];

  for (const issue of issues) {
    const labels = issue.labels.map((l) => l.name);
    const a = issueAnalyses?.find((x) => x.issueNumber === issue.number);
    const matched = matchTags(
      labels,
      a?.suggestedLabels ?? [],
      a?.category,
      tagNames,
    );
    const ranked = scoreDevelopers(matched, expertise);
    assignments.push({
      itemNumber: issue.number,
      itemType: 'issue',
      assignedDevelopers: ranked.slice(0, 2),
      matchedTags: matched,
    });
  }

  for (const pr of prs) {
    const labels = pr.labels.map((l) => l.name);
    const matched = matchTags(labels, [], undefined, tagNames);
    const ranked = scoreDevelopers(matched, expertise);
    assignments.push({
      itemNumber: pr.number,
      itemType: 'pr',
      assignedDevelopers: ranked.slice(0, 2),
      matchedTags: matched,
    });
  }

  return { generatedAt: new Date().toISOString(), assignments };
}

// ───────────────────────────────────────────────────────────────────────────
// Hidden-flag store — kept in a side file so we don't rewrite multi-MB JSON
// every time a row is hidden. Merged onto issues/PRs at read time.
// ───────────────────────────────────────────────────────────────────────────

type HiddenMap = Record<string, boolean>;

function hiddenKey(kind: 'issue' | 'pr', number: number): string {
  return `${kind}:${number}`;
}

export async function readHidden(): Promise<HiddenMap> {
  return (await readJson<HiddenMap>('hidden.json')) ?? {};
}

export async function setHiddenFlag(
  kind: 'issue' | 'pr',
  number: number,
  hidden: boolean,
): Promise<void> {
  const map = await readHidden();
  const key = hiddenKey(kind, number);
  if (hidden) map[key] = true;
  else delete map[key];
  await writeJson('hidden.json', map);
}

function applyHidden<T extends { number: number; hidden?: boolean }>(
  items: T[],
  hidden: HiddenMap,
  kind: 'issue' | 'pr',
): T[] {
  return items.map((item) =>
    hidden[hiddenKey(kind, item.number)]
      ? ({ ...item, hidden: true } as T)
      : item,
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Bundle reader — used by the data route AND the triageChatAgent.
// ───────────────────────────────────────────────────────────────────────────

export interface TriageBundle {
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  metadata: FetchMetadata | null;
  analysis: unknown | null;
  triage: TriageResult | null;
}

export async function readTriageBundle(): Promise<TriageBundle> {
  const [issuesRaw, prsRaw, metadata, analysis, triage, hidden] =
    await Promise.all([
      readJson<GitHubIssue[]>('issues.json'),
      readJson<GitHubPullRequest[]>('pull-requests.json'),
      readJson<FetchMetadata>('metadata.json'),
      readJson<unknown>('analysis.json'),
      readJson<TriageResult>('triage.json'),
      readHidden(),
    ]);
  return {
    issues: applyHidden(issuesRaw ?? [], hidden, 'issue'),
    pullRequests: applyHidden(prsRaw ?? [], hidden, 'pr'),
    metadata,
    analysis,
    triage,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Mastra tools
// ───────────────────────────────────────────────────────────────────────────

export const fetchGithubIssuesTool = createTool({
  id: 'triage-fetch-issues',
  description:
    'Fetch all open GitHub issues from a repo via the REST API and write them to workspace/triage/issues.json. Defaults to mastra-ai/mastra.',
  inputSchema: z.object({
    repo: z.string().default(DEFAULT_REPO).describe('owner/name'),
  }),
  outputSchema: z.object({ count: z.number(), repo: z.string() }),
  execute: async ({ repo }) => {
    const r = repo ?? DEFAULT_REPO;
    const issues = await fetchAllOpenIssues(r);
    await writeJson('issues.json', issues);
    return { count: issues.length, repo: r };
  },
});

export const fetchGithubPRsTool = createTool({
  id: 'triage-fetch-prs',
  description:
    'Fetch all open GitHub pull requests from a repo via the REST API and write them to workspace/triage/pull-requests.json. Defaults to mastra-ai/mastra.',
  inputSchema: z.object({
    repo: z.string().default(DEFAULT_REPO),
  }),
  outputSchema: z.object({ count: z.number(), repo: z.string() }),
  execute: async ({ repo }) => {
    const r = repo ?? DEFAULT_REPO;
    const prs = await fetchAllOpenPRs(r);
    await writeJson('pull-requests.json', prs);
    return { count: prs.length, repo: r };
  },
});

export const writeFetchMetadataTool = createTool({
  id: 'triage-write-metadata',
  description: 'Persist fetch metadata (timestamp, repo, counts) to workspace/triage/metadata.json.',
  inputSchema: z.object({
    repo: z.string(),
    issueCount: z.number(),
    prCount: z.number(),
  }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ repo, issueCount, prCount }) => {
    const meta: FetchMetadata = {
      fetchedAt: new Date().toISOString(),
      repo,
      issueCount,
      prCount,
    };
    await writeJson('metadata.json', meta);
    return { ok: true };
  },
});

export const readTriageBundleTool = createTool({
  id: 'triage-read-bundle',
  description:
    'Read the current triage bundle from workspace/triage (issues, PRs, metadata, AI analysis, developer assignments). Use this to ground answers in the latest local data.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    issueCount: z.number(),
    prCount: z.number(),
    hasAnalysis: z.boolean(),
    hasTriage: z.boolean(),
    fetchedAt: z.string().nullable(),
    repo: z.string().nullable(),
  }),
  execute: async () => {
    const b = await readTriageBundle();
    return {
      issueCount: b.issues.length,
      prCount: b.pullRequests.length,
      hasAnalysis: !!b.analysis,
      hasTriage: !!b.triage,
      fetchedAt: b.metadata?.fetchedAt ?? null,
      repo: b.metadata?.repo ?? null,
    };
  },
});

export const lookupItemTool = createTool({
  id: 'triage-lookup-item',
  description:
    'Look up a single issue or PR by number from the local triage bundle. Returns title, author, labels, body, comments, plus any AI analysis.',
  inputSchema: z.object({
    kind: z.enum(['issue', 'pr']),
    number: z.number().int().positive(),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    item: z.unknown().nullable(),
    analysis: z.unknown().nullable(),
    assignment: z.unknown().nullable(),
  }),
  execute: async ({ kind, number }) => {
    const b = await readTriageBundle();
    const item =
      kind === 'issue'
        ? b.issues.find((i) => i.number === number)
        : b.pullRequests.find((p) => p.number === number);
    if (!item) {
      return { found: false, item: null, analysis: null, assignment: null };
    }
    const analysisAny = b.analysis as any;
    const analysisEntry =
      kind === 'issue'
        ? analysisAny?.issueAnalyses?.find(
            (a: any) => a.issueNumber === number,
          )
        : analysisAny?.prAnalyses?.find((a: any) => a.prNumber === number);
    const assignment = b.triage?.assignments.find(
      (a) => a.itemType === kind && a.itemNumber === number,
    );
    return {
      found: true,
      item,
      analysis: analysisEntry ?? null,
      assignment: assignment ?? null,
    };
  },
});

export const assignDevelopersTool = createTool({
  id: 'triage-assign-developers',
  description:
    'Run the programmatic developer-assignment pass: match each open issue/PR against the developer-expertise map (using AI-suggested labels when available) and write the ranked assignments to workspace/triage/triage.json.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    assigned: z.number(),
    unmatched: z.number(),
    total: z.number(),
  }),
  execute: async () => {
    const [issues, prs, expertise, analysis] = await Promise.all([
      readJson<GitHubIssue[]>('issues.json'),
      readJson<GitHubPullRequest[]>('pull-requests.json'),
      readJson<DeveloperExpertise>('developer-expertise.json'),
      readJson<any>('analysis.json'),
    ]);
    if (!issues || !prs) {
      throw new Error(
        'issues.json or pull-requests.json missing — run the fetch step first.',
      );
    }
    if (!expertise) {
      throw new Error(
        'developer-expertise.json missing in workspace/triage — required for assignment.',
      );
    }
    const result = await assignDevelopers(
      issues,
      prs,
      expertise,
      analysis?.issueAnalyses,
    );
    await writeJson('triage.json', result);
    const assigned = result.assignments.filter(
      (a) => a.assignedDevelopers.length > 0,
    ).length;
    return {
      assigned,
      unmatched: result.assignments.length - assigned,
      total: result.assignments.length,
    };
  },
});

// ───────────────────────────────────────────────────────────────────────────
// Internal helpers exported for the workflow.
// ───────────────────────────────────────────────────────────────────────────

export const triageInternal = {
  fetchAllOpenIssues,
  fetchAllOpenPRs,
  readJson,
  writeJson,
  ensureTriageDir,
  TRIAGE_DIR,
  DEFAULT_REPO,
};
