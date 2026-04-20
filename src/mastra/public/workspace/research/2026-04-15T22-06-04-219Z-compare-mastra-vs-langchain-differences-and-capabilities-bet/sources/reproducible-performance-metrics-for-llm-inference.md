# Reproducible Performance Metrics for LLM inference
- URL: https://www.anyscale.com/blog/reproducible-performance-metrics-for-llm-inference
- Query: Standardized benchmarking methods for evaluating LLM frameworks (agents, retrieval, RAG): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and cost-per-request
- Published: 2024-10-01T00:51:19.000Z
## Summary

Summary tailored to your query:
- Core topic: Proposes standardized, reproducible benchmarking for LLM inference to compare frameworks, agents, retrieval, and RAG setups.
- Key metrics emphasized:
  - Latency distribution: TTFT (time to first token), P50/P95/P99 latency
  - Throughput: completed requests per minute
  - Resource usage: CPU/GPU/memory utilization
  - Cost-per-request
- Practical guidance:
  - Uses an open-source benchmarking tool (llmperf/llmval) to enable reproducibility
  - Highlights that 100 input tokens have similar impact on latency as 1 output token; reducing output tokens can be more effective for speed
- Benchmark scope and findings:
  - Compares current LLM offerings (e.g., Llama 2 70B) across providers
  - Finds cost and latency trade-offs: Anyscale Endpoints often cheaper and faster than some alternatives; Fireworks.ai may offer marginally better TTFT at high load
  - End-to-end latency and per-token pricing discussed, with caveats about variations by use case
- Practical takeaway for researchers and practitioners:
  - Use standardized metrics for fair comparisons
  - Consider output length when optimizing latency
  - Leverage open-source benchmarking tools to ensure reproducibility and transparency
- Relevance to your query:
  - Direct alignment with standardized benchmarking methods for evaluating LLM frameworks, agents, retrieval, and RAG, focusing on latency (P50/P95/P99), throughput, resource use, and cost per request.
