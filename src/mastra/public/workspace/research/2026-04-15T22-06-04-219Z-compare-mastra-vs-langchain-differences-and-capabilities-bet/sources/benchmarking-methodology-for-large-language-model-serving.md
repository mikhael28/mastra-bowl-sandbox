# Benchmarking Methodology for Large Language Model Serving
- URL: https://www.ietf.org/archive/id/draft-gaikwad-llm-benchmarking-methodology-00.html
- Query: Standardized benchmarking methods for evaluating LLM frameworks (agents, retrieval, RAG): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and cost-per-request
- Author: Madhava Gaikwad
## Summary

Summary:

- Purpose: Defines standardized benchmarking methodologies for Large Language Model (LLM) inference serving systems, to enable fair, meaningful comparison across frameworks (including agents, retrieval, and RAG setups).
- What it covers:
  - Test configurations and reference workloads tailored to LLM serving boundaries (including streaming responses, phase separation between prefill and decode, memory-bound decoding, dynamic batching, and context-dependent performance).
  - Measurement procedures for latency and throughput that capture P50, P95, and P99 percentiles, as well as resource utilization (CPU/GPU/memory) and cost-per-request.
  - Reporting formats and statistical requirements to ensure reliable, comparable results.
- Relationship to terminology: Requires consulting the companion document Benchmarking Terminology for Large Language Model Serving to understand the metrics referenced.
- Scope limits: Provides methodology and test infrastructure guidance but does not define acceptance thresholds or endorse specific systems; focused on enabling fair comparisons rather than dictating performance targets.
- Practical takeaway for your query: Use this methodology to standardize latency (P50/95/99), throughput, and resource/cost metrics across LLM frameworks (including agents, retrieval, and RAG), ensuring measurements account for streaming outputs, phase-specific costs, dynamic batching, and input/output context effects.
