# We Ran 12 RAG Benchmarks Across LangChain, LlamaIndex, and SynapseKit. Here’s the Honest Scorecard | by EngineersOfAI | Apr, 2026 | Medium
- URL: https://medium.com/@engineersofai/we-ran-12-rag-benchmarks-across-langchain-llamaindex-and-synapsekit-heres-the-honest-scorecard-c1f64c478a5e
- Query: Community or academic reproducible experiments comparing RAG effectiveness across frameworks (LangChain or Mastra) with shared datasets and evaluation metrics
- Published: 2026-04-10T18:12:47.000Z
- Author: EngineersOfAI
## Summary

Summary tailored to your query:
- The article compares 12 RAG benchmarks across three frameworks (SynapseKit, LangChain, LlamaIndex) in Week 2 of the LLM Showdown, using identical workloads, reproducible on Kaggle.
- Key takeaways for RAG effectiveness and reproducibility:
  - Overall: SynapseKit performs strongest in most benchmarks; LangChain excels in hybrid search configurability; LlamaIndex shines in chunking depth.
  - Week 2 highlights:
    - PDF ingestion (RAG from PDF): SynapseKit is fastest and simplest to implement (7 lines vs 13+ for others).
    - Chunking strategies: LlamaIndex leads due to richer built-in splitters; if chunk context matters, it’s the best option.
    - BM25 availability: SynapseKit includes BM25 out of the box with rank_bm25; LangChain and LlamaIndex require extra packages, complicating deployment in restricted environments.
    - Hybrid search RRF configurability: LangChain offers the most flexible weighting with EnsembleRetriever; LlamaIndex is fixed-weight, SynapseKit intermediate.
- Week-by-week results (highlights):
  - Week 2 final scores: SynapseKit 15, LlamaIndex 11.5, LangChain 9.5.
  - Two-week totals (Week 1 + Week 2): SynapseKit 30, LlamaIndex 19.5, LangChain 16.5.
- Practical implications for researchers and practitioners:
  - If you need minimal code, straightforward RAG pipelines, and strong overall performance, SynapseKit is a strong default choice.
  - If your priority is fine-grained control of retrieval behavior and weighting in hybrid search, LangChain offers the most tunable options.
  - If chunk context and multi-granularity chunking are critical for your tasks, LlamaIndex provides the best built-in strategies, albeit with potentially more setup.
- Note: The study emphasizes reproducibility across three frameworks with identical workloads; results reflect Week 2 focus areas: PDF ingestion, chunking, BM25, hybrid search, streaming latency, and memory across conversations.

Would you like a brief table mapping each benchmark to the top-performing framework and a short deployment note for each (where BM25, PDF ingestion, or hybrid search customization matters)?
