# Vector search performance guide | Databricks on Google Cloud
- URL: https://docs.gcp.databricks.com/en/generative-ai/vector-search-best-practices.html
- Query: Production scalability studies for vector stores and retrievers integrated with Mastra: QPS, index sizes, search latency, and resource usage
- Published: 2026-03-18T00:00:00.000Z
## Summary

Summary:

- Purpose: The Databricks vector search performance guide provides practical, workload-aware guidance for tuning Mosaic AI Vector Search on Google Cloud to achieve scalable, low-latency retrieval.

- Key factors influencing performance:
  - SKU choice (standard vs storage-optimized) based on index size, latency tolerance, and cost.
  - Index size (total vectors) and embedding size (typical 384–1536).
  - Query type (ANN vs hybrid) and number of requested results (higher N increases latency).
  - Embedding management (managed vs self-managed).
  - Query load and traffic patterns (concurrency, spikes).
  - Authentication method.

- SKU guidance relevant to production scalability:
  - Standard endpoints: lower latency, best for up to ~320M vectors.
  - Storage-optimized endpoints: better cost efficiency for large indexes (tens of millions to billions of vectors) with some latency trade-off.

- Performance expectations and scale behavior:
  - Performance improves when the index fits in a single vector search unit; beyond that, latency rises and QPS plateaus (around 30 QPS for ANN in large setups).
  - Latency and throughput depend on index size, vector dimensionality, and query patterns.
  - As index size grows (e.g., from 2M+ to larger scales), both latency and QPS degrade unless tuned (e.g., through SKU choice, embedding size, and traffic handling).

- Embedding considerations:
  - Dimensionality (common dimensions: 384, 768, 1024, 1536) affects retrieval compute; higher dimensions improve quality but increase latency.
  - Lower-dimensional vectors yield faster queries and higher QPS; higher dimensions can improve accuracy at the cost of speed.

- Practical optimization patterns for production with Mastra:
  - Select SKU based on index size and latency requirements; for Mastra deployments with large indexes, consider storage-optimized configurations to balance cost and throughput.
  - Aim to keep the index within a single vector search unit when possible to minimize latency.
  - Monitor and optimize embedding size and query load to maintain target QPS and latency.
  - Plan for traffic spikes by provisioning suitable endpoints and ensuring efficient authentication and request handling.

If you’re evaluating production scalability for vector stores and retrievers integrated with Mastra, use these guidelines to:
- Size your index to stay within a single VSU where latency is lowest.
- Choose the storage-optimized SKU for very large indexes to reduce per-vector cost, accepting modest latency increases.
- Tune embedding dimensionality to balance retrieval speed against retrieval quality.
- Model and test realistic query loads to identify when QPS plateaus and where bottlenecks occur (SKU, index size, concurrency, authentication).
