# How Sanity Built a Content Agent That Actually Understands Your CMS - Mastra Blog
- URL: https://mastra.ai/blog/sanity
- Query: Third-party Mastra production case studies, blog posts, postmortems, and user testimonials about real-world deployments
- Published: 2026-01-16T06:57:19.000Z
## Summary

Summary tailored to your query:
- Real-world deployments and outcomes: The article covers how Sanity built a CMS-native Content Agent using Mastra to understand and modify content directly within Sanity, avoiding export/import. It includes practical results like the agent successfully updating author headshots and transforming assets in-place.
- Architecture and workflow: Key design decisions include leveraging Sanity’s Content Lake (structured, queryable data), in-app agent capabilities, and real-time streaming via WebSockets with Mastra. A schema graph (computed in Temporal, cached in Redis) links content types to relationships, enabling precise querying (e.g., “blog posts by Evan” via author references).
- Capabilities demonstrated:
  - Contextual content discovery: The agent navigates relationships, understands field descriptions, and uses business context beyond simple keyword search.
  - Schema-valid document creation: Generates documents that match the content model with correct references and types.
  - Media transformation: Capable of adjusting images to match variants and brand guidelines.
  - Gap analysis: Uses external sources (via Firecrawl) to identify industry trends and cross-checks against existing content.
- Architectural evolution: Start with 35 tools in one agent, experimented with multi-agent setups, but consolidated capabilities back into a single main agent to preserve research context, reserving sub-agents for mutation and specific tasks. For large-scale operations (e.g., 10M documents), a set-based approach was introduced to manage bulk work.
- Deployment context: The approach emphasizes in-platform AI augmentation rather than exporting data, enabling real-time, permission-aware interactions and scalable operations within Sanity’s CMS.

If you want, I can extract direct quotes or map these findings to a checklist for evaluating Mastra-powered CMS AI deployments in your own system.
