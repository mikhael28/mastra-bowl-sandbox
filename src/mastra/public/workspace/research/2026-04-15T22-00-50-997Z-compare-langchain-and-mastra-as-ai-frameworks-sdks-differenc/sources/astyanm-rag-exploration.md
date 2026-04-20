# AstyanM/rag-exploration
- URL: https://github.com/AstyanM/rag-exploration
- Query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)
- Published: 2026-02-19T11:38:15.000Z
## Summary

Summary for query: "GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)"

- This page is a repository describing a local RAG (Retrieval-Augmented Generation) system built from scratch using LangChain and LangGraph, with a strong emphasis on benchmarking and performance evaluation across multiple components. It is not specifically about Mastra, but it does provide a comprehensive end-to-end RAG pipeline with end-to-end benchmarking and streaming UI.

Key takeaways relevant to your query:
- Scope: End-to-end RAG pipeline (from chunking, embeddings, retrieval, reranking to graph-based patterns) with 10 benchmark notebooks evaluating different configurations.
- LangChain integration: Uses LangChain for building the RAG pipeline; LangGraph is used for advanced patterns (CRAG, Self-RAG, Adaptive RAG).
- Mastra: No explicit mention of Mastra in the repository description. The project centers on LangChain-based local RAG benchmarking rather than Mastra-specific tests.
- Benchmarking and metrics: Systematic component-wise benchmarking across 10 notebooks, evaluating chunking strategies, embedding models/providers, retrieval methods, query translation, routing, reranking, and advanced RAG patterns; uses a 25-question benchmark with ground truth and a composite RAGAS score (faithfulness, relevancy, precision, recall).
- Production setup: Produces a production Chainlit chat app with streaming answers, source display, conversation memory, and multiple RAG modes; emphasizes a fully local setup (no cloud dependency) and a deployable pipeline.
- Data and models: Corpus is the LangChain Python documentation (~1,500 chunks). Models include Mistral 7B and mxbai-embed-large via Ollama; demonstrates a 100% local inference workflow.
- Utility for your interest: If you’re evaluating performance/scalability of LangChain-based RAG end-to-end, this repo provides a multi-faceted benchmark framework, including streaming chat and evaluation of various components, which could serve as a reference or baseline.

Bottom line: The repository is a thorough, locally-run, LangChain/LangGraph-based RAG benchmarking project with 10 notebooks and a production-like Chainlit UI. It does not appear to include Mastra benchmarks or tests specifically for Mastra. If your goal is to compare LangChain with Mastra in end-to-end RAG, this project could serve as a rigorous LangChain benchmark framework, which you could adapt to include Mastra-based components for side-by-side comparison.
