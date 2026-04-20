# We Ran 12 RAG Benchmarks Across LangChain, LlamaIndex, and SynapseKit. Here’s the Honest Scorecard | by EngineersOfAI | Apr, 2026 | Medium
- URL: https://medium.com/@engineersofai/we-ran-12-rag-benchmarks-across-langchain-llamaindex-and-synapsekit-heres-the-honest-scorecard-c1f64c478a5e
- Query: Independent reports or benchmarks comparing vector‑search throughput and retriever performance in RAG pipelines built with Mastra versus LangChain
- Published: 2026-04-10T18:12:47.000Z
- Author: EngineersOfAI
## Summary

Based on the article, here’s how it relates to your query about independent benchmarks of vector-search throughput and retriever performance in RAG pipelines built with Mastra versus LangChain:

- The piece provides a disciplined, side-by-side benchmark of three RAG frameworks (SynapseKit, LangChain, LlamaIndex) across 6-12 end-to-end RAG tasks in two weeks of testing.
- It reports concrete performance outcomes and tradeoffs for each framework, including:
  - How quickly and concisely each framework can ingest PDFs and build chunked representations.
  - The relative efficiency of their built-in RAG pipelines (e.g., how many lines of code to load a PDF into a pipeline).
  - Chunking quality differences across the three frameworks.
  - Availability and integration cost of core components like BM25 retrieval (including required extra packages).
  - Variations in hybrid search configurability (weighting across retrievers) and overall retrieval flexibility.
- Key takeaways that could inform Mastra-vs-LangChain assessment:
  - SynapseKit often requires fewer lines of code to set up a RAG pipeline for PDFs, suggesting a potential throughput advantage in rapid deployment.
  - LlamaIndex offers deeper control over chunking strategies, which can impact retrieval quality and effective throughput in chunk-heavy pipelines.
  - LangChain provides strong configurability in hybrid search (per-retriever weights), which may yield best retrieval quality/throughput in mixed-retriever setups.
  - BM25 availability and setup effort vary by framework, with some requiring extra packages—important for deployment-time throughput.
- Note: The benchmarks are against SynapseKit, LangChain, and LlamaIndex, not Mastra. The article is useful for understanding relative strengths and deployment-effort implications that could extrapolate to Mastra scenarios, but it does not provide independent benchmarks for Mastra or a direct Mastra-vs-LangChain comparison.

Bottom line: If your goal is independent benchmarking of vector-search throughput and retriever performance in RAG pipelines, this article offers a detailed, reproducible comparison framework and concrete performance metrics across three popular frameworks. You can use its methodology as a template to run Mastra-vs-LangChain benchmarks, focusing on:
- end-to-end throughput (ingestion, chunking, retrieval, reranking, streaming)
- pipeline setup effort (lines of code, required components)
- retrieval quality under varying chunking and BM25 configurations
- hybrid search configurability and its impact on latency and accuracy

Would you like a concise comparison table distilled specifically for Mastra-vs-LangChain using the exact metrics from this article as a baseline?
