# RAG Frameworks: LangChain vs LangGraph vs LlamaIndex
- URL: https://aimultiple.com/rag-frameworks
- Query: Community or academic reproducible experiments comparing RAG effectiveness across frameworks (LangChain or Mastra) with shared datasets and evaluation metrics
## Summary

Summary:

- The article benchmarks five RAG frameworks (LangChain, LangGraph, LlamaIndex, Haystack, DSPy) using a unified, reproducible setup: GPT-4.1-mini, BGE-small embeddings, Qdrant retriever, Tavily web tool, and a shared token cap.
- Goal: isolate framework overhead and token efficiency by running identical agentic RAG workflows across frameworks.
- Key findings:
  - Framework overhead is small but measurable (roughly 3–14 ms per query); most latency comes from external I/O (LLM calls, tools).
  - Performance (token usage) generally tracks token efficiency: Haystack and LlamaIndex are among the lowest, DSPy and LangGraph around 2.0k–2.0k tokens, LangChain highest (~2.4k tokens).
  - Latency differences are influenced by routing decisions and early task choices (retriever vs web vs calculator); slight differences in prompt formatting, context assembly, and routing tie-breaks impact tokens and time.
  - All five implementations achieved 100% accuracy on the test set under the standardized conditions.
- Shared architecture (for fair comparison):
  - Router: hybrid model-heuristic to decide retriever, web search, or calculator.
  - Document retrieval: top 5 from Qdrant with normalized embeddings.
  - Document grading: LLM judge; irrelevant docs trigger web search.
  - Answer generation: deterministic LLM with shared context token cap.
  - Answer grading: second LLM judge for groundedness.
- Practical takeaway: When choosing a RAG framework for reproducible experiments, expect small orchestration overhead but meaningful differences in token efficiency and routing behavior; the “DNA” of a framework (prompt serialization, context assembly, routing tie-breaks) drives persistent gaps more than raw orchestration time.
mpact both latency and token counts.

- Why differences persist (the “DNA” explanation)
  - Minor framing differences: prompt/serialization and context assembly vary subtly by framework, affecting token counts.
  - Routing tie-breaks: framework-specific handling of router outputs can shift initial tool choices in edge cases.
  - Overall, token footprint is the primary driver of cost, with framework execution time playing a secondary role.

- Shared RAG architecture (consistent across all frameworks)
  - Router: hybrid model-and-heuristic node directing to retriever, web search, or calculator.
  - Retrieve: top 5 documents from Qdrant using normalized embeddings.
  - Grade: LLM-based document grader.
  - Grader/Dataset: standardized evaluation rubric and datasets to enable reproducible comparisons.

- Practical takeaway for researchers
  - If your goal is minimal latency and token usage under a standardized RAG setup, DSPy, Haystack, and LlamaIndex are generally stronger performers than LangChain and LangGraph.
  - Small implementation details (prompt formatting, context assembly
