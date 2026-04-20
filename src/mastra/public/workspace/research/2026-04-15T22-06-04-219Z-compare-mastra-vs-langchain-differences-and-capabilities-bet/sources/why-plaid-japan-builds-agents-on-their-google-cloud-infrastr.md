# Why PLAID Japan builds agents on their Google Cloud infrastructure with Mastra - Mastra Blog
- URL: https://mastra.ai/blog/plaid-jpn-gcp-agents
- Query: Third-party Mastra production case studies, blog posts, postmortems, and user testimonials about real-world deployments
- Published: 2025-06-15T17:09:51.000Z
## Summary

Summary:

This Mastra blog post details PLAID Japan’s shift from GUI-based AI tools to Mastra for building on Google Cloud, highlighting a real-world production deployment and the benefits gained.

Key takeaways:
- Challenge: PLAID Japan struggled with GUI/no-code tools (Dify, n8n) that broke with updates and didn’t align with their code-first, TypeScript-heavy workflow. They also faced limitations with Langchain.js type support and switching between LLM providers.
- Why Mastra: They chose Mastra because it’s TypeScript-focused, aligns with their tech stack, and enables rapid creation of agents and MCP (multi-client protocol) integrations. The team valued a code-first approach for long-term maintenance and collaboration.
- Tech integration: Deployment runs on Google Cloud (GKE, Cloud Run) with a Backend-for-Frontend (BFF) layer. They connect Mastra via the Mastra API Server from their BFF, use Mastra’s agentic and MCP capabilities, and embed the Mastra client library in the frontend. This setup allowed easy remote agent connectivity to MCP servers and rapid integration with tools like Slack.
- Productivity and collaboration: Managing AI agents as code improved visibility and collaboration across engineering teams. The playground feature aids prompt tuning and troubleshooting with traces, boosting development velocity.
- Outcomes: Easier maintenance and faster iteration for AI agent development, improved collaboration, and accessible self-managed AI agents within PLAID’s Google Cloud environment.

Note: The article focuses on PLAID Japan’s adoption story and benefits of Mastra in a production Kubernetes/Cloud Run setup; it does not provide additional third-party case studies, postmortems, or multiple testimonials beyond PLAID Japan’s perspective. If you’re seeking broader third-party case studies, postmortems, or testimonials, I can summarize other sources you provide or search for additional examples.
