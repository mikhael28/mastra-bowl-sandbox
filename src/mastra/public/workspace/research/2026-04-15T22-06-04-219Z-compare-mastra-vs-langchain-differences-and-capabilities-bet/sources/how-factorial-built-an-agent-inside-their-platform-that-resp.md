# How Factorial Built An Agent Inside Their Platform That Respects Permissions - Mastra Blog
- URL: https://mastra.ai/blog/factorial-case-study
- Query: Third-party Mastra production case studies, blog posts, postmortems, and user testimonials about real-world deployments
- Published: 2025-11-25T12:40:49.000Z
## Summary

Summary:

- Case study: Factorial built an inside-platform AI agent, One, to answer HR-related questions using company data while strictly enforcing permissions and avoiding hallucinations.
- Problem addressed: Clients were exposing sensitive data to generic AI tools, risking incorrect answers and data leakage; Factorial needed AI that operates within its HR platform with proper context and governance.
- Company context: Factorial is a Barcelona-based HR platform (1,000,000+ employees across 14,000+ companies) offering payroll, performance reviews, time tracking, expenses, and IT.
- Technical approach:
  - Architecture choice: TypeScript-friendly stack (Ruby on Rails backend, React/TypeScript frontend) and Mastra’s API layer for integration, memory, and LLM provider handling.
  - Key design: The agent runs with the same permissions as the logged-in user; raw data never exposed to the AI; permission enforcement happens at the architecture level, not via prompts.
  - Data handling: Built-in memory layer and robust retrieval to handle 16+ internal products, ensuring data provenance and context.
- Core policies:
  - If data is unclear or unavailable, the agent says “I don’t know, please ask a human” rather than hallucinating.
  - Answers are anchored to user permissions; sensitive data visible to the user is accessible to the agent only if the user is authorized.
- Outcome goal: Provide HR managers and employees with natural-language access to relevant company data and policies, improving clarity on questions like PTO balances while maintaining strict governance and accuracy.

If you’re evaluating real-world AI deployments with strict permission controls and minimal hallucination risk, this case demonstrates a scalable approach to building an in-platform agent that respects granular access controls and avoids data leakage.
