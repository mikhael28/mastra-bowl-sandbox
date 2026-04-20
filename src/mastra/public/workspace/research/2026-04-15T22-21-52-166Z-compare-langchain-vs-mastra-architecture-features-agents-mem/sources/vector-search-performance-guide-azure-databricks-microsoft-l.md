# Vector search performance guide - Azure Databricks | Microsoft Learn
- URL: https://learn.microsoft.com/en-us/azure/databricks/generative-ai/vector-search-best-practices
- Query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage
- Published: 2025-08-06T00:00:00.000Z
- Author: mssaperla
## Summary

Summary tailored to your query: Production scalability studies for vector stores and retrievers integrated with Mastra, focusing on QPS, index sizes, search latency, and resource usage.

- Core guidance: Vector search performance is influenced by SKU choice, index size, embedding size, query type (ANN vs hybrid), number of results, embedding management, traffic load, and authentication. Performance is a range and varies with workload and configuration.

- SKU guidance (affecting latency and cost):
  - Standard: best for latency-critical workloads with index up to ~320M vectors; typical latency 20–50 ms; QPS ~200+; supports up to 320M vectors; Vector Search Unit (VSU) size ~2M.
  - Storage-optimized: cheaper per vector and higher index sizes; higher latency (300–500 ms) but better for very large indexes (up to ~1B vectors); QPS ~30–50; VSU 64M vectors.

- Index size implications:
  - Best performance when the index fits within a single VSU; as you exceed 2M+ vectors (standard) or 64M+ (storage-optimized), latency rises and QPS plateaus around ~30 QPS (ANN).
  - Real-world throughput depends on workload specifics (filters, dimensionality, concurrency).

- Embedding size and dimensionality:
  - Typical sizes: 384, 768, 1024, 1536. Higher dimensions improve retrieval quality but increase compute cost.
  - Lower dimensionality yields faster retrieval and higher QPS; aim to the smallest dimension that preserves required retrieval quality.

- Practical performance knobs (for Mastra-integrated deployments):
  - Choose SKU based on index size and latency/throughput needs: small/latency-critical vs. very large indexes with cost considerations.
  - Aim to keep index within a single VSU when possible to minimize latency.
  - If using large indexes, expect higher latency and lower QPS; plan scaling and shard strategies accordingly.
  - Manage query load and concurrency to avoid saturation; higher result counts increase latency.
  - Align embedding type (managed vs self-managed) with your operational model and authentication method to prevent bottlenecks at the auth/connection layer.

- Example performance scaffolding (reference ranges):
  - Standard: 20–50 ms latency at ~30–200+ QPS; supports up to ~320M vectors per endpoint.
  - Storage-optimized: 300–500 ms latency at ~30–50 QPS; supports up to ~1B vectors; cost-efficient per vector.

- What to measure for Mastra deployments:
  - QPS under expected production traffic, latency distribution (p50/p95/p99), index size vs. VSU capacity, memory/CPU utilization, and authentication/connection overhead.
  - Index tuning: keep index within a single VSU when possible; monitor how performance degrades as you scale beyond it.
  - Embedding updates: frequency and size of embedding updates; impact on throughput and latency.

If you
