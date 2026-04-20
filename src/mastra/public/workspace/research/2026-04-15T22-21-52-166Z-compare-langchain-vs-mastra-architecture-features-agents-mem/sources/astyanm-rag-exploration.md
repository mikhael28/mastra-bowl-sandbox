# AstyanM/rag-exploration
- URL: https://github.com/AstyanM/rag-exploration
- Query: Community or academic reproducible experiments comparing RAG effectiveness across frameworks (LangChain or Mastra) with shared datasets and evaluation metrics
- Published: 2026-02-19T11:38:15.000Z
## Summary

Summary tailored to your query:
- Subject: Reproducible RAG experiments across frameworks (LangChain or Mastra) using shared datasets and evaluation metrics.
- What this resource offers:
  - A local, end-to-end Retrieval-Augmented Generation (RAG) workflow built from scratch, emphasizing system design and benchmarking rather than a single pipeline.
  - 10 benchmark notebooks that compare chunking, embeddings, retrieval, reranking, routing, and advanced RAG patterns against a common 25-question benchmark with expert ground truth.
  - Production-grade Chainlit chat app demonstrating multiple RAG modes, source display, and conversation memory.
  - Hybrid retrieval (BM25 + dense vectors) and cross-encoder reranking to study faithfulness and relevancy trade-offs.
  - LangGraph-based advanced RAG patterns (CRAG, Self-RAG, Adaptive RAG) with a focus on model compatibility (notably 7B models).
  - Evaluation framework (RAGAS) measuring faithfulness, relevancy, context precision/recall.
  - Fully local stack: no cloud dependencies; uses Mistral 7B and mxbai-embed-large via Ollama.
  - Configurability via YAML to swap components without code changes.
- Relevance to your query:
  - Provides reproducible experiments and benchmarking methodology across frameworks, suitable for comparing LangChain vs Mastra-like setups (the repo itself uses LangChain/LangGraph with local models but the evaluation approach is framework-agnostic).
  - Includes shared datasets (LangChain Python docs corpus and a defined 25-question benchmark) and a consistent evaluation metric suite (RAGAS).
- Key takeaways you can leverage:
  - Systematic benchmarking template for RAG components (chunking, embeddings, retrieval, reranking, routing, and patterns) to compare frameworks.
  - best-practice findings (e.g., hybrid retrieval often yields better keyword and semantic coverage; certain reranking approaches trade faithfulness for latency) to inform cross-framework comparisons.
  - A ready-to-run local reference implementation with production-grade chat UI for validating reproducibility of results.

If you want, I can extract a compact comparison matrix aligning the repo’s findings to a side-by-side LangChain vs Mastra evaluation plan, highlighting what to measure and how to document reproducibility.
