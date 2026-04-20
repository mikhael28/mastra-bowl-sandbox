# Benchmarking pgvector RAG performance across different dataset ...
- URL: https://mastra.ai/blog/pgvector-perf
- Query: Independent reports or benchmarks comparing vector‑search throughput and retriever performance in RAG pipelines built with Mastra versus LangChain
- Published: 2025-02-26T21:07:28.000Z
## Summary

Here’s a focused summary addressing your query about independent benchmarks comparing vector-search throughput and retriever performance in RAG pipelines built with Mastra versus LangChain.

Key takeaway
- The Mastra benchmarking article presents performance data for different pgvector indexing strategies (IVFFlat current fixed, adaptive IVFFlat, Flat, and HNSW) across dataset sizes (10K–1M vectors), varying dimensions (64, 384, 1024), and various K (10–100). It demonstrates that adaptive IVFFlat generally offers better and more stable latency (lower P95) with large datasets, while recall remains near perfect across configurations. This provides a reference baseline for vector-search throughput and latency in Mastra-based deployments, but it is not an independent, head-to-head comparison with LangChain.

What Mastra specifically covers (relevant to throughput and retriever performance)
- Throughput/latency findings:
  - Adaptive IVFFlat: notably lower P95 latencies on large datasets (e.g., 125–161 ms at 1M vectors, 64D; 60–65 ms median at 500K).
  - Fixed IVFFlat: higher latency variability and potential cluster imbalance, leading to less predictable performance.
  - HNSW and Flat baselines provided as reference points for comparison.
- Recall:
  - All tested configurations maintained high recall (often 100% for datasets > 1,000 vectors), suggesting retriever effectiveness remains strong across indexing strategies.

What the article implies for RAG pipelines
- For Mastra-based RAG pipelines, using adaptive IVFFlat indexing can improve retrieval latency at scale without sacrificing recall, improving end-to-end throughput under heavier workloads.
- Fixed IVFFlat can exhibit latency spikes due to uneven data distribution across clusters, which may degrade throughput consistency in production.
- HNSW offers an alternative with its own build-time and configuration tradeoffs; it serves as a strong benchmark for comparing throughput against vector-search methods.

Implications for independent benchmarking (Mastra vs LangChain)
- Mastra’s results are not LangChain benchmarks; LangChain is a framework, whereas Mastra’s data focuses on the underlying vector search performance (pgvector indexing, recall/latency).
- To compare Mastra and LangChain in practice, you would need independent, controlled benchmarks that:
  - Use identical datasets (same vectors, dimensions, distributions)
  - Use equivalent retriever components (e.g., a pgvector-based retriever) within each framework
  - Measure throughput (queries per second), tail latency (P95/P99), and retrieval accuracy (recall) under realistic load and dataset growth
- From Mastra’s findings, you can expect:
  - Mastra’s adaptive IVFFlat to yield more stable and lower tail latency, which would positively impact throughput in a LangChain-based RAG pipeline if LangChain leverages similar vector indexing (assuming similar integration and parameters).
  - Potential differences in end-to-end throughput may arise from framework overhead (LangChain vs Mastra’s tooling) rather than vector search
