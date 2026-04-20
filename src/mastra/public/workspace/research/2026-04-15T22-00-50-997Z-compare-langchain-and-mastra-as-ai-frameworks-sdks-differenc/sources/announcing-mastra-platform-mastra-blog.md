# Announcing Mastra Platform - Mastra Blog
- URL: https://mastra.ai/blog/announcing-mastra-platform
- Query: Mastra enterprise pricing, SLAs, managed platform feature matrix, and official enterprise plan documentation
- Published: 2026-04-09T05:00:48.000Z
## Summary

Summary tailored to your query: Mastra enterprise pricing, SLAs, managed platform feature matrix, and official enterprise plan documentation

- Product scope and components
  - Mastra Platform includes three main products: Mastra Studio (editor, observability, datasets, experiments, logs/traces), Mastra Server (deploys agents/workflows as production APIs with OpenAPI/Swagger, redacted secrets by default), and Memory Gateway (persistent, observational memory accessible via gateway for any framework).

- Pricing at a glance (enterprise-oriented focus)
  - Memory Gateway has its own pricing separate from Studio/Server.
  - Studio and Server share a common pricing model with a free Starter tier and a Teams tier at $250 per team per month; Enterprise pricing is Custom.
  - Starter: Free; unlimited users and deployments; observability events 100K; CPU time 24 hours; data egress 10GB.
  - Teams: $250/team/month; unlimited users/deployments; observability events not disclosed (TBD); CPU time 250 hours; data egress 100GB.
  - Enterprise: Custom pricing; unlimited users/deployments; configurable observability events, CPU time, and data egress (per agreement).

- SLAs and reliability (enterprise relevance)
  - Enterprise plans typically include custom SLA terms (availability, incident response, uptime commitments). The page notes enterprise pricing as Custom and implies higher degrees of support and guarantees but does not specify exact SLA metrics in the publicly posted material. For exact SLAs, request the official enterprise SLA document from Mastra.

- Managed platform features (enterprise capability matrix overview)
  - Studio:
    - Cloud-hosted or self-hosted options; full agent lifecycle with an editor (no-code prompts editing, tool swapping, display conditions, versioning, comparisons, rollback).
    - Observability: metrics on cost, errors, latency across runs; detailed logs and traces for all agent executions.
    - Datasets and Experiments: curated runs (ground truth, edge cases, failures, regressions) and replay capabilities for comparison across prompts/models/tools.
    - Access control: Studio Auth and role-based access control for viewing/editing/executing.
  - Server:
    - Production-grade deployment of agents/workflows with REST endpoints, OpenAPI/Swagger docs, and secured endpoints via the same auth system as Studio.
    - Deployment via CLI and CI/CD integration; domain provisioning, build logs, env var management, managed storage.
  - Memory Gateway:
    - Observational memory technology; persistent memory across calls.
    - External accessibility outside the Mastra ecosystem; API gateway support (Python, TypeScript, or any framework).

- Documentation and enterprise resources
  - The page links to detailed product information for Studio, Server, and Memory Gateway, and mentions related blog posts (e.g., Studio agent editor, metrics, datasets/experiments) that describe capabilities in depth.
  - For official enterprise plan documentation, SLAs, and feature matrix, you should request the Mastra enterprise documentation or contact Mastra sales directly,
