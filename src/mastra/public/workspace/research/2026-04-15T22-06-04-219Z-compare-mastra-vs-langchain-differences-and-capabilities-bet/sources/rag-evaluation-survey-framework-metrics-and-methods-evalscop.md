# RAG Evaluation Survey: Framework, Metrics, and Methods | EvalScope
- URL: https://evalscope.readthedocs.io/en/v1.5.0/blog/RAG/RAG_Evaluation.html
- Query: Independent reports or benchmarks comparing vector‑search throughput and retriever performance in RAG pipelines built with Mastra versus LangChain
## Summary

- The page surveys RAG (Retrieval-Augmented Generation) evaluation frameworks, metrics, and methods, highlighting several tooling ecosystems used to build and evaluate RAG pipelines.
- Key frameworks discussed:
  - LlamaIndex: includes multimodal RAG evaluation tutorials (load data, build index, evaluate retriever and generator; case study uses ASL images and text).
  - LangChain: provides multimodal and semi-structured RAG tutorials and notebooks for image-text and mixed modalities.
  - Ragas: an evaluation framework focused on RAG applications; supports evaluating retriever and generator components separately; offers no-reference evaluation via LLM-based scoring; metrics include Context Precision, Context Recall, Faithfulness, and Answer Relevancy (forming the RAGAs score).
- The page explains an evaluation workflow: data preparation, vectorization, retriever setup, RAG pipeline assembly, evaluation data creation, metric computation, and end-to-end assessment.
- Practical takeaway relevant to benchmarking: these frameworks enable component-level (retriever vs. generator) and no-reference evaluation using a suite of metrics, which can be leveraged to compare throughput and performance in RAG deployments.
- While the page itself is a survey of frameworks (LlamaIndex, LangChain, Ragas, and RAGChecker), it does not provide independent benchmarks comparing Mastra vs. LangChain or direct throughput measurements. For such a comparison, consult the individual framework tutorials or external benchmarking studies.
