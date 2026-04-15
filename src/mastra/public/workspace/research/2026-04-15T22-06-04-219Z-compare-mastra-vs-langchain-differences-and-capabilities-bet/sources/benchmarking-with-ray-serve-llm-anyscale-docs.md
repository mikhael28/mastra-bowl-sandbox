# Benchmarking with Ray Serve LLM | Anyscale Docs
- URL: https://docs.anyscale.com/llm/serving/benchmarking/benchmarking-guide
- Query: Standardized benchmarking methods for evaluating LLM frameworks (agents, retrieval, RAG): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and cost-per-request
## Summary

Summary:

- Purpose: Provides a guide to benchmark LLM deployments using Ray Serve LLM with the built-in vLLM benchmarking tool. Aims to measure throughput, latency, and end-to-end performance under realistic traffic to optimize cost, user experience, and scaling.
- What you’ll benchmark: Endpoints under configurable load (prompts per second, concurrency), capturing metrics like throughput (req/s, tokens/s) and latency (TTFT, TPOT, ITL). Produces a standardized report for cross-run comparison.
- How it works: Send prompts to your deployed model endpoint at set rates, collect responses, and generate a benchmark report.
- Prerequisites:
  - Deploy model and install vLLM benchmarking tools (pip install "vllm>=0.11.1").
  - Optional: use Hugging Face token, or OpenAI API key if required by your service.
  - For single-replica tests, disable autoscaling to avoid skew.
- Configuration essentials:
  - model: Hugging Face model ID (must match model_source in Ray Serve LLM config).
  - served-model-name: Deployment name (must match model_id in config).
  - base-url: Service endpoint (no trailing slash).
  - Tokens: OPENAI_API_KEY and HF_TOKEN if needed.
- Example context:
  - LLM config with model_id and model_source demonstrating how to align config with the benchmark.
  - Endpoint examples for cloud and local deployments.
- Practical tip: Ensure parameter consistency; mismatches between config and benchmark flags can cause failures to connect or fetch the correct tokenizer, skewing results.
- Related guidance: See talk tracks on latency/throughput metrics, autoscaling benchmarking, and advanced vLLM benchmarking workflows for deeper analysis.
