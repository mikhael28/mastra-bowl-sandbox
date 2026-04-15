# Announcing Metrics and Logs - Mastra Blog
- URL: https://mastra.ai/blog/announcing-studio-metrics
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
- Published: 2026-04-01T19:09:05.000Z
## Summary

Summary for your query:

- What’s new: Mastra Studio now supports metrics, logs, and traces, delivering full observability (cost, latency, error counts) across agents, tools, and workflows. Logs are searchable and linked to traces for easier debugging.
- Why it matters: Provides aggregate visibility (cost trends, latency percentiles, error rates) plus detailed, context-rich logs (trace/span IDs, user/request IDs) to diagnose production issues.
- Key components:
  - Metrics: Dashboards tracking model costs, latency percentiles, scores, and errors.
  - Logs: Centralized, searchable logs with rich context (trace/span IDs, entity types, user/request IDs).
  - Traces: Existing tracing complemented by metrics and logs for end-to-end observability.
- How to get started (high-level):
  - Upgrade to @mastra/core 1.20.0+ and install:
    - npm install @mastra/observability @mastra/duckdb
  - Add a columnar store for observability (DuckDB initially; ClickHouse coming):
    - Configure MastraCompositeStore to route observability data to DuckDBStore for the observability domain, while keeping existing storage for other domains.
  - Wire up the exporter:
    - Use DefaultExporter to convert span events into metrics and logs and persist them to the configured storage.
- Practical note: No code instrumentation needed; Mastra auto-creates spans from agent runs, tool calls, and workflows, then exports them to your observability store.

If you’re evaluating Mastra for a production telemetry setup, this release gives you end-to-end observability (cost, latency, errors) with fast, searchable logs tightly correlated to traces.
