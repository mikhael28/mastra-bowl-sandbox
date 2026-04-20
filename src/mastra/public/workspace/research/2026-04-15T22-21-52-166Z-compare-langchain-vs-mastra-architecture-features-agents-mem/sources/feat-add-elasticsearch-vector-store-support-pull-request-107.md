# feat: add ElasticSearch vector store support · Pull Request #10741 · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/pull/10741
- Query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage
- Published: 2025-12-02T05:56:09.000Z
- Author: abhiaiyer91
## Summary

Summary for query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage

- What’s new: The PR adds an ElasticSearch vector store integration (@mastra/elasticsearch) to Mastra, enabling vector similarity search using ElasticSearch 8.x+ dense_vector fields. It follows the existing OpenSearch pattern for index lifecycle and vector operations.

- Features relevant to production scalability:
  - Vector store operations: create/list/describe/delete indexes; upsert/update/delete vectors; similarity search (cosine, euclidean, dot_product); support for top-K results; optional return of vectors; MongoDB-style filters.
  - Index and vector management designed to scale: supports large dimensions and bulk operations as part of index lifecycles and upserts.
  - Query capabilities: cosine/euclidean/dot_product similarity metrics with filter support, enabling scalable, filtered retrieval in production workloads.

- Observability and testing:
  - Comprehensive test suite around index lifecycle, metrics, upsert/query, filtering, and error cases to validate behavior under production-like conditions.
  - Documentation updates include README, changelog, reference docs, and examples, aiding operational adoption.

- Operational considerations for production:
  - ElasticSearch 8.x+ dense_vector fields used for storage; requires a running ES cluster, appropriate indexing strategy, and resource provisioning (CPU, memory, disk) to handle vector operations at scale.
  - Performance characteristics (QPS, latency, and resource usage) will depend on:
    - Vector dimension and top-K settings
    - Number of concurrent queries (QPS)
    - Size of indexed vectors and total index size
    - ES cluster configuration (sharding, replication, caching)
  - The PR includes local dev tooling and ES setup guidance to reproduce testing conditions.

- Practical takeaway for your study:
  - To assess production scalability, plan benchmarks around:
    - Varying topK (e.g., 5, 10, 50) and vector dimensions
    - Concurrent query load to measure QPS vs latency
    - Index sizes (e.g., 100k–10M vectors) and their impact on upserts and queries
    - Filtered searches and complex queries (to evaluate throughput under realistic workloads)
  - Monitor ES resource usage (CPU, heap, memory for dense vectors, disk I/O) and Mastra’s vector store API overhead.
  - Evaluate end-to-end latency from request to result, including network latency if deployed across nodes.

- How to try:
  - Install @mastra/elasticsearch, configure ElasticSearch 8.x+ endpoint, create an index with appropriate dimension, upsert vectors with metadata, then perform top-K similar vector queries with filters.
  - Use provided examples and docs in the PR to replicate production-like scenarios.

If you want, I can extract a concrete benchmarking plan (datasets, test scenarios, and metrics) tailored to your ES cluster size and expected user load.
