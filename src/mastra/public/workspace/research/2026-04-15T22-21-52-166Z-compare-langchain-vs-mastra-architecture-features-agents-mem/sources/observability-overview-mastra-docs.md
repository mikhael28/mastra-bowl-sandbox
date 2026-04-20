# Observability overview | Mastra Docs
- URL: https://mastra.ai/docs/observability/overview
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
## Summary

Here’s a concise, user-focused summary tailored to the query:

Overview:
- Mastra observability provides end-to-end visibility for every agent run, workflow step, tool call, and model interaction through three integrated signals: Tracing, Logging, and Metrics.
- Tracing records hierarchical spans with inputs, outputs, token usage, and timing.
- Logging forwards structured, correlated log entries.
- Metrics automatically derive duration, token usage, and cost from traces, without extra instrumentation.

Why it helps:
- Debugging: Inspect full decision paths, tool interactions, and model responses to pinpoint issues.
- Performance: Monitor latency across agents, workflows, and tools to spot bottlenecks.
- Cost tracking: Track token usage and estimated costs over time.
- Reliability: Diagnose workflow failures by tracing step-by-step execution.
- Comparability: Evaluate performance before/after prompt or model changes.

How it works together:
- Tracing is the foundation: spans form traces that show the full request lifecycle.
- Metrics come from traces automatically (duration, token counts, costs) and power Studio dashboards.
- Logs are automatically linked to traces via trace/spans IDs, enabling seamless navigation from a log to its originating trace.
- All three signals share correlation IDs (trace ID, span ID, entity type/name) for easy cross-navigation.

Getting started (quick setup):
- Install: npm i or equivalent for @mastra/observability and storage backends (e.g., @mastra/libsql, @mastra/duckdb).
- Configure: Use MastraCompositeStore to route observability data (e.g., DuckDB for metrics, LibSQL for general storage).
- Example: Set up Observability with DefaultExporter (local traces) and CloudExporter (hosted Mastra Studio), and apply a SensitiveDataFilter to redact sensitive data.

What you’ll see in Mastra Studio:
- Correlated views of traces, their spans, associated logs, and derived metrics.
- Dashboards for latency, throughput, SLA metrics, and cost-per-query.
- Ability to drill from a metric spike to the exact traces and logs that produced it.

If you’re targeting a highly specific use case, such as auditing a particular workflow or comparing P95 latency before/after a change, I can tailor this summary to emphasize those aspects and map them to the relevant features (tracing granularity, log correlation, and metrics instrumentation).
