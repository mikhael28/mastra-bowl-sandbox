# Benchmarking pgvector RAG performance across different dataset ...
- URL: https://mastra.ai/blog/pgvector-perf
- Query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage
- Published: 2025-02-26T21:07:28.000Z
## Summary

Summary:

The Mastra article benchmarks pgvector RAG performance across dataset sizes (10K–1M vectors) and various indexing strategies (IVFFlat current/fixed, adaptive IVFFlat, flat, and HNSW) to inform production scalability for vector stores and retrievers.

Key findings:
- Recall: All approaches maintain very high recall (≈100%) for datasets beyond ~1,000 vectors, including the fixed IVFFlat setup.
- Latency: Adaptive IVFFlat consistently improves latency stability and reduces tail latency (P95) compared with fixed IVFFlat, especially at larger scales. Example highlights (64-dim vectors):
  - 1M vectors: Adaptive P95 ~125–161ms vs Fixed ~141–219ms.
  - 500K vectors: Median latency ~60–65ms (adaptive) vs ~66–70ms (fixed).
- Latency variability: Fixed IVFFlat exhibited greater variance and cluster imbalance (e.g., huge uneven vector distribution per list at larger sizes), contributing to inconsistent performance.
- Practical takeaway: Dynamic list sizing and decoupled index management (rebuilds on data changes, explicit index creation/build steps) yield better production-facing performance and stability.
- Improvements implemented by Mastra:
  - Separate table creation from index building.
  - User-controlled rebuilds to reflect data changes.
  - Intelligent, dataset-size-aware list sizing.

Implementation notes:
- Example usage shows rebuilding indices on creation and subsequent builds:
  - createIndex with buildIndex: true
  - buildIndex to refresh/index rebuild after data changes
- Emphasis on cosine similarity and adaptive list sizing to optimize for real-world growth and distribution patterns.

Relation to production metrics (QPS, index sizes, latency, CPU/memory): The study translates to improved QPS stability and lower tail latencies for larger datasets, with more balanced index structures. Adaptive IVFFlat reduces latency variance and can scale more predictably, while recall remains high across configurations. This aligns with production goals of maintaining high throughput (QPS) and consistent latency under increasing dataset sizes and diverse vector distributions.
