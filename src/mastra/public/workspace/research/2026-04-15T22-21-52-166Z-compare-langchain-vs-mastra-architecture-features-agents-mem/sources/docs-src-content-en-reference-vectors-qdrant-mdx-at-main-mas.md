# docs/src/content/en/reference/vectors/qdrant.mdx at main · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/reference/vectors/qdrant.mdx
- Query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage
## Summary

Summary for query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage

- This Mastra doc describes the Qdrant vector store integration, focusing on production-ready usage, scalability considerations, and practical API details.
- Key components:
  - QdrantVector class: provides vector storage, similarity search, payload management, and extended filtering.
  - Constructor options: url, apiKey, https (TLS) for secure, scalable connections.
  - createIndex: supports single-vector and namedVectors collections; dimension and metric (cosine, euclidean, dotproduct) specify similarity behavior. Named vectors allow multiple vector spaces per collection (e.g., text and image).
  - upsert: supports upserting into named vector spaces, enabling per-space indexing and updates.
  - query: supports named vectors; use the using parameter to target a specific named vector space; returns topK results.
  - listIndexes, describeIndex: provide index enumeration and statistics (dimension, count, metric).
  - deleteIndex: remove an index.
  - updateVector / deleteVector / deleteVectors: allow updating or removing vectors by ID or by metadata filter; supports partial updates and bulk deletions.
- Relevance to scalability studies:
  - QPS and latency depend on index design (single vs. multiple named vectors), vector dimensions, and chosen metric.
  - NamedVectors feature influences per-query overhead and resource usage, as multiple vector spaces can increase storage and indexing complexity.
  - TLS/Secure connections impact connection pooling and throughput in production.
  - Upsert/delete operations affect write throughput and index maintenance, impacting latency during bursts.
  - Observability points: dimension, count, metric from describeIndex provide baseline metrics for sizing and performance budgets.
- Practical guidance for studies:
  - Compare QPS and latency with and without namedVectors to evaluate per-space query overhead.
  - Measure index size growth when adding multiple named vector spaces (text, image, etc.) and its effect on search latency.
  - Benchmark update/delete workloads (updateVector, deleteVector, deleteVectors) under concurrent load to assess write amplification and backpressure.
  - Ensure dimension consistency with your embedding model to avoid indexing errors and performance degradation.
  - Use cosine or Euclidean depending on data distribution; monitor how metric choice affects neighbor ranking and compute cost.
- What’s missing in this doc for full scalability evaluation:
  - Concrete benchmarks (throughput, latency percentiles, and QPS targets) across various workloads.
  - Guidance on cluster sizing, shard/replica behavior, and Qdrant deployment considerations in Mastra contexts.
  - Recommendations on batching upserts and queries for higher throughput.
  - Empirical comparisons of single-vector vs. multiple named vector spaces in production scenarios.
