# Metrics overview | Observability | Mastra Docs
- URL: https://mastra.ai/docs/observability/metrics/overview
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
## Summary

Summary tailored to your query

- Mastra automatically emits production telemetry (P95 latency, throughput, SLA metrics, and cost per query) without manual instrumentation.
- Metrics are derived from completed spans and categorized into:
  - Duration: execution time for agents, workflows, tools, model calls, and processors.
  - Token usage: input/output token counts by type (text, cache, audio, image, reasoning).
  - Cost estimation: model-call cost estimated via an embedded pricing registry.
- Observability requires a separate OLAP store (not standard relational DBs); in-memory or DuckDB is suggested for local development, with ClickHouse coming soon for scalable storage.
- Benefits for audits and postmortems:
  - Traceable metrics with correlation context to drill from dashboards to the exact span.
  - Compare performance and cost across prompt/model/code changes.
  - Identify error-prone agents/tools via success vs. error rates.
- Getting started highlights:
  - Install: @mastra/observability, @mastra/libsql, and @mastra/duckdb.
  - Configure a composite store routing observability to DuckDB for storage.
  - Use Studio’s metrics dashboard for KPI visibility and configurable time ranges.
- For reference and deeper detail:
  - Automatic metrics reference: includes full metric names, labels, and cost fields.
  - Studio observability walkthrough for visualization specifics.

If you’re conducting independent audits or third-party benchmarking, you can rely on Mastra’s built-in, automatically emitted metrics (latency, throughput, SLAs, and per-query cost), all traceable back to the originating spans.
