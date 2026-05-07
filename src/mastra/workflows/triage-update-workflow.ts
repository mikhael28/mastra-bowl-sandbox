import { createStep, createWorkflow } from '@mastra/core/workflows';
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
import {
  issueAnalysisSchema,
  prAnalysisSchema,
  prIssueLinkSchema,
  duplicateGroupSchema,
  issueSummaryForAI,
  prSummaryForAI,
} from './triage-workflow';

const DEFAULT_REPO = triageInternal.DEFAULT_REPO;

const ISSUE_BATCH = 20;
const PR_BATCH = 15;

const stateSchema = z.object({
  repo: z.string().optional(),
  issueCount: z.number().optional(),
  prCount: z.number().optional(),
  newIssues: z.array(z.number()).optional(),
  newPRs: z.array(z.number()).optional(),
  closedIssues: z.array(z.number()).optional(),
  closedPRs: z.array(z.number()).optional(),
  newIssueAnalysisCount: z.number().optional(),
  newPRAnalysisCount: z.number().optional(),
  reranLinker: z.boolean().optional(),
  reranDuplicates: z.boolean().optional(),
  assignedCount: z.number().optional(),
  totalAssignmentCount: z.number().optional(),
  fetchedAt: z.string().optional(),
});

// ── Steps ────────────────────────────────────────────────────────────────

const updateFetchStep = createStep({
  id: 'update-fetch',
  inputSchema: z.object({ repo: z.string().default(DEFAULT_REPO) }),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ inputData, setState, mastra }) => {
    const log = mastra.getLogger();
    const repo = inputData.repo || DEFAULT_REPO;

    const [existingIssues, existingPRs] = await Promise.all([
      triageInternal.readJson<GitHubIssue[]>('issues.json'),
      triageInternal.readJson<GitHubPullRequest[]>('pull-requests.json'),
    ]);

    if (!existingIssues || !existingPRs) {
      throw new Error(
        'No prior triage data found in workspace/triage. Run the full triageWorkflow first.',
      );
    }

    log.info('triage.update.fetch start', {
      step: 'update-fetch',
      repo,
      priorIssues: existingIssues.length,
      priorPRs: existingPRs.length,
    });

    const [issuesResult, prsResult] = await Promise.all([
      triageInternal.fetchOpenIssuesIncremental(repo, existingIssues),
      triageInternal.fetchOpenPRsIncremental(repo, existingPRs),
    ]);

    await Promise.all([
      triageInternal.writeJson('issues.json', issuesResult.full),
      triageInternal.writeJson('pull-requests.json', prsResult.full),
    ]);

    const meta: FetchMetadata = {
      fetchedAt: new Date().toISOString(),
      repo,
      issueCount: issuesResult.full.length,
      prCount: prsResult.full.length,
    };
    await triageInternal.writeJson('metadata.json', meta);

    log.info('triage.update.fetch done', {
      step: 'update-fetch',
      issues: issuesResult.full.length,
      prs: prsResult.full.length,
      newIssues: issuesResult.newNumbers.length,
      closedIssues: issuesResult.closedNumbers.length,
      newPRs: prsResult.newNumbers.length,
      closedPRs: prsResult.closedNumbers.length,
    });

    await setState({
      repo,
      issueCount: issuesResult.full.length,
      prCount: prsResult.full.length,
      newIssues: issuesResult.newNumbers,
      newPRs: prsResult.newNumbers,
      closedIssues: issuesResult.closedNumbers,
      closedPRs: prsResult.closedNumbers,
      fetchedAt: meta.fetchedAt,
    });
    return {};
  },
});

const analyzeNewIssuesStep = createStep({
  id: 'analyze-new-issues',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const newNumbers = state?.newIssues ?? [];
    const closedNumbers = state?.closedIssues ?? [];

    const existing =
      (await triageInternal.readJson<z.infer<typeof issueAnalysisSchema>[]>(
        'analysis-issues.partial.json',
      )) ?? [];

    // Drop entries for issues that are no longer open.
    const closedSet = new Set(closedNumbers);
    const kept = existing.filter((a) => !closedSet.has(a.issueNumber));

    if (newNumbers.length === 0) {
      if (kept.length !== existing.length) {
        await triageInternal.writeJson('analysis-issues.partial.json', kept);
      }
      log.info('triage.update.analyzeNewIssues skipped — no new issues', {
        dropped: existing.length - kept.length,
      });
      await setState({ ...state, newIssueAnalysisCount: 0 });
      return {};
    }

    const issues =
      (await triageInternal.readJson<GitHubIssue[]>('issues.json')) ?? [];
    const newSet = new Set(newNumbers);
    const newIssues = issues.filter((i) => newSet.has(i.number));

    log.info('triage.update.analyzeNewIssues start', {
      step: 'analyze-new-issues',
      newCount: newIssues.length,
    });

    const agent = mastra.getAgent('issueAnalyzerAgent');
    const fresh: z.infer<typeof issueAnalysisSchema>[] = [];

    for (let i = 0; i < newIssues.length; i += ISSUE_BATCH) {
      const batch = newIssues.slice(i, i + ISSUE_BATCH);
      const prompt = batch.map(issueSummaryForAI).join('\n---\n');
      try {
        const res = await agent.generate(prompt, {
          structuredOutput: {
            schema: z.object({ analyses: z.array(issueAnalysisSchema) }),
          },
        });
        fresh.push(...res.object.analyses);
      } catch (err) {
        log.warn('triage.update.analyzeNewIssues batch failed', {
          step: 'analyze-new-issues',
          batchStart: i,
          err: String(err),
        });
      }
    }

    // Merge: keep prior (minus closed), upsert fresh (replace any same-number).
    const freshNumbers = new Set(fresh.map((a) => a.issueNumber));
    const merged = [
      ...kept.filter((a) => !freshNumbers.has(a.issueNumber)),
      ...fresh,
    ];
    await triageInternal.writeJson('analysis-issues.partial.json', merged);

    log.info('triage.update.analyzeNewIssues done', {
      step: 'analyze-new-issues',
      added: fresh.length,
      total: merged.length,
    });

    await setState({ ...state, newIssueAnalysisCount: fresh.length });
    return {};
  },
});

const analyzeNewPRsStep = createStep({
  id: 'analyze-new-prs',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ setState, state, mastra }) => {
    const log = mastra.getLogger();
    const newNumbers = state?.newPRs ?? [];
    const closedNumbers = state?.closedPRs ?? [];

    const existing =
      (await triageInternal.readJson<z.infer<typeof prAnalysisSchema>[]>(
        'analysis-prs.partial.json',
      )) ?? [];

    const closedSet = new Set(closedNumbers);
    const kept = existing.filter((a) => !closedSet.has(a.prNumber));

    if (newNumbers.length === 0) {
      if (kept.length !== existing.length) {
        await triageInternal.writeJson('analysis-prs.partial.json', kept);
      }
      log.info('triage.update.analyzeNewPRs skipped — no new PRs', {
        dropped: existing.length - kept.length,
      });
      await setState({ ...state, newPRAnalysisCount: 0 });
      return {};
    }

    const prs =
      (await triageInternal.readJson<GitHubPullRequest[]>(
        'pull-requests.json',
      )) ?? [];
    const newSet = new Set(newNumbers);
    const newPRs = prs.filter((p) => newSet.has(p.number));

    log.info('triage.update.analyzeNewPRs start', {
      step: 'analyze-new-prs',
      newCount: newPRs.length,
    });

    const agent = mastra.getAgent('prAnalyzerAgent');
    const fresh: z.infer<typeof prAnalysisSchema>[] = [];

    for (let i = 0; i < newPRs.length; i += PR_BATCH) {
      const batch = newPRs.slice(i, i + PR_BATCH);
      const prompt = batch.map(prSummaryForAI).join('\n---\n');
      try {
        const res = await agent.generate(prompt, {
          structuredOutput: {
            schema: z.object({ analyses: z.array(prAnalysisSchema) }),
          },
        });
        fresh.push(...res.object.analyses);
      } catch (err) {
        log.warn('triage.update.analyzeNewPRs batch failed', {
          step: 'analyze-new-prs',
          batchStart: i,
          err: String(err),
        });
      }
    }

    const freshNumbers = new Set(fresh.map((a) => a.prNumber));
    const merged = [
      ...kept.filter((a) => !freshNumbers.has(a.prNumber)),
      ...fresh,
    ];
    await triageInternal.writeJson('analysis-prs.partial.json', merged);

    log.info('triage.update.analyzeNewPRs done', {
      step: 'analyze-new-prs',
      added: fresh.length,
      total: merged.length,
    });

    await setState({ ...state, newPRAnalysisCount: fresh.length });
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
    const hasNew =
      (state?.newIssues?.length ?? 0) + (state?.newPRs?.length ?? 0) > 0;
    const closedIssues = new Set(state?.closedIssues ?? []);
    const closedPRs = new Set(state?.closedPRs ?? []);

    const existing =
      (await triageInternal.readJson<z.infer<typeof prIssueLinkSchema>[]>(
        'analysis-links.partial.json',
      )) ?? [];

    if (!hasNew) {
      const kept = existing.filter(
        (l) => !closedIssues.has(l.issueNumber) && !closedPRs.has(l.prNumber),
      );
      if (kept.length !== existing.length) {
        await triageInternal.writeJson('analysis-links.partial.json', kept);
      }
      log.info('triage.update.link skipped — no new items', {
        dropped: existing.length - kept.length,
      });
      await setState({ ...state, reranLinker: false });
      return {};
    }

    const [issues, prs] = await Promise.all([
      triageInternal.readJson<GitHubIssue[]>('issues.json'),
      triageInternal.readJson<GitHubPullRequest[]>('pull-requests.json'),
    ]);
    if (!issues || !prs) {
      log.warn('triage.update.link skipped — missing issues/prs');
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
      log.warn('triage.update.link failed', { err: String(err) });
    }

    log.info('triage.update.link done', { count: links.length });
    await triageInternal.writeJson('analysis-links.partial.json', links);
    await setState({ ...state, reranLinker: true });
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
    const hasNewIssues = (state?.newIssues?.length ?? 0) > 0;
    const closedIssues = new Set(state?.closedIssues ?? []);

    const existing =
      (await triageInternal.readJson<z.infer<typeof duplicateGroupSchema>[]>(
        'analysis-duplicates.partial.json',
      )) ?? [];

    if (!hasNewIssues) {
      // Drop groups where the canonical was closed; filter closed duplicates.
      const kept = existing
        .filter((g) => !closedIssues.has(g.canonical))
        .map((g) => ({
          ...g,
          duplicates: g.duplicates.filter((d) => !closedIssues.has(d)),
        }))
        .filter((g) => g.duplicates.length > 0);
      if (kept.length !== existing.length) {
        await triageInternal.writeJson(
          'analysis-duplicates.partial.json',
          kept,
        );
      }
      log.info('triage.update.duplicates skipped — no new issues', {
        dropped: existing.length - kept.length,
      });
      await setState({ ...state, reranDuplicates: false });
      return {};
    }

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
      log.warn('triage.update.duplicates failed', { err: String(err) });
    }

    log.info('triage.update.duplicates done', { count: groups.length });
    await triageInternal.writeJson(
      'analysis-duplicates.partial.json',
      groups,
    );
    await setState({ ...state, reranDuplicates: true });
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
      (p) =>
        !p.isDraft &&
        (!p.reviewDecision || p.reviewDecision === 'REVIEW_REQUIRED'),
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
            (issues?.length || 1),
        ),
        avgPRAge: Math.round(
          (prs?.reduce((s, p) => s + days(p.createdAt), 0) ?? 0) /
            (prs?.length || 1),
        ),
      },
    };

    await triageInternal.writeJson('analysis.json', result);
    log.info('triage.update.writeAnalysis done', {
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
    newIssues: z.number(),
    newPRs: z.number(),
    closedIssues: z.number(),
    closedPRs: z.number(),
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
      log.warn('triage.update.assign skipped — missing input data');
      return {
        assigned: 0,
        total: 0,
        newIssues: state?.newIssues?.length ?? 0,
        newPRs: state?.newPRs?.length ?? 0,
        closedIssues: state?.closedIssues?.length ?? 0,
        closedPRs: state?.closedPRs?.length ?? 0,
      };
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

    log.info('triage.update.assign done', {
      assigned,
      total: result.assignments.length,
    });

    await setState({
      ...state,
      assignedCount: assigned,
      totalAssignmentCount: result.assignments.length,
    });
    return {
      assigned,
      total: result.assignments.length,
      newIssues: state?.newIssues?.length ?? 0,
      newPRs: state?.newPRs?.length ?? 0,
      closedIssues: state?.closedIssues?.length ?? 0,
      closedPRs: state?.closedPRs?.length ?? 0,
    };
  },
});

// ── Workflow assembly ────────────────────────────────────────────────────

export const triageUpdateWorkflow = createWorkflow({
  id: 'triage-update-workflow',
  description:
    'Incremental triage update: refreshes the local issues/PRs against GitHub, drops items that have closed since the last fetch, analyzes only newly-opened items, and re-runs PR↔issue linking + duplicate detection only when new items appear. Requires a prior full triageWorkflow run.',
  inputSchema: z.object({ repo: z.string().default(DEFAULT_REPO) }),
  outputSchema: z.object({
    assigned: z.number(),
    total: z.number(),
    newIssues: z.number(),
    newPRs: z.number(),
    closedIssues: z.number(),
    closedPRs: z.number(),
  }),
  stateSchema,
})
  .then(updateFetchStep)
  .then(analyzeNewIssuesStep)
  .then(analyzeNewPRsStep)
  .then(linkPRsToIssuesStep)
  .then(findDuplicatesStep)
  .then(writeAnalysisStep)
  .then(assignDevelopersStep)
  .commit();
