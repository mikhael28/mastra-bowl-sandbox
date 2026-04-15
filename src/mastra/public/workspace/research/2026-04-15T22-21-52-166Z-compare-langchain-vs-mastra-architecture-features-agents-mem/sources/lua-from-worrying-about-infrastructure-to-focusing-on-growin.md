# Lua: From Worrying About Infrastructure to Focusing on Growing Partnerships - Mastra Blog
- URL: https://mastra.ai/blog/lua-scaling
- Query: Mastra community and adoption signals: case studies, production deployments, integrations/partners, forum/Slack/Discord activity and StackOverflow questions
- Published: 2025-05-30T21:26:53.000Z
## Summary

Summary:
- This case study describes Lua, a fintech startup focused on connecting African businesses with customers via WhatsApp, founded by Stefan Kruger (former VP Engineering at Paystack) and Lorcan O’Cathain.
- Challenge: Lua built a custom agent infrastructure to support 100+ pre-launch customers and 4,500 end-users, aiming to serve 500k+ users at scale. They faced performance, monitoring, and debugging pains with a homegrown framework, especially under load (memory/CPU constraints, repeated LLM calls, complex stack traces).
- Solution: Lua migrated to Mastra Cloud, leveraging Mastra’s off-the-shelf primitives for workflows, agents, retrieval-augmented generation (RAG), integrations, and evals in TypeScript—matching Lua’s stack. The migration was fast and enabled rapid testing of complex orchestrations (e.g., hotel/flight bookings with end-to-end authentication).
- Deployment architecture: Lua runs Mastra agents in Hono, Docker containers within a Kubernetes cluster on AWS EKS, with Neon handling the serverless Postgres backend. They are testing a parallel Mastra Cloud deployment to compare performance and reliability before a full migration to reduce infrastructure management overhead.
- Outcome: Adoption of Mastra reduced the need to manage 100+ infrastructure components, provided built-in observability, and accelerated deployment timelines, positioning Lua to scale partnerships across African markets efficiently.

Notes on Mastra community/adoption signals (implied from this page):
- The article highlights rapid internal adoption benefits and a successful migration story, which may reflect positively on Mastra’s tooling for scaling partnerships and deployments.
- While the page itself is a case study, it serves as a concrete example of how Mastra enables fast onboarding of multiple business partners and reduces infrastructure burden, relevant to evaluating Mastra’s value proposition for production deployments.
