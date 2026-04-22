# Guide for optimizing API usage
- URL: https://pipedrive.readme.io/docs/guide-for-optimizing-api-usage
- Query: Pipedrive API rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers — vendor docs and recent independent reviews
- Published: 2017-10-19T19:12:11.000Z
## Summary

Summary tailored to your query

- Rate limits and token budgeting
  - Pipedrive uses a daily token budget per account (based on seats and pricing). All users/integrations share this pool.
  - OAuth-based Marketplace apps draw tokens from the end-user’s account budget; one account’s excess does not affect others.
  - Endpoints have token costs; API v2 offers optimized endpoints with lower costs (up to ~50% of v1) and stricter data validation. v2 is not backward compatible with v1; official SDKs support both.

- API usage patterns (to avoid hitting limits)
  - Avoid excessive polling. Use:
    - Rate limit headers to monitor remaining tokens and reset times.
    - Backoff/delay strategies on 429 responses.
    - Webhooks for real-time event updates when possible, instead of polling.
  - Prefer caching to reduce duplicate calls and token use.
    - Cache frequently requested data locally and leverage updated_since / updated_until query parameters to fetch only changed data when supported.

- Specific capabilities referenced
  - Custom object support and workflow/action limits: Pipedrive’s docs discuss how custom objects interact with token budgets and rate limits, with endpoint usage varying by complexity.
  - Email sync behavior and pricing tiers: While not detailed in the excerpt, vendor docs typically describe how rate limits scale with plan levels and any high-volume Email sync considerations.
  - Pricing tiers: Token budgets scale with plan and seats; higher tiers grant larger daily token allowances.

- Practical actions for developers
  - For high-traffic apps, migrate to API v2 endpoints to reduce per-call token costs and gain stronger data validation.
  - Implement webhook-based event handling wherever possible to minimize polling.
  - Monitor Rate Limit Headers and implement appropriate backoff tactics to stay within daily budgets.
  - Introduce a caching layer and use updated_since/updated_until to fetch only changed data.
  - Plan capacity based on your account’s token budget; consider plan upgrades if your app consistently nears the limit.

Notes
- If you need guidance on a specific aspect (e.g., exact token costs per endpoint, how to configure webhooks, or a migration plan to API v2), I can extract the precise details or provide a step-by-step plan.
