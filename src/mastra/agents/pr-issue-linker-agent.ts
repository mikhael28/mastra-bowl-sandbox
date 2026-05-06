import { Agent } from '@mastra/core/agent';

export const prIssueLinkerAgent = new Agent({
  id: 'pr-issue-linker-agent',
  name: 'PR-Issue Linker Agent',
  description:
    'Given a compact index of open issues and open PRs, identify which PRs likely address which issues. Used by the triage workflow.',
  model: 'openai/gpt-5.4-mini',
  instructions: `You analyze a GitHub repository to find links between pull requests and issues.

Given lists of open issues and open PRs, identify which PRs are likely addressing which issues. Look for:
- PR titles/descriptions mentioning issue numbers (e.g. "fixes #123", "closes #456")
- PR branch names referencing issue numbers
- Semantic similarity between PR descriptions and issue descriptions
- PRs and issues with matching labels or topics

Return a list of links, each with: prNumber, issueNumber, confidence (0-1), reason.
Only include links with confidence >= 0.3. Be thorough but accurate — a link with no evidence is worse than no link.`,
});
