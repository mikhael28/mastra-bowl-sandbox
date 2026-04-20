# updated token usage tracking in observability · Pull Request #11029 · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/pull/11029
- Query: Independent third‑party case studies or audits of Mastra in production reporting measured telemetry: latency, throughput, SLA, or cost‑per‑query
- Published: 2025-12-09T16:08:20.000Z
- Author: epinzur
## Summary

Summary tailored to your query:
- The page describes a merged Pull Request (PR #11029) for mastra-ai/mastra focused on updating token usage tracking in observability across exporters.
- What it changes:
  - Fixes for cached-token tracking across all Observability Exporters.
  - Corrections to time_to_first_token (TTFT) measurements in Langfuse, Braintrust, and PostHog exporters.
  - Fixes to trace formatting in the PostHog exporter.
  - Standardized token usage reporting (input/output and detailed inputDetails/outputDetails) across exporters, including cache, reasoning, and audio breakdowns.
  - Added time-to-first-token events and root-span tag propagation to several exporters.
- Impact relevant to production telemetry:
  - Improves accuracy of token usage metrics and TTFT calculations, which can affect latency and throughput reporting.
  - Harmonizes observability data across multiple exporters, aiding consistent SLA and cost-per-query analyses.
- Change details:
  - Type: Bug fix (non-breaking) with tests added.
  - Branches: esp/cache_tokens -> main.
  - Commits: 2; changed files: 34; additions: 1,764; deletions: 714.
- Related issues: Addresses #10174, #9821, #9853.
- Versioning: Changeset notes indicate patch version bumps across multiple mastra packages, aligning with the observed improvements in observability data.

Bottom line for your query: This PR provides production-readiness improvements to observability telemetry in Mastra by ensuring accurate token usage tracking, TTFT timing, and consistent trace formatting across exporters, which directly supports more reliable latency, throughput, SLA adherence, and cost-per-query analytics.
