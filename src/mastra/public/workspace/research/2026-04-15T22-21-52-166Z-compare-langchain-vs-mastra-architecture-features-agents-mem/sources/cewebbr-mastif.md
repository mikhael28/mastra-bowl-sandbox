# cewebbr/mastif
- URL: https://github.com/cewebbr/mastif
- Query: Reproducible benchmark repositories or scripts for comparing LLM agent frameworks (LangChain and Mastra): raw data, test harness, CI artifacts and instructions (2026)
- Published: 2025-10-15T18:39:05.000Z
## Summary

Summary:

The repository MASTIF (Multi-Agent System TestIng Framework) provides a comprehensive, reproducible benchmarking suite for evaluating multi-agent AI systems across multiple frameworks, protocols, and LLMs. It is designed to enable fair comparisons of agent reasoning, tool use, and web interaction capabilities, with emphasis on reproducibility and detailed metrics.

What it offers:
- Multi-framework and multi-model support: Works with CrewAI, Smolagents, LangChain, LangGraph, LlamaIndex, Semantic Kernel; supports HuggingFace and OpenAI models (open-source and proprietary).
- Protocol and task flexibility: Tests under various prompting/reasoning protocols (MCP, A2A, ACP, standard); supports custom tasks and Mind2Web benchmark tasks for real-world web interactions.
- Rich metrics and outputs: Tracks token usage (reasoning/output/total), latency, task understanding/deviation/completion, domain-specific performance, and tool use; outputs machine-readable JSON and human-readable summaries.
- Mind2Web integration: Enables large-scale web interaction tasks, with automatic sampling and domain breakdowns.
- Extensible and configurable: Configurable via environment variables or code to switch models/frameworks/protocols; includes a judge model evaluation option (LLM-as-a-judge).
- Practical deliverables: Example outputs (out-standard.txt, out-mind2web.txt); component and class diagrams provided in the repository.

What the user asked for (reproducible benchmarks for LangChain vs Mastra):
- Reproducible benchmarking resources: The project is designed for reproducible experiments, supporting environment-based configuration and explicit dependencies.
- Raw data, test harness, CI artifacts, and instructions: The repo includes installation steps, dependency management (requirements.txt, pip installs for core frameworks, tools, and Mind2Web-related data), and usage guidance for two test types (custom and benchmark tasks). While CI artifacts are not explicitly listed in the excerpt, the framework targets standardized outputs and experiment reproducibility.

How to use for your goal:
- Set up a controlled environment (virtualenv) per the Installation section.
- Install the core and framework-specific dependencies (LangChain, Mastra-like components, and related toolkits) and any Mind2Web data if applicable.
- Run both custom and benchmark tests to compare LangChain and Mastra-style workflows, capturing token usage, latency, task success, and domain performance.
- Analyze JSON outputs and the human-readable summaries to compare agent reasoning, tool use, and web interaction capabilities across frameworks.

Notes:
- The repository emphasizes extensibility, allowing you to swap models, frameworks, and protocols to reproduce and compare experiments between LangChain-based workflows and Mastra-like setups.
- If you need CI-ready artifacts, you may need to adapt or extend the provided outputs and logs into a CI pipeline (e.g., GitHub Actions) using the framework’s structured JSON results.
