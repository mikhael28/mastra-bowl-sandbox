# Qdrant Vector Store - Mastra
- URL: https://www.mintlify.com/mastra-ai/mastra/integrations/vectors/qdrant
- Query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage
## Summary

Summary tailored to your query:
- Topic: Production-readiness and scalability of Mastra-integrated vector stores using Qdrant.
- Key capabilities:
  - Qdrant as an open-source vector store optimized for high-performance similarity search with rich filtering and on-premise deployment.
  - Easy local deployment and cloud options (Docker, Qdrant Cloud) for scalable indexing and retrieval.
  - Mastra integration: seamless wiring of QdrantVector into Mastra’s configuration to manage embeddings as a vector store.
- Performance and scalability signals:
  - Support for large dimensional vectors (example uses 1536-dim) and cosine similarity metrics.
  - Advanced filtering (must/should/must_not) enables efficient, selective retrieval in production workloads.
  - Index management: createIndex (collection), upsert of vectors with metadata, update, and delete operations for dynamic datasets.
  - Pagination and topK-based results for scalable ranking.
- Operational considerations:
  - Deployment options: local Docker setup (port 6333) and Qdrant Cloud for managed scaling.
  - Metadata-enabled filtering reduces scan scope, aiding QPS and latency at scale.
  - API surface provided via Mastra-facing wrappers (QdrantVector) to streamline integration and monitoring.
- What to monitor in production:
  - Query latency (ms) at varying topK (e.g., 5, 10, 20) under load.
  - Index size growth with embeddings and associated metadata.
  - Throughput (queries per second) and QPS vs. CPU/memory usage.
  - Filtering impact on latency and selectivity (must/should/must_not).
  - Consistency of results when updating vectors or deleting by filter/IDs.
- Practical guidance:
  - Start with a single collection (documents, dim 1536, cosine) and validate latency/saturation.
  - Use advanced filtering to prune candidates early, improving QPS and latency.
  - Leverage Mastra’s vector orchestration to manage multiple vector stores if needed, keeping one source of truth for embeddings.
- Conclusion: The Mastra-Qdrant integration provides a robust path for production-grade vector search with scalable sizing, rich filtering, and flexible deployment, suitable for large-scale retrieval tasks while keeping operational costs manageable through on-premise or cloud deployments.
