# langchain-ai/skills-benchmarks - GitHub
- URL: https://github.com/langchain-ai/skills-benchmarks
- Query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)
- Published: 2026-01-24T05:49:38.000Z
## Summary

Summary:

This GitHub repo, langchain-ai/skills-benchmarks, is a Python/TypeScript-driven benchmark framework for evaluating how different skill designs affect Claude Code’s or similar agents’ adherence to recommended patterns. It focuses on measuring skill documentation and implementation quality across tasks, with a strong emphasis on end-to-end evaluation, multi-task treatments, and scalable testing in sandboxed environments.

What it offers relevant to your query (public benchmarks for performance/scalability tests across LangChain and Mastra):
- Core focus: benchmarks for “skills” (production and variation sets) rather than end-to-end system-wide performance, but designed to stress-test agent skills in various configurations, including noise, dependencies, and framework choices.
- Tasks and treatments: decoupled task definitions (tasks can be combined with various treatments), enabling scalable, repeatable performance assessments across different setups (e.g., ALL_MAIN_SKILLS, LS_*, LCC_* treatments).
- Supports end-to-end evaluation: tasks are run in Dockerized sandboxes with a CLI workflow (uv run, pytest/vitest) to simulate realistic usage and measuring adherence to patterns.
- Cross-language scaffolding: Python and TypeScript scaffolds with parity in validation and task loading, which can help simulate or measure performance across multi-language agent implementations.
- Relevant for LangChain and LangSmith ecosystems: includes specific tasks under langchain and langsmith categories, covering tracing, evaluators, framework choices, and dependency remediation—useful for benchmarking behavior and reliability in those stacks.
- Extensibility: modular structure (tasks/, treatments/, skills/, scaffold/, tests/) supports adding new benchmarks to compare scaling, streaming, or multi-agent setups.

Key repository attributes:
- Primary language: Python; TypeScript and Shell also used.
- Latest release: v0.1.0 (Mar 2026). 
- Community: 6+ contributors; MIT license.
- Setup essentials: requires Python 3.11+, Node.js 20+, Docker, Claude Code CLI, and several API keys for multiple providers.
- Sample commands show how to run specific tasks with treatments and repetitions, enabling scalable performance experiments.

If you’re seeking public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent), this repo itself provides a framework to design and execute such tests. It may not host ready-made Mastra-specific benchmarks out of the box, but it offers the tooling and task treatments to build comparable cross-stack benchmarks (LangChain vs. Mastra) using its decoupled tasks and treatment system. To locate concrete, public, cross-project benchmarks, you might also check related LangChain/Mastra community repos or benchmarking suites that explicitly document end-to-end RAG pipelines, streaming workloads, and multi-agent orchestration.
