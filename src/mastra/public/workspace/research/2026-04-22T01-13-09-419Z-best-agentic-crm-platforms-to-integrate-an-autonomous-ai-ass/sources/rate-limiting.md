# Rate limiting
- URL: https://pipedrive.readme.io/docs/core-api-concepts-rate-limiting
- Query: Pipedrive API rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers — vendor docs and recent independent reviews
- Published: 2017-10-19T00:00:00.000Z
## Summary

Here’s a concise summary focused on your query about Pipedrive rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers:

- Rate limits and token-based system
  - Pipedrive is moving to token-based rate limits to ensure fair usage and performance.
  - New customers begin using token-based limits from Dec 2, 2024.
  - Existing customers will have a phased rollout from Mar 1, 2025, completing by Dec 31, 2025.
  - A daily token budget (per company) governs API usage; UI actions are not counted.

- Token-based details
  - Each API request consumes tokens based on endpoint cost; heavier operations cost more tokens.
  - Daily budget formula: 30,000 base tokens × plan multiplier × number of seats (+ any API token top-ups).
  - Plan multipliers:
    - Lite: 1
    - Growth: 2
    - Premium: 5
    - Ultimate: 7
  - Budget resets at midnight server time (may differ from customer time zones).

- Endpoint costs (examples)
  - Get single entity: 2 tokens
  - Get list of entities: 20 tokens
  - Update single entity: 10 tokens
  - Delete single entity: 6 tokens
  - Delete list of entities: 10 tokens
  - Search for entities: 40 tokens
  - Note: API v2 endpoints are more performance-optimized and may have lower costs.

- Custom object support
  - The provided doc excerpt does not detail custom objects or their specific token costs; it focuses on general rate limiting and endpoint costs. For precise behavior around custom objects, refer to the API Reference for v1/v2 endpoints and any custom object endpoints.

- Workflow/action limits and email sync behavior
  - The doc excerpt does not explicitly describe workflow/action limits or email sync behavior. These topics are not covered here and would require checking Pipedrive’s API/feature documentation or support resources for details.

- Pricing tiers
  - Pricing tiers affect the token budget via plan multipliers (Lite, Growth, Premium, Ultimate) which scale the daily token budget.
  - Exact per-seat pricing and top-up options would be in the pricing documentation or billing portal.

If you want, I can:
- Pull out exact implications for a specific plan (e.g., Growth vs Premium) and a given team size.
- Look up the latest API Reference endpoints and their current token costs for custom object operations.
- Search vendor docs or reviews for notes on workflow limits and email sync behavior.
