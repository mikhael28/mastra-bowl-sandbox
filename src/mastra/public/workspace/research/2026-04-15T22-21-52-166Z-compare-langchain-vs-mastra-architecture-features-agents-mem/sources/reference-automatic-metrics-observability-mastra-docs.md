# Reference: Automatic Metrics | Observability | Mastra Docs
- URL: https://mastra.ai/reference/observability/metrics/automatic-metrics
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
## Summary

Here’s a concise, user-focused summary tailored to your query about independent audits, postmortems, or third‑party benchmarks reporting Mastra production telemetry (P95 latency, throughput, SLA metrics, and cost-per-query):

- What Mastra provides
  - Automatic, end-to-end metrics from traced executions without manual instrumentation.
  - Metrics are generated at span end, including duration, token usage (for model generation), and various cost-context fields when available.
  - Metrics routed via an internal event bus to DefaultExporter and persisted in DuckDB or InMemory backends.

- Key metric categories relevant to audits/benchmarks
  - Duration metrics (in ms) by span type:
    - mastra_agent_duration_ms (AGENT_RUN)
    - mastra_tool_duration_ms (TOOL_CALL, MCP_TOOL_CALL)
    - mastra_workflow_duration_ms (WORKFLOW_RUN)
    - mastra_model_duration_ms (MODEL_GENERATION)
    - mastra_processor_duration_ms (PROCESSOR_RUN)
  - Token usage metrics (only for MODEL_GENERATION spans with usage data):
    - Input: mastra_model_total_input_tokens, mastra_model_input_text_tokens, mastra_model_input_cache_read_tokens, mastra_model_input_cache_write_tokens, mastra_model_input_audio_tokens, mastra_model_input_image_tokens
    - Output: mastra_model_total_output_tokens, mastra_model_output_text_tokens, mastra_model_output_reasoning_tokens, mastra_model_output_audio_tokens, mastra_model_output_image_tokens
  - Cost context (optional, when pricing registry has a match):
    - Fields: provider, model

- What you can expect for audits/benchmarks
  - P95 latency and throughput can be inferred from duration metrics across relevant span types (e.g., MODEL_GENERATION, AGENT_RUN, TOOL_CALL).
  - SLA visibility depends on persistence backend availability (DuckDB or InMemory) and proper exporter configuration.
  - Cost-per-query details are included when the pricing registry has an entry for the provider/model; otherwise, metrics are emitted without cost data.
  - Detailed token breakdowns are provider-dependent; not all providers emit all categories (e.g., cache or audio tokens may be missing).

- Operational considerations for audits
  - Ensure DefaultExporter is enabled and DuckDB or InMemory storage is configured to persist metrics.
  - Include MODEL_GENERATION spans with usage data to capture token metrics and potential cost fields.
  - If you don’t see metrics, consult troubleshooting guidance in the Metrics reference.

If you want, I can extract the exact metric names and expected fields to cite in your audit report, or map them to a benchmarking schema (e.g., P95 latency, throughput, SLA targets, and cost-per-query) with example queries.
