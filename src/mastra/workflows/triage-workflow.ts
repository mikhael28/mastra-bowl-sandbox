import { createStep, createWorkflow } from '@mastra/core/workflows/evented';
import { z } from 'zod';
import {
  triageInternal,
  assignDevelopers,
  type GitHubIssue,
  type GitHubPullRequest,
  type DeveloperExpertise,
  type FetchMetadata,
  type TriageResult,
} from '../tools/triage-tools';

const DEFAULT_REPO = triageInternal.DEFAULT_REPO;

// ── State + per-step schemas ─────────────────────────────────────────────

export const issueAnalysisSchema = z.object({
  issueNumber: z.number(),
  category: z.enum([
    'bug',
    'feature-request',
    'enhancement',
    'question',
    'documentation',
    'performance',
    'security',
    'devex',
    'other',
  ]),
  priority: z.enum(['critical', 'high', 'medium', 'low', 'none']),
  priorityReason: z.string(),
  staleness: z.object({
    score: z.number(),
    factors: z.array(z.string()),
    lastMeaningfulActivity: z.string(),
  }),
  summary: z.string(),
  suggestedLabels: z.array(z.string()),
  relatedIssues: z.array(z.number()),
});

export const prAnalysisSchema = z.object({
  prNumber: z.number(),
  summary: z.string(),
  staleness: z.object({
    score: z.number(),
    factors: z.array(z.string()),
    lastMeaningfulActivity: z.string(),
  }),
  reviewStatus: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  riskReason: z.string(),
});

export const prIssueLinkSchema = z.object({
  prNumber: z.number(),
  issueNumber: z.number(),
  confidence: z.number(),
  reason: z.string(),
});

export const duplicateGroupSchema = z.object({
  canonical: z.number(),
  duplicates: z.array(z.number()),
  reason: z.string(),
});

// Step input schemas use `z.unknown()` for the heavy arrays we pass between
// steps so we don't pay schema-validation cost on multi-MB issue/PR payloads.
// The runtime types are pinned via `as` casts inside each execute body.
const stateSchema = z.object({
  repo: z.string().optional(),
  issueCount: z.number().optional(),
  prCount: z.number().optional(),
  issueAnalysisCount: z.number().optional(),
  prAnalysisCount: z.number().optional(),
  prIssueLinksCount: z.number().optional(),
  duplicateGroupsCount: z.number().optional(),
  assignedCount: z.number().optional(),
  totalAssignmentCount: z.number().optional(),
  fetchedAt: z.string().optional(),
});

// ── Steps ────────────────────────────────────────────────────────────────

const fetchStep = createStep({
  id: 'fetch',
  inputSchema: z.object({ repo: z.string().default(DEFAULT_REPO) }),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ inputData, setState, mastra }) => {
    const log = mastra.getLogger();
    const repo = inputData.repo || DEFAULT_REPO;
    log.info('triage.fetch start', { step: 'fetch', repo });

    const [issues, prs] = await Promise.all([
      triageInternal.fetchAllOpenIssues(repo),
      triageInternal.fetchAllOpenPRs(repo),
    ]);
    await Promise.all([
      triageInternal.writeJson('issues.json', issues),
      triageInternal.writeJson('pull-requests.json', prs),
    ]);

    const meta: FetchMetadata = {
      fetchedAt: new Date().toISOString(),
      repo,
      issueCount: issues.length,
      prCount: prs.length,
    };
    await triageInternal.writeJson('metadata.json', meta);

    log.info('triage.fetch done', {
      step: 'fetch',
      issues: issues.length,
      prs: prs.length,
    });

    await setState({
      repo,
      issueCount: issues.length,
      prCount: prs.length,
      fetchedAt: meta.fetchedAt,
    });
    return {};
  },
});

// ── Helpers shared by analyze steps ──────────────────────────────────────

export function issueSummaryForAI(issue: GitHubIssue): string {
  const commentSummary = issue.comments
    ?.slice(0, 5)
    .map((c) => `  [${c.author?.login}]: ${c.body?.slice(0, 150)}`)
    .join('\n') || '';
  return [
    `#${issue.number}: ${issue.title}`,
    `Author: @${issue.author.login} | Labels: ${issue.labels.map((l) => l.name).join(', ') || 'none'}`,
    `Created: ${issue.createdAt} | Updated: ${issue.updatedAt} | Comments: ${issue.comments?.length || 0}`,
    `Body: ${issue.body?.slice(0, 400) || 'empty'}`,
    commentSummary ? `Recent comments:\n${commentSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function prSummaryForAI(pr: GitHubPullRequest): string {
  const commentSummary = pr.comments
    ?.slice(0, 3)
    .map((c) => `  [${c.author?.login}]: ${c.body?.slice(0, 150)}`)
    .join('\n') || '';
  const reviewSummary = pr.reviews
    ?.slice(0, 3)
    .map((r) => `  [${r.author?.login}] ${r.state}: ${r.body?.slice(0, 100)}`)
    .join('\n') || '';
  return [
    `PR #${pr.number}: ${pr.title}`,
    `Author: @${pr.author.login} | Branch: ${pr.headRefName} → ${pr.baseRefName}`,
    `Labels: ${pr.labels.map((l) => l.name).join(', ') || 'none'}`,
    `Created: ${pr.createdAt} | Updated: ${pr.updatedAt} | Draft: ${pr.isDraft}`,
    `+${pr.additions} -${pr.deletions} (${pr.changedFiles} files) | Review: ${pr.reviewDecision || 'pending'}`,
    `Body: ${pr.body?.slice(0, 400) || 'empty'}`,
    reviewSummary ? `Reviews:\n${reviewSummary}` : '',
    commentSummary ? `Comments:\n${commentSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const ISSUE_BATCH = 20;
const PR_BATCH = 15;

const analyzeIssuesStep = createStep({
  id: 'analyze-issues',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const issues = (await triageInternal.readJson<GitHubIssue[]>(
      'issues.json',
    )) ?? [];
    log.info('triage.analyzeIssues start', {
      step: 'analyze-issues',
      total: issues.length,
    });

    const agent = mastra.getAgent('issueAnalyzerAgent');
    const allAnalyses: z.infer<typeof issueAnalysisSchema>[] = [];

    for (let i = 0; i < issues.length; i += ISSUE_BATCH) {
      const batch = issues.slice(i, i + ISSUE_BATCH);
      const prompt = batch.map(issueSummaryForAI).join('\n---\n');
      try {
        const res = await agent.generate(prompt, {
          structuredOutput: {
            schema: z.object({ analyses: z.array(issueAnalysisSchema) }),
          },
        });
        allAnalyses.push(...res.object.analyses);
      } catch (err) {
        log.warn('triage.analyzeIssues batch failed', {
          step: 'analyze-issues',
          batchStart: i,
          err: String(err),
        });
      }
    }

    log.info('triage.analyzeIssues done', {
      step: 'analyze-issues',
      analyses: allAnalyses.length,
    });

    await triageInternal.writeJson('analysis-issues.partial.json', allAnalyses);
    await setState({ ...state, issueAnalysisCount: allAnalyses.length });
    return {};
  },
});

const analyzePRsStep = createStep({
  id: 'analyze-prs',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const prs = (await triageInternal.readJson<GitHubPullRequest[]>(
      'pull-requests.json',
    )) ?? [];
    log.info('triage.analyzePRs start', {
      step: 'analyze-prs',
      total: prs.length,
    });

    const agent = mastra.getAgent('prAnalyzerAgent');
    const allAnalyses: z.infer<typeof prAnalysisSchema>[] = [];

    for (let i = 0; i < prs.length; i += PR_BATCH) {
      const batch = prs.slice(i, i + PR_BATCH);
      const prompt = batch.map(prSummaryForAI).join('\n---\n');
      try {
        const res = await agent.generate(prompt, {
          structuredOutput: {
            schema: z.object({ analyses: z.array(prAnalysisSchema) }),
          },
        });
        allAnalyses.push(...res.object.analyses);
      } catch (err) {
        log.warn('triage.analyzePRs batch failed', {
          step: 'analyze-prs',
          batchStart: i,
          err: String(err),
        });
      }
    }

    log.info('triage.analyzePRs done', {
      step: 'analyze-prs',
      analyses: allAnalyses.length,
    });

    await triageInternal.writeJson('analysis-prs.partial.json', allAnalyses);
    await setState({ ...state, prAnalysisCount: allAnalyses.length });
    return {};
  },
});

const linkPRsToIssuesStep = createStep({
  id: 'link-prs-to-issues',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const [issues, prs] = await Promise.all([
      triageInternal.readJson<GitHubIssue[]>('issues.json'),
      triageInternal.readJson<GitHubPullRequest[]>('pull-requests.json'),
    ]);
    if (!issues || !prs) {
      log.warn('triage.link skipped — missing issues/prs');
      return {};
    }

    const issueIndex = issues
      .map(
        (i) =>
          `#${i.number}: ${i.title} [${i.labels.map((l) => l.name).join(',')}]`,
      )
      .join('\n');
    const prIndex = prs
      .map(
        (p) =>
          `PR #${p.number}: ${p.title} (branch: ${p.headRefName}) [${p.labels.map((l) => l.name).join(',')}] body: ${p.body?.slice(0, 200)}`,
      )
      .join('\n');

    let links: z.infer<typeof prIssueLinkSchema>[] = [];
    try {
      const agent = mastra.getAgent('prIssueLinkerAgent');
      const res = await agent.generate(
        `ISSUES:\n${issueIndex}\n\nPULL REQUESTS:\n${prIndex}`,
        {
          structuredOutput: {
            schema: z.object({ links: z.array(prIssueLinkSchema) }),
          },
        },
      );
      links = res.object.links;
    } catch (err) {
      log.warn('triage.link failed', { err: String(err) });
    }

    log.info('triage.link done', { count: links.length });
    await triageInternal.writeJson('analysis-links.partial.json', links);
    await setState({ ...state, prIssueLinksCount: links.length });
    return {};
  },
});

const findDuplicatesStep = createStep({
  id: 'find-duplicates',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const issues =
      (await triageInternal.readJson<GitHubIssue[]>('issues.json')) ?? [];
    const issueIndex = issues
      .map(
        (i) =>
          `#${i.number}: ${i.title} | Labels: ${i.labels.map((l) => l.name).join(',')} | ${i.body?.slice(0, 150)}`,
      )
      .join('\n');

    let groups: z.infer<typeof duplicateGroupSchema>[] = [];
    try {
      const agent = mastra.getAgent('duplicateFinderAgent');
      const res = await agent.generate(issueIndex, {
        structuredOutput: {
          schema: z.object({ groups: z.array(duplicateGroupSchema) }),
        },
      });
      groups = res.object.groups;
    } catch (err) {
      log.warn('triage.duplicates failed', { err: String(err) });
    }

    log.info('triage.duplicates done', { count: groups.length });
    await triageInternal.writeJson('analysis-duplicates.partial.json', groups);
    await setState({ ...state, duplicateGroupsCount: groups.length });
    return {};
  },
});

const writeAnalysisStep = createStep({
  id: 'write-analysis',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ mastra }) => {
    const log = mastra.getLogger();
    const [issueAnalyses, prAnalyses, prIssueLinks, duplicateGroups, issues, prs] =
      await Promise.all([
        triageInternal.readJson<any[]>('analysis-issues.partial.json'),
        triageInternal.readJson<any[]>('analysis-prs.partial.json'),
        triageInternal.readJson<any[]>('analysis-links.partial.json'),
        triageInternal.readJson<any[]>('analysis-duplicates.partial.json'),
        triageInternal.readJson<GitHubIssue[]>('issues.json'),
        triageInternal.readJson<GitHubPullRequest[]>('pull-requests.json'),
      ]);

    const days = (s: string) =>
      Math.floor((Date.now() - new Date(s).getTime()) / (1000 * 60 * 60 * 24));

    const staleThreshold = 60;
    const staleIssues = (issueAnalyses ?? []).filter(
      (a) => a.staleness?.score >= staleThreshold,
    );
    const stalePRs = (prAnalyses ?? []).filter(
      (a) => a.staleness?.score >= staleThreshold,
    );
    const unreviewedPRs = (prs ?? []).filter(
      (p) => !p.isDraft && (!p.reviewDecision || p.reviewDecision === 'REVIEW_REQUIRED'),
    );

    const result = {
      generatedAt: new Date().toISOString(),
      issueAnalyses: issueAnalyses ?? [],
      prAnalyses: prAnalyses ?? [],
      prIssueLinks: prIssueLinks ?? [],
      duplicateGroups: duplicateGroups ?? [],
      stats: {
        totalOpenIssues: issues?.length ?? 0,
        totalOpenPRs: prs?.length ?? 0,
        staleIssuesCount: staleIssues.length,
        stalePRsCount: stalePRs.length,
        unreviewedPRsCount: unreviewedPRs.length,
        avgIssueAge: Math.round(
          (issues?.reduce((s, i) => s + days(i.createdAt), 0) ?? 0) /
            ((issues?.length || 1)),
        ),
        avgPRAge: Math.round(
          (prs?.reduce((s, p) => s + days(p.createdAt), 0) ?? 0) /
            ((prs?.length || 1)),
        ),
      },
    };

    await triageInternal.writeJson('analysis.json', result);
    log.info('triage.writeAnalysis done', {
      issueAnalyses: result.issueAnalyses.length,
      prAnalyses: result.prAnalyses.length,
    });
    return {};
  },
});

const assignDevelopersStep = createStep({
  id: 'assign-developers',
  inputSchema: z.object({}),
  outputSchema: z.object({
    assigned: z.number(),
    total: z.number(),
  }),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const [issues, prs, expertise, analysis] = await Promise.all([
      triageInternal.readJson<GitHubIssue[]>('issues.json'),
      triageInternal.readJson<GitHubPullRequest[]>('pull-requests.json'),
      triageInternal.readJson<DeveloperExpertise>('developer-expertise.json'),
      triageInternal.readJson<any>('analysis.json'),
    ]);

    if (!issues || !prs || !expertise) {
      log.warn('triage.assign skipped — missing input data');
      return { assigned: 0, total: 0 };
    }

    const result: TriageResult = await assignDevelopers(
      issues,
      prs,
      expertise,
      analysis?.issueAnalyses,
    );
    await triageInternal.writeJson('triage.json', result);
    const assigned = result.assignments.filter(
      (a) => a.assignedDevelopers.length > 0,
    ).length;

    log.info('triage.assign done', {
      assigned,
      total: result.assignments.length,
    });

    await setState({
      ...state,
      assignedCount: assigned,
      totalAssignmentCount: result.assignments.length,
    });
    return { assigned, total: result.assignments.length };
  },
});

// ── Workflow assembly ────────────────────────────────────────────────────

export const triageWorkflow = createWorkflow({
  id: 'triage-workflow',
  description:
    'Fetches open issues + PRs from GitHub, runs AI analysis (issue triage, PR triage, PR↔issue linking, duplicate detection), and assigns reviewers based on the developer-expertise map. All output written to workspace/triage/.',
  inputSchema: z.object({ repo: z.string().default(DEFAULT_REPO) }),
  outputSchema: z.object({ assigned: z.number(), total: z.number() }),
  stateSchema,
  schedule: {
    cron: '30 6 * * *',
    timezone: 'America/Los_Angeles',
    inputData: { repo: DEFAULT_REPO },
  },
})
  .then(fetchStep)
  .then(analyzeIssuesStep)
  .then(analyzePRsStep)
  .then(linkPRsToIssuesStep)
  .then(findDuplicatesStep)
  .then(writeAnalysisStep)
  .then(assignDevelopersStep)
  .commit();
