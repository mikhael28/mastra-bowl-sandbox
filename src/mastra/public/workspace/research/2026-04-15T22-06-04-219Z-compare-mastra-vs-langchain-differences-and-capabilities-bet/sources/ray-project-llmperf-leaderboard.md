# ray-project/llmperf-leaderboard
- URL: https://github.com/ray-project/llmperf-leaderboard
- Query: Standardized benchmarking methods for evaluating LLM frameworks (agents, retrieval, RAG): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and cost-per-request
- Published: 2023-12-21T07:09:45.000Z
## Summary

Summary:
This repository documents an LLM performance leaderboard built on the LLMPerf framework to benchmark inference providers. It focuses on transparent, reproducible measurements of key metrics relevant to evaluating LLM frameworks, including agents, retrieval, and RAG systems. Core metrics include:

- Output tokens throughput (tokens/s): average rate of emitted tokens per second across 150 requests per provider.
- Time to first token (TTFT): responsiveness up to the first token, important for streaming/chat workloads.
- Latency profiles (P50, P75, P95, P99) and distribution for each provider/model.
- Resource usage signals (implied through run configurations and hardware context).

Benchmark setup and reproducibility:
- Run configuration template using LLMPerf’s token_benchmark_ray.py with parameters for prompt length (mean-input-tokens 550), target output length (mean-output-tokens 150), concurrency (5), and 150 total requests per provider.
- Tested models include 7B, 13B, and 70B LLama-2 variants, across multiple frameworks/providers (e.g., anyscale, bedrock, fireworks, groq) using various backends (litellm, OpenAI, etc.).
- Hardware context: AWS EC2 i4i.large in us-west-2; results reflect this environment and can vary with location/time of day and system load.

Caveats to interpret results:
- Endpoints/backends vary by provider and may bias TTFT/throughput independently of core model capability.
- Temporal variation: results reflect a snapshot (Dec 19, 2023) and can drift with traffic/updates.
- TTFT and throughput are influenced by client location, provider ITL strategies, and system load; use as relative comparisons rather than absolute guarantees.

What this means for standardized benchmarking of LLM frameworks (agents, retrieval, RAG):
- Provides a transparent, repeatable methodology to measure latency at multiple quantiles (P50/P95/P99), throughput, and resource implications.
- Enables side-by-side comparisons of different inference providers and model sizes under consistent load, aiding decisions on deployment for latency-critical versus throughput-heavy use cases.
- Emphasizes reproducibility by documenting run configurations and expected hardware context, though users should re-run benchmarks in their own environments for exact baselines.

If you’re assessing LLM framework implementations, use this leaderboard to:
- Compare TTFT and throughput across providers for similar prompt and output lengths.
- Examine how model scale (7B/13B/70B) affects latency and tokens/s throughput.
- Consider cost-per-request in conjunction with latency and throughput, factoring in provider pricing and hardware utilization.
