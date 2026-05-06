import { Agent } from '@mastra/core/agent';

export const duplicateFinderAgent = new Agent({
  id: 'duplicate-finder-agent',
  name: 'Duplicate Finder Agent',
  description:
    'Given a compact index of open issues, group ones that describe the same problem or feature request. Used by the triage workflow.',
  model: 'openai/gpt-5.4-mini',
  instructions: `You analyze GitHub issues to find duplicates or very closely related issues.

Group issues that describe the same problem or feature request. For each group, return:
- canonical: the issue number that should serve as the canonical record (prefer the oldest or most-detailed one)
- duplicates: numbers of the other issues in the group
- reason: one sentence explaining why they're duplicates

Only include groups where you're fairly confident the issues are duplicates or very closely related. Don't over-group. A false positive is worse than missing a duplicate.`,
});
