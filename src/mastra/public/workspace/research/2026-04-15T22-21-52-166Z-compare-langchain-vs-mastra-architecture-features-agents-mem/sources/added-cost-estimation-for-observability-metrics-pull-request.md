# Added cost estimation for observability metrics · Pull Request #14609 · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/pull/14609
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
- Published: 2026-03-23T20:02:02.000Z
- Author: epinzur
## Summary

Summary for user query:
- This PR adds a first-class cost estimation layer to Mastra’s observability metrics, enabling you to track not just performance (P95 latency, throughput, SLA) but also cost-per-tenant/model/operation.
- Key features:
  - Runtime cost estimation for model token metrics; emitted metrics include fields like estimatedCost, costUnit, provider, model, and costContext.
  - Cost context propagation across logs, metrics, and exporters, so correlation between performance telemetry and costs is preserved end-to-end.
  - Embedded pricing data and a pricing snapshot documenting the artifact, schema, and tier rules.
  - Standardized correlation context in telemetry; exporters surface cost and correlation fields as top-level telemetry.
- What this helps with for your needs (independent audits, postmortems, or third-party benchmarks):
  - You can report production telemetry alongside estimated costs (cost-per-query, cost-per-tenant, etc.) to support audits and external benchmarking.
  - You gain visibility into how latency and throughput relate to costs, aiding SLA assessments with cost context.
  - New and updated tests cover cost estimation, pricing tiers, metric emission, and correlation-context behavior to validate reliability for audits.
- Compatibility notes:
  - Requires Mastra core ≥ 1.17.0-0 and the newer observability fields/hooks.
- Practical takeaway for your search: If you’re evaluating Mastra for producing and auditing production telemetry with cost metrics, this PR provides the groundwork to publish and analyze cost-aware observability data (P95, throughput, SLA, plus cost per query/model/provider).
