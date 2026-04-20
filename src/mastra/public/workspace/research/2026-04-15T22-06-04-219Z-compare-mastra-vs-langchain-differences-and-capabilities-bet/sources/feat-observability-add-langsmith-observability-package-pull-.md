# feat(observability): Add LangSmith observability package · Pull Request #8160 · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/pull/8160
- Query: Mastra vs LangChain ecosystem metrics 2026: GitHub stars, forks, commits, contributors, number of official third‑party integrations, and LangSmith vs Mastra Cloud usage stats
- Published: 2025-09-25T05:50:27.000Z
- Author: jacoblee93
## Summary

Summary of the page’s content tailored to your query about Mastra vs LangChain ecosystem metrics in 2026:

- What this page is: A GitHub pull request (PR) entry for the Mastra project (mastra-ai/mastra), detailing a new feature: adding a LangSmith observability package. The PR is titled “feat(observability): Add LangSmith observability package” and has been merged.

- Key changes introduced:
  - New feature: LangSmith observability package (@mastra/langsmith) added to Mastra.
  - Code updates: 15 files changed, 1883 additions, 44 deletions.
  - Commits associated: 11 total commits (including a lint pass and unit/integration tests).
  - Changeset: The PR includes a changeset indicating a patch release for @mastra/langsmith, signaling it will be included in the next version bump.
  - Testing: Added unit tests and integration tests to validate the new observability package.

- Context and usefulness for your metrics comparison:
  - The LangSmith observability package is adapted from a Braintrust implementation, integrating LangSmith-style observability within Mastra.
  - Limitations noted in the PR: the LangSmith package won’t inherit trace context from enclosing traceables and won’t act as a parent to traceables in tool calls or wrapped AI SDK methods. There may be some open questions around flushing (OTEL vs. LangSmith flush behavior).
  - The integration is aligned with Mastra’s AI-powered application/agent framework in TypeScript, potentially affecting ecosystem metrics by increasing LangSmith-related usage within Mastra projects.

- Ecosystem implications (LangSmith vs Mastra alignment):
  - Mastra adopts LangSmith observability, suggesting closer coupling with LangSmith-based tooling for telemetry and tracing within Mastra-powered apps.
  - This can influence 2026 metrics in several ways:
    - Increased number of Mastra projects adopting LangSmith for observability could raise Mastra’s adoption signals (stars, forks, contributors) if the integration proves valuable.
    - LangSmith-related activity within Mastra repositories (issues, PRs, integrations) may contribute to LangChain ecosystem visibility if Mastra users leverage LangSmith in LangChain-enabled workflows.
    - The merge indicates ongoing collaboration between Mastra and LangSmith ecosystems, potentially raising cross-project integrations and third-party usage.

- Quick actionable metrics to monitor (2026):
  - GitHub metrics for Mastra:
    - Stars, forks, contributors on Mastra repository.
    - Number of merged PRs adding integrations with external observability tools (LangSmith, OpenTelemetry, etc.).
  - LangSmith ecosystem impact:
    - Adoption rate of LangSmith-observed Mastra projects (via changes in Mastra’s documentation and examples showing LangSmith usage).
  - Third-party integration signals:
    - Count of official Mastra integrations and how many involve LangSmith or similar observability tooling.
  - LangChain ecosystem interaction:
    - Any Mastra usage in LangSmith-enabled LangChain tutorials or demos, and related
