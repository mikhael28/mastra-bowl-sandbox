# AI Framework Comparison: Vercel AI SDK, Mastra, Langchain and Genkit - Konstantin Komelin
- URL: http://komelin.com/blog/ai-framework-comparison
- Query: Reproducible benchmarking scripts and methodology for comparing LLM frameworks (Mastra vs LangChain): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and vector-search throughput
- Published: 2025-06-19T00:00:00.000Z
- Author: Konstantin Komelin
## Summary

Summary tailored to the user query

Goal of the article
- A practical, side-by-side evaluation of four AI frameworks (Vercel AI SDK, Mastra, Langchain.js, Firebase Genkit) by implementing a set of example tasks to compare ergonomics, API design, and developer experience.

What the user asked to compare
- Mastra vs LangChain (and by extension the other two in the same group) for benchmarking methodology: latency (P50/P95/P99), throughput, resource usage (CPU/GPU/memory), and vector-search throughput.

What the article covers and key takeaways
- Example 1: Simple question
  - Vercel AI SDK and Mastra deliver clean, straightforward calls.
  - Langchain.js offers a more structured, message-based approach (SystemMessage, HumanMessage), which can be verbose for simple prompts.
  - Genkit’s approach is functional but can feel more complex due to its typing and configuration model.
  - Quick verdict: For small, direct prompts, Vercel AI SDK and Mastra are the most pleasant; Langchain.js shines in more complex, message-driven workflows; Genkit may be heavier to grok for simple tasks.

- Example 2: Creating a tool
  - Vercel AI SDK provides a concise tool-creation pattern.
  - Mastra uses an Agent abstraction, requiring object setup but keeps subsequent calls straightforward.
  - Langchain.js relies on its chain/message tooling; its structure can be more verbose.
  - Genkit’s approach remains feature-rich but potentially more boilerplate-heavy.

- Example 3: Simple question with a tool
  - The article compares how each framework composes prompts, systems, and tool usage, noting readability and ergonomics differences.

- Observations and cross-framework contrasts
  - Ergonomics: Vercel AI SDK and Mastra typically offer cleaner, more direct APIs for simple tasks. Langchain.js emphasizes modular, message-based composition, which aids complex flows but adds verbosity.
  - Model routing and integration: Mastra uses a provider-prefixed model string for routing without extra packages; Langchain.js aligns with the Python lineage and can feel more verbose in JavaScript.
  - Genkit: Strong typing and configuration can be helpful for large projects but may feel overly complex for quick tasks.
  - Overall heuristic: Choose based on task complexity and preference for API style—direct calls for simple prompts (Vercel, Mastra) vs. robust, structured workflows (Langchain.js). Genkit is best when its typing/config philosophy aligns with your project needs.

Bottom-line advice for your Mastra vs LangChain benchmarking (as per the article’s intent)
- If your primary goal is speed and simplicity for simple QA prompts or quick tool invocation, Mastra is a strong, lightweight option and often easier to set up than LangChain.js.
- If you anticipate complex multi-step conversations, orchestration, or long-term tooling pipelines, LangChain.js offers a more scalable, modular approach, despite higher verbosity.
- Use Vercel AI SDK
