# LangChain API Pricing
- URL: https://agentsapis.com/langchain/api-pricing/
- Query: Third‑party total cost of ownership analyses for deploying LangChain or Mastra in production: infrastructure costs, platform (LangSmith/Mastra Cloud) fees, and LLM API spend
## Summary

Here’s a concise, user-focused summary tailored to your query about a third-party total cost of ownership (TCO) for deploying LangChain or Mastra in production, covering infrastructure, platform fees (LangSmith/Mastra Cloud), and LLM API spend.

What LangChain costs cover (according to the page)
- LangChain Framework: Free to use (MIT), open-source, no charges for local or self-hosted usage.
- LangSmith (observability/tracing): Pricing varies by plan.
  - Plans:
    - Developer: Free, 5,000 base traces/month, 14-day retention, 1 seat.
    - Plus: $39 per user/month, 10,000 base traces/month, 14-day retention, named users.
    - Enterprise: Custom pricing, retention up to 400 days, unlimited seats.
  - Extra traces: 
    - Base traces (14-day retention): $0.50 per 1,000 traces.
    - Extended traces (up to 400 days): $5 per 1,000 traces.
    - Upgrading base to extended: $4.50 per 1,000 traces.
  - Note: All invited users are billed as named seats.
- LLM API pricing (external providers, e.g., OpenAI; LangChain does not charge for LLM usage):
  - Pricing is token-based (input and output tokens) and varies by provider/model.
  - Examples (OpenAI):
    - GPT-3.5 Turbo: Input $0.0015/1K, Output $0.002/1K
    - GPT-4 Turbo: Input $0.01/1K, Output $0.03/1K
    - GPT-4 (8K): Input $0.03/1K, Output $0.06/1K
    - GPT-4 (32K): Input $0.06/1K, Output $0.12/1K
  - Other providers (Anthropic, Google Gemini, Mistral) have similar token-based pricing.
  - Costs depend on: number of prompts/calls, total input/output tokens, and model choice.

Illustrative cost insights (to inform TCO)
- If you use LangSmith Plus (example) plus an LLM like GPT-4 Turbo:
  - LangSmith Plus: $39 per user/month.
  - Traces: extra traces billed at $0.50 per 1,000; e.g., 20,000 extra traces = $10.
  - LLM usage: 500k tokens in + 500k tokens out with GPT-4 Turbo = roughly $20.
  - Example total monthly (excluding other infra) ~ $78 (Plus seats) + $5 (extra traces) + $20 (LLM) = ~$103.
- Total cost will scale with:
  - Number of LangSmith seats and included traces.
  - Actual trace usage beyond free quotas.
  - LLM provider/model choices and token volumes.
 
