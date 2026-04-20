# Evaluating RAG Architectures on Benchmark Tasks — LangChain Benchmarks 0.0.12
- URL: https://langchain-ai.github.io/langchain-benchmarks/notebooks/retrieval/comparing_techniques.html
- Query: Community or academic reproducible experiments comparing RAG effectiveness across frameworks (LangChain or Mastra) with shared datasets and evaluation metrics
## Summary

Summary tailored to your query

Goal
- The page describes an evaluation workflow for retrieval-augmented generation (RAG) architectures using LangChain Benchmarks 0.0.12. It demonstrates reproducible experiments across different retrieval and LLM configurations, focusing on benchmark-driven comparison of RAG effectiveness.

What’s covered
- Setup and dependencies
  - Commands to install LangChain, LangSmith, LangChain Hub, LangChain Benchmarks, and related libraries (ChromaDB, OpenAI, HuggingFace, etc.).
  - Environment configuration for LangChain endpoints and API keys.
- Experimental identifiers and provenance
  - Generating a unique run ID for each experiment.
- Datasets and registries
  - Access to a registry of benchmark tasks (e.g., “LangChain Docs Q&A”).
  - Cloning a public dataset for local experimentation.
  - Filtering registry entries by Type (RetrievalTask) to select suitable tasks.
- Embeddings and retrievers
  - Example uses of HuggingFaceEmbeddings (thenlper/gte-base) for indexing and retrieval.
  - Non-chunked indexing (arbitrary document length) with a basic retriever factory.
- RAG architectures and evaluation
  - A factory pattern for creating conversational retrieval QA chains (conversational-retrieval-qa).
  - Integration with a chat model (e.g., Claude-2) for end-to-end RAG QA.
  - Use of LangSmith client to run-on-dataset evaluations with a predefined evaluation config (RAG_EVALUATION).
  - Project and metadata annotations (index method, embedding model, llm, chunking settings) for experiment traceability.
- Reproducible experiments with variations
  - Chunked retrieval: using a RecursiveCharacterTextSplitter to chunk documents (e.g., 4000 chars with 200 overlap) and a chunked retriever variant.
  - Parent-document retriever setup as another indexing strategy.
  - Running multiple experiment variants (simple index, chunked index, parent-doc index) with separate run IDs and project names for comparison.
- Results and feedback
  - Accessing aggregate feedback from test runs to compare performance and metrics across configurations.

How this maps to your query (Community or academic reproducible experiments comparing RAG across LangChain or Mastra with shared datasets and metrics)
- Reproducibility: The workflow emphasizes unique run IDs, dataset cloning, and explicit project metadata to ensure experiments are reproducible and comparable.
- Shared datasets: Demonstrates cloning and using a standardized LangChain Docs Q&A benchmark dataset, suitable as a common evaluation corpus.
- Cross-framework comparison scaffolding: The example centers on LangChain-based RAG architectures, with a clearly defined evaluation setup that could be mirrored for alternative frameworks (e.g., Mastra) by adapting task registries, retriever/LLM factories, and evaluation configurations while keeping the same dataset and metrics.
- Evaluation metrics: The RAG_EVALUATION config is used to quantify retrieval-augmented performance, enabling side-by-side comparisons across
