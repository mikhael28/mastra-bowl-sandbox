# How Index Built an AI-First Data Analytics Platform with Mastra
- URL: https://mastra.ai/blog/index-case-study
- Query: Independent third‑party case studies or audits of Mastra in production reporting measured telemetry: latency, throughput, SLA, or cost‑per‑query
- Published: 2025-07-25T12:40:48.000Z
## Summary

Summary:

- The article is a Mastra case study detailing how Index, a BI platform with 1,000+ customers, adopted Mastra to build an AI-first data analytics agent layer that enables natural-language data queries.
- Why they switched: They found LangChain (Python-first) incompatible with their TypeScript stack, suffering from poor type safety and inconsistent function typing. Mastra offered strong TypeScript support and reliable type safety, improving development velocity.
- Implementation highlights: Index built a supervisor agent architecture using Mastra workflows to coordinate nested, reusable components:
  - Data analyst agents for SQL generation and execution
  - Visualization workflows for chart/table creation
  - API integration tools for third-party data sources
  - Reusable nested workflows across agents
- Developer experience: The Mastra playground and dev workflow (e.g., yarn mastra dev) provided immediate visual feedback, accelerating adoption and iteration.
- Outcome focus: The case study emphasizes operational benefits (reduced cognitive load, clearer architecture, and faster development) rather than providing external production telemetry data (latency, throughput, SLA, or cost per query). No independent third-party audits or external production telemetry are reported in the article.
