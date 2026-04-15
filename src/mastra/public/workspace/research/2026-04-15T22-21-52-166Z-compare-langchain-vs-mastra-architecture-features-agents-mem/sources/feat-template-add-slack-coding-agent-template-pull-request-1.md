# feat(template): add Slack coding agent template · Pull Request #13925 · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/pull/13925
- Query: Mastra community and adoption signals: case studies, production deployments, integrations/partners, forum/Slack/Discord activity and StackOverflow questions
- Published: 2026-03-06T16:39:29.000Z
- Author: DanielSLew
## Summary

Summary tailored to your query:
- What this is: A new Slack coding agent template for Mastra, enabling per-thread sandboxes and real-time Slack integration. It wires MastraCode with E2B sandboxes and deploys via Docker/Railway.
- Key capabilities you’ll care about:
  - Per-thread Slack threads with dedicated E2B sandbox, including pre-cloned repos.
  - Real-time streaming of agent activity back to Slack (live status, tool usage, and activity feed).
  - Slack event handling with signature verification and thread-level isolation.
  - Enhanced file tools: MastraFilesystem extension provides file read/write/edit/grep capabilities (not just command execution).
  - Interactive prompt bridging: user prompts and plan approvals posted to Slack; replies resolve in the agent flow.
  - Thread history injection when the bot is mentioned in existing threads.
  - Gist-based activity logging (append-only, syncing every 10 entries).
  - Deployment/config: Docker + Railway setup with auto-pause/resume tied to E2B.
- What’s new in this PR (highlights):
  - Template to create Slack-enabled MastraCode agents.
  - End-to-end testing and documentation updates.
  - Session-management improvements (idle cleanup, per-thread sandboxing).
- Deployment and ecosystem notes:
  - Tested end-to-end on Railway with a real Slack workspace.
  - Includes setup docs, usage examples, and architecture overview.
  - No changeset update required for version bump (per PR notes), unless you plan to publish a new package version.
- Relevance to adoption signals:
  - Demonstrates official Slack integration and per-thread sandboxing, highlighting Mastra’s readiness for multi-tenant, live-collaboration workflows.
  - Indicates ongoing ecosystem expansion (Git repo management templates, integrations with Slack, E2B tooling, and deployment pipelines).
- If you’re evaluating for production use:
  - Consider how per-thread sandboxes affect scalability and cost on Railway.
  - Review the Git repo management capabilities and how they fit your onboarding/partner workflows.
  - Check the interactive prompt bridging for your team’s collaboration style in Slack channels.
