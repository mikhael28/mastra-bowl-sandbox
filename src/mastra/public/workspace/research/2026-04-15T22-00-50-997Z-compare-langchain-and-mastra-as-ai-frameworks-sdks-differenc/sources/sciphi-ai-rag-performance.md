# SciPhi-AI/RAG-Performance
- URL: https://github.com/SciPhi-AI/RAG-Performance
- Query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)
- Published: 2024-07-17T15:45:57.000Z
## Summary

- The page describes the SciPhi-AI/RAG-Performance repository, a Python-based open-source benchmarking suite for Retrieval-Augmented Generation (RAG) solutions.
- Purpose: provide reliable, reproducible performance and scalability benchmarks comparing RAG frameworks.
- Key content:
  - Focus areas: throughput, latency, and ingestion performance for RAG stacks.
  - Benchmark scope includes scalable ingestion, individual file ingestion, and throughput (time, tokens per second, MB/s).
  - Datasets: Wikipedia corpus from HuggingFace Legacy Datasets used for ingestion tests.
  - Results at-a-glance:
    - Ingestion time over a large token set shows R2R performing fastest, followed by LlamaIndex (Async, then sync), Haystack, and LangChain.
    - File-level ingestion times and throughput (MB/s) across several documents (Shakespeare, Churchill, University Physics, Introductory Statistics, PDFs) with R2R generally leading in speed; other frameworks show varied performance.
- Notable metrics tables:
  - Table 1: Ingestion Time (s) for 10,008,026 tokens – R2R 62.97s; LlamaIndex Async 81.54s; LlamaIndex 171.93s; Haystack 276.27s; LangChain 510.04s.
  - Table 2: Time to ingest individual files (Shakespeare, Churchill, etc.) with R2R often fastest.
  - Table 3: MB/s throughput for same files, with R2R typically achieving higher MB/s than others.
- Relevance to your query: This repo benchmarks RAG solutions’ performance/scale, including ingestion and per-file throughput, across multiple frameworks. However, it does not explicitly mention Mastra in the content shown. It focuses on RAG performance tools and comparisons (R2R, LlamaIndex, Haystack, LangChain, RagFlow) and uses standard datasets for reproducibility.

If you specifically need end-to-end RAG, streaming, or multi-agent benchmarks comparing LangChain and Mastra, this page indicates a broader ecosystem focus but does not provide Mastra results or a direct LangChain+Mastra comparison. You may want to explore the linked projects (R2R, LlamaIndex, Haystack, LangChain, RagFlow) for end-to-end, streaming, and potentially mastra-related benchmarks, or look for a Mastra-specific benchmark repo.
