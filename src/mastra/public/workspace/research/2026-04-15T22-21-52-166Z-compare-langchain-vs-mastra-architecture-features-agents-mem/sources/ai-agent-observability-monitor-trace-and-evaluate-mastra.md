# AI Agent Observability: Monitor, Trace and Evaluate | Mastra
- URL: https://mastra.ai/observability
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
## Summary

Mastra Observability provides end-to-end monitoring and evaluation of AI agents and workflows. It captures detailed telemetry from every LLM call and agent run, including token usage, latency, prompts/completions, decision paths, tool calls, and memory operations. Key features relevant to independent audits and postmortems include:

- Production telemetry and observability: P95 latency, throughput, SLA metrics, and cost-per-query data for performance benchmarking and cost analysis.
- Agent tracing: Decorator-based instrumentation and OpenTelemetry compatibility to trace execution across local and production environments.
- Debugging and fault isolation: Clear visibility into errors and exact execution steps to facilitate postmortems.
- Evaluation and benchmarking: Mastra Scorers automatically run in the background to quantify agent quality, compare approaches, and identify improvement opportunities.
- Data handling: Interfaces with multiple observability backends (e.g., Datadog, New Relic, SigNoz, MLflow, Langfuse) and options for data storage and redaction, supporting third-party audits.

How this helps your use cases:
- Independent audits: Provides verifiable telemetry, latency/SLA metrics, and cost-per-query data alongside structured traces for reproducible reviews.
- Customer postmortems: Enables detailed root-cause analysis with complete execution traces, decision paths, and resource usage.
- Third-party benchmarks: Facilitates standardized comparisons through quantified scorers and consistent telemetry across environments.

If you’re evaluating Mastra for audits or benchmarks, look for:
- Availability of P95 latency and throughput dashboards
- Trace completeness (end-to-end agent execution and tool interactions)
- Cost-per-query reporting and SLA tracking
- Support for your preferred observability backend and data redaction controls
- Built-in agent evaluation metrics to benchmark approaches over time
