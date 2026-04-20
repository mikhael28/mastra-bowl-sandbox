# Mastra Dashboard | SigNoz
- URL: https://signoz.io/docs/dashboards/dashboard-templates/mastra-dashboard/
- Query: Independent audits, customer postmortems, or third‑party benchmarks reporting Mastra production telemetry: P95 latency, throughput, SLA metrics, and cost‑per‑query
## Summary

Summary tailored to your query:
- Purpose: The Mastra Dashboard in SigNoz provides production telemetry for Mastra workloads to support independent audits, customer postmortems, and third‑party benchmarks.
- Key metrics you can extract:
  - P95 latency over time: view latency performance and detect slowdowns or regressions.
  - Throughput/requests over time: monitor demand, peak windows, and utilization.
  - Token consumption: track total input/output tokens to assess workload size and cost drivers.
  - Model distribution: identify which Mastra LLM variants are in use to benchmark model performance and adoption.
  - Error rate and error records: quantify reliability and drill into failures with trace links.
  - Agent and tool activity: see which agents and tools are invoked to understand workflow efficiency and potential optimization.
- How it helps audits and benchmarks:
  - Provides time-series visibility of latency, throughput, and tokenization trends for independent validation.
  - Enables SLA-style assessment via P95 latency and error rates, plus per‑model performance comparisons.
  - Supports cost/per‑query evaluation through token usage metrics (input/output) and overall demand patterns.
- How to enable for reporting:
  - Set up the data source and telemetry in SigNoz as described in Mastra Observability docs.
  - Use the Mastra Dashboard template to collect and visualize the metrics above (token usage, latency, requests, model distribution, errors, and tool/agent activity).
- What to look for in reports:
  - Consistent P95 latency within SLA; identify spikes or regressions.
  - Stable throughput aligned with expected demand; flag unusual peaks.
  - Token efficiency trends by model and workload to estimate cost per query.
  - Reliability signals via error rate trends and individual error records linked to traces.
