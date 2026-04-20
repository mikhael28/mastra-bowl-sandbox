# Arize-ai/project-rosetta-stone
- URL: https://github.com/Arize-ai/project-rosetta-stone
- Query: Reproducible benchmark repositories or scripts for comparing LLM agent frameworks (LangChain and Mastra): raw data, test harness, CI artifacts and instructions (2026)
- Published: 2026-02-22T18:05:51.000Z
- Author: Arize-ai
## Summary

Summary tailored to your query
- What this is: A GitHub project comparing an identical AI shopping agent (“Wonder Toys”) implemented across multiple frameworks and instrumented with different observability platforms (No Observability, Arize Phoenix, Arize AX). It serves as a reproducible benchmark for framework developer experience and observability integration.
- Contents and structure: The repository branches the same agent across frameworks and observability tiers, with a shared imaging/data set. Key directories include:
  - no-observability/: LangChain.js (TypeScript), LangChain Python, LlamaIndex Python, Mastra (TypeScript), Vercel AI SDK (TypeScript)
  - phoenix/: same set with Arize Phoenix instrumentation
  - ax/: same set with Arize AX instrumentation
  - product-images/: ~200 AI-generated product images
  - chroma-data/: ChromaDB vector store (gitignored)
  Each subdirectory contains a self-contained Next.js app running the Wonder Toys agent.
- The agent (“Wonder Toys”): A Claude-powered chat-to-purchase assistant that:
  - Searches a 200-product inventory using semantic vector search with keyword fallback
  - Renders products with rich markdown cards (images, prices, ratings, age ranges, descriptions)
  - Allows purchases with shipping details
  - Tracks order status by ID or natural language
  - Cancels undelivered orders
  UI includes home, category chips, product detail pages, a shopping cart, and a streaming chat that renders product cards inline.
- Frameworks and observability details: 
  - LangChain.js, LangChain Python, LlamaIndex Python, Mastra, Vercel AI SDK
  - Each framework has a corresponding observability tier (no-observability, phoenix, ax) with identical agent logic, differing only in instrumentation setup.
- Relevance to your search: If you’re seeking reproducible benchmark repositories or scripts to compare LLM agent frameworks (LangChain vs Mastra) with raw data, test harnesses, CI artifacts, and instructions, this repo provides a canonical, end-to-end, framework-bridging benchmark. It includes the setup for running a consistent agent across multiple tech stacks, plus integrated observability data paths for analytics comparisons.

Direct answer to your query
- Repository purpose: A reproducible benchmark to compare multiple LLM agent frameworks (LangChain variants, Mastra, Vercel AI SDK) and their observability integrations (Arize Phoenix/AX) using a single shopping-agent use case.
- What you’ll get: 
  - Identical agent logic across frameworks
  - Separate directories for no-observability, phoenix, and ax instrumentation
  - Shared data assets (product images, ChromaDB store)
  - End-to-end app experience (search, browse, purchase, track, cancel)
  - Documentation of framework-specific components and observability integration

If you want, I can extract a quick-start checklist or CI/Harness artifacts from the repo to help you reproduce the benchmark locally.
