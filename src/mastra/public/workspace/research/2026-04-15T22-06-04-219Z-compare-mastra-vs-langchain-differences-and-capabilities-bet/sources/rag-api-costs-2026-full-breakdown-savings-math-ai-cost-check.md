# RAG API Costs 2026: Full Breakdown + Savings Math | AI Cost Check
- URL: https://aicostcheck.com/blog/ai-api-costs-rag-applications
- Query: TCO model template for LLM framework selection (platform fees, hosting, vector DB, LLM API spend) with a worked example for 1M RAG queries/month 2026
- Published: 2026-02-23T19:00:00.000Z
- Author: AI Cost Check Team
## Summary

Summary tailored to your query: TCO model for an LLM framework (platform fees, hosting, vector DB, LLM API spend) with a worked example for 1M RAG queries/month in 2026

What this page covers
- RAG cost breakdown: embedding, vector database/infrastructure, and generation (LLM) costs.
- Common pitfall: focus on generation costs alone; embedding and infrastructure matter for accurate budgeting.
- Real-world style cost estimates across major providers (OpenAI, Google, Mistral, etc.) and practical guidance for startups.

Three-layer cost model (high level)
- Layer 1 — Embedding costs: one-time + incremental updates when ingesting documents.
  - Typical prices (examples):
    - OpenAI embedding small: $0.02 per 1M tokens
    - OpenAI embedding large: $0.13 per 1M tokens
    - Google embedding: free within limits
  - Example: 10,000 documents @ ~2,000 tokens each = ~20M tokens → OpenAI small ≈ $0.40; OpenAI large ≈ $2.60; Google: free (within limits).
  - Takeaway: Embedding costs are modest relative to generation; scale can still matter but often not the main budget driver.

- Layer 2 — Vector database costs: infrastructure, not API usage.
  - Approximate monthly costs for 1M vectors:
    - Pinecone Starter: free up to 100K
    - Pinecone Standard: ~$70/mo
    - Qdrant Cloud: ~$30/mo
    - Weaviate Cloud: ~$25/mo
    - pgvector (self-hosted): depends on your server (e.g., ~$20/mo VPS for millions of vectors)
    - Chroma (self-hosted): free if you supply your own hardware
  - Guidance: many startups run 5M vectors on a single Postgres instance; avoid overpaying for managed vector DB until scale justifies it.

- Layer 3 — Generation costs (the largest share, 80–95% of total RAG spend)
  - Typical per-query composition:
    - System prompt: ~200 tokens
    - Retrieved chunks: 3–8 chunks × ~500 tokens = ~1,500–4,000 tokens
    - User query: ~50 tokens
    - Total input: ~2,000–4,500 tokens
    - Output: ~300–800 tokens
  - Monthly cost examples for 10,000 RAG queries/month with ~3,000 input tokens + ~500 output tokens:
    - Gemini 2.5 Flash: Input $0.75 + Output $2.00 → Total ~$2.75 per 10k queries
    - GPT-5 nano: Input $1.50 + Output $2.00 → Total ~$3.50 per 10k queries
    - Mistral Small 3.2: (example line partially shown;
