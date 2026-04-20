# Mastra Tutorial: How to Build AI Agents in TypeScript
- URL: https://www.firecrawl.dev/blog/mastra-tutorial
- Query: Mastra SOC 2 Type II report PDF 2026
- Published: 2026-03-17T00:00:00.000Z
- Author: Bex Tuychiev
## Summary

Summary for query: "Mastra SOC 2 Type II report PDF 2026"

- The article is a tutorial introducing Mastra, a TypeScript framework for building AI agents with typed tools (via Zod schemas) and deterministic workflows. It demonstrates building a changelog tracker using Mastra + Firecrawl for web scraping.
- Key concepts:
  - Mastra uses typed tool definitions, structured output, and multi-step tool-calling workflows.
  - Tools are defined with Zod schemas; agents decide the call sequence.
  - Workflows are deterministic pipelines with explicit execution order, branching, and parallelism.
- What you’ll build in the tutorial:
  - An interactive agent capable of ad-hoc queries.
  - A batch-processing workflow that scrapes multiple URLs in parallel and returns typed JSON.
  - A changelog tracker that, given a library name (e.g., "Next.js"), uses Firecrawl search to locate the relevant changelog page, scrapes it into markdown, and summarizes changes. The agent distinguishes relevant changelogs from other pages and formats output according to defined schemas.
- Relevance to SOC 2 Type II PDF request:
  - The page is a developer-focused tutorial about Mastra’s capabilities (agents, tools, workflows) and does not provide or reference SOC 2 Type II reports or PDFs.
  - It discusses integrating with Firecrawl for web data extraction, but there is no specific mention of SOC 2 reports or 2026 PDFs.
- If you’re specifically looking for a Mastra-generated, type-safe workflow that could extract and summarize a SOC 2 Type II PDF, this guide would help you:
  - Define a Mastra tool to fetch and parse a SOC 2 PDF link from a search API.
  - Use a workflow that scrapes and converts the PDF content (via suitable adapters) into structured JSON with Zod schemas.
  - Build an agent that can determine whether a given page is the SOC 2 report and extract key sections (scope, control goals, third-party audits, etc.).
- Bottom line: The page teaches how to create a typed, end-to-end agent + batch workflow in Mastra for web data (using Firecrawl), but it does not provide a SOC 2 Type II report PDF or direct access to one. To obtain the 2026 SOC 2 Type II report PDF, you’d need to search for the report from the relevant organization’s vendor/security page or compliance repository.
