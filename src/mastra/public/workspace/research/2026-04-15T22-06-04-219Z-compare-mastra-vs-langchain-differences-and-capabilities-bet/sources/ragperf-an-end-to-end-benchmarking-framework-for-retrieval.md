# RAGPerf: An End-to-End Benchmarking Framework for Retrieval ...
- URL: https://arxiv.org/html/2603.10765v1
- Query: Standardized benchmarking methods for evaluating LLM frameworks (agents, retrieval, RAG): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and cost-per-request
- Published: 2026-03-11T00:00:00.000Z
## Summary

Summary:
RAGPerf presents an end-to-end benchmarking framework for retrieval-augmented generation systems, designed to profile and compare RAG pipelines across their modular components (embedding, indexing, retrieval, reranking, generation). It enables configurable experiments over diverse workloads (text, PDF, code, audio) and supports multiple embeddings, vector databases (LanceDB, Milvus, Qdrant, Chroma, Elasticsearch), and LLMs. The framework automates collection of end-to-end latency measurements (P50/P95/P99), throughput, and resource usage (CPU/GPU/memory), as well as accuracy metrics (context recall, query accuracy, factual consistency) and cost-per-request. RAGPerf aims to help users understand system bottlenecks and trade-offs in domain-specific, retrieval-augmented settings, offering reproducible experiments and open-source tooling (GitHub: platformxlab/RAGPerf). If your goal is standardized benchmarking for LLM frameworks involving agents, retrieval, and RAG, RAGPerf provides a comprehensive foundation for measuring latency percentiles, throughput, resource utilization, and cost, with configurable workload generation and component-level profiling.
