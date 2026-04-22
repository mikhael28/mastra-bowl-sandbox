# API Rate Limits - monday Support
- URL: https://support.monday.com/hc/en-us/articles/26471164460690-API-Rate-Limits
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2026-04-16T01:15:26.124Z
## Summary

Summary:

This article explains monday.com’s API rate limits and best practices to help developers design reliable integrations. Key points relevant to your query (REST/GraphQL, webhooks, rate limits, and automation context) include:

- Types of rate limits:
  - Complexity Limit: controls query heaviness; optimize queries, avoid deep nesting, use pagination.
  - Daily Call Limit by plan:
    - Free/Trial: 200
    - Basic/Standard: 1,000
    - Pro: 10,000 (soft limit)
    - Enterprise: 25,000 (soft limit)
    - Error: DAILY_LIMIT_EXCEEDED; fix by reducing calls or waiting for reset (midnight UTC). Enterprises can request increases via API analytics dashboard.
  - Minute Rate Limit: caps queries per minute; reduce request frequency and use Retry-After header to retry.
  - Concurrency Limit: limits simultaneous calls; reduce parallel requests and implement retry/backoff.
  - IP Limit: 5,000 requests per 10 seconds from a single IP; pause and retry as indicated by the response.
- General guidance:
  - All requests count toward limits, including failed ones.
  - Do not immediately retry after a rate limit error; respect retry_in_seconds from the response.
  - The SDK handles rate limits and retries automatically.
- Developer resources:
  - Rate Limits Documentation and API Reference for deeper details.
  - If optimizing usage or exceeding limits, contact support for guidance.
  - Webhooks, automation primitives, and broader API usage are covered in the developer docs and rate-limits docs.

Implications for your specific topics:
- REST/GraphQL: Design with complexity controls, pagination, and per-plan rate ceilings in mind; monitor daily/minute/concurrency/IP limits.
- Webhooks: Ensure handlers are efficient to avoid excessive calls; account for retries and backoff on failures.
- Board/Column as custom-object patterns: Keep queries lean, use pagination, and cache results when possible to stay within limits.
- Email-sync behavior: Align sync frequency with daily/minute limits; implement incremental syncing to reduce call volume.
- Automation primitives: Build lightweight automations; avoid heavy nested queries; utilize retries with backoff when rate-limited.

If you want, I can tailor a concise usage checklist or a sample rate-limiting retry strategy (with pseudo-code) for your specific integration.
