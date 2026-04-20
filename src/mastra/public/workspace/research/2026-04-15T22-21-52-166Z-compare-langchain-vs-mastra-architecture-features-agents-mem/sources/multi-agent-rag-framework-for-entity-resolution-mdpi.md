# Multi-Agent RAG Framework for Entity Resolution - MDPI
- URL: https://www.mdpi.com/2073-431X/14/12/525
- Query: Community or academic reproducible experiments comparing RAG effectiveness across frameworks (LangChain or Mastra) with shared datasets and evaluation metrics
## Summary

Summary:
This MDPI Computers article presents a multi-agent Retrieval-Augmented Generation (RAG) framework for entity resolution, advancing beyond single-LLM approaches by coordinating four task-specialized agents (direct matching, transitive linkage, household clustering, and residential movement detection) within a LangGraph-based system. The framework combines rule-based preprocessing with LLM-guided reasoning to improve scalability, interpretability, and accuracy in identifying households and co-residence patterns in noisy/incomplete data. Key contributions include agent coordination patterns, shared state management, and efficiency gains (reduced tokens, calls, and runtime) demonstrated on synthetic data. For reproducible evaluation, the paper provides methodological details on agent roles and workflows, enabling replication and comparison with other RAG setups.

How this helps your query:
- If you seek reproducible experiments comparing RAG frameworks (e.g., LangChain vs. Mastra) using shared datasets, this work offers a concrete, multi-agent RAG architecture implemented with LangGraph and outlines evaluation metrics and efficiency gains, suitable as a reference implementation or baseline.
- It focuses on entity resolution tasks (household/entity linking) and provides a compositional framework that can be adapted to compare RAG effectiveness across frameworks with common metrics and datasets.
- To reproduce experiments, consult the paper’s agent definitions, pipeline steps, and performance results (token/call/runtime efficiency), and apply them to your chosen framework (LangChain or Mastra) using the same synthetic dataset structure or an equivalent public dataset.
