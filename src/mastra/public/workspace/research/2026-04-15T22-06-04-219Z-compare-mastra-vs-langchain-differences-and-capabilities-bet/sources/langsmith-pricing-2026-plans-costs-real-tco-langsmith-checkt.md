# LangSmith Pricing 2026: Plans, Costs & Real TCO - LangSmith | CheckThat.ai
- URL: https://checkthat.ai/brands/langsmith/pricing
- Query: Third‑party total cost of ownership analyses for deploying LangChain or Mastra in production: infrastructure costs, platform (LangSmith/Mastra Cloud) fees, and LLM API spend
- Published: 2026-02-13T16:20:50.000Z
## Summary

Summary for user query

- LangSmith pricing overview (2026) relevant to third-party TCO analyses for deploying LangChain in production:
  - Platforms and fees
    - LangSmith plans: Developer (Free), Plus, Team, Enterprise.
    - Core pricing (LangSmith):
      - Plus/Team: $39 per seat per month, 10,000 traces included, $0.50 per 1,000 additional traces.
      - Enterprise: Custom pricing (~$100K+/year minimum), with custom traces and self-hosting options.
      - Developer: Free, 5,000 traces/month, 14-day retention, limited to 1 seat/workspace.
  - Retention and overages
    - Base retention commonly 14 days (Developer) or longer options (Plus/Team/Enterprise) with extended retention at 9–10x the base cost.
    - Overage: $0.50 per 1,000 traces beyond included allotment.
  - Key features included across paid tiers
    - Full tracing/observability for LangChain/LangGraph apps
    - Online/offline evaluations, prompt versioning, and testing
    - Monitoring dashboards with thresholds and email alerts
    - Dataset management, annotation tools, cost tracking per trace
    - Up to 3 workspaces for env separation; basic team permissions
  - Additional context
    - Extended retention and enterprise features (self-hosting, compliance) are limited to higher tiers or custom Enterprise arrangements.
- Real-world TCO considerations (as highlighted in the source)
  - Overhead beyond base pricing (implementation/archival/operational) can multiply total ownership costs (noted as 10–15x in total cost estimates when including implementation).
  - Extended data retention (14-day base vs. extended 400-day retention) significantly increases costs (9–10x vs base data retention on some plans).
  - Comparison anchors provided against alternatives (Langfuse, Arize AI, Datadog) for evaluating total cost.
- How this informs your use case (third-party TCO for LangChain or Mastra in production)
  - Infrastructure costs: Not specified in pricing page; would depend on cloud hosting (LangSmith cloud vs. self-hosted options on Enterprise) and monitoring/data retention needs.
  - Platform fees: LangSmith pricing tiers affect monthly spend per seat and per-trace overages; choose tier based on team size and required trace volume.
  - LLM API spend: Separate from LangSmith fees; depends on your LLM provider usage (rates vary by provider, model, and usage).
  - TCO levers to model
    - Team size and seat costs (Plus/Team) vs. Enterprise custom plan
    - Desired trace retention period (14 days vs extended retention) and corresponding cost
    - Expected monthly trace volume to compute overages
    - Implementation and operational overhead (integration, data pipelines, archival)
  - Practical takeaway for budgeting
    - If you anticipate high trace volume or need long-term
