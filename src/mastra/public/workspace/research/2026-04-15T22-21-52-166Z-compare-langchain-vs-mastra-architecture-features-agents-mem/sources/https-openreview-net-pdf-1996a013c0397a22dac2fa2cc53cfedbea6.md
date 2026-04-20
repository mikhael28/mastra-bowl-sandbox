# 
- URL: https://openreview.net/pdf/1996a013c0397a22dac2fa2cc53cfedbea63e5b4.pdf
- Query: Open reproducible tests comparing agent frameworks’ runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines — includes LangChain or Mastra artifacts 2026
## Summary

Summary:
- Topic addressed: A reproducible benchmark framework to compare the run-time efficiency of LLM agent frameworks, focusing on runtime performance metrics (P95 latency, throughput, memory), using identical LLM + Retrieval-Augmented Generation (RAG) pipelines.
- Relevance to user query: Directly aligns with your need for open, reproducible tests comparing agent frameworks’ performance. Emphasizes 95th percentile latency, throughput, and memory under consistent LLM+RAG setups.
- Key contributions:
  - Introduces AgentRace, the first benchmark dedicated to efficiency of LLM agent frameworks (not just task success), enabling controlled, reproducible comparisons across frameworks and workflows.
  - Targets metrics: runtime performance (including P95 latency), throughput, and memory usage; also considers communication overhead and tool invocation latency.
  - Supports diverse workloads and workflows to expose bottlenecks in inference, tool calls, and orchestration.
  - Provides a platform with results and an anonymous website for access (agent-race.github.io).
- Relevance to LangChain and Mastra: The benchmark is designed to evaluate popular frameworks (e.g., LangChain, AutoGen, AgentScope) and can be applied to Mastra artifacts as part of reproducible tests, assuming these frameworks are used within the tested pipelines.
- Practical takeaway: Use AgentRace to run head-to-head comparisons of LangChain vs. Mastra-backed or Mastra-like pipelines under identical LLMs and RAG configurations, capture P95 latency, throughput (queries per second), and peak/average memory, and analyze the reported bottlenecks to optimize for real-world, latency-sensitive deployments.
- How to proceed:
  1) Set up identical LLM + RAG pipelines across frameworks (LangChain, Mastra-enabled setups, etc.).
 2) Run AgentRace’s reproducible workloads to collect P95 latency, throughput, and memory data.
 3) Compare results to identify efficiency bottlenecks and average-case vs. tail latency differences.
 4) Consult the AgentRace results and mechanisms (9 insights, 12 underlying mechanisms) to guide optimization strategies.
