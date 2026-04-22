# Pipedrive API Essentials
- URL: https://rollout.com/integration-guides/pipedrive/api-essentials
- Query: Pipedrive API rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers — vendor docs and recent independent reviews
## Summary

Summary tailored to your query on Pipedrive API rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers:

- API type and security
  - RESTful API, JSON output, stateless with API token or OAuth 2.0 access tokens.
  - Free with every Pipedrive plan; HTTPS, encryption at rest/required security measures; OWASP-aligned practices.

- Webhooks
  - Real-time notifications via webhooks; supports events for many objects (Users, Stages, Products, Pipelines, Persons, Organizations, Notes, Deals, Activity types, Activities).
  - Up to 40 webhooks per user; wildcards allowed (e.g., *.*) and event/action/object filtering.
  - Webhooks include metadata and retry/ban handling.

- Rate limits (key focus for your query)
  - Rate limit window: 2 seconds; per token, not per account.
  - api_token (server-side) limits by plan:
    - Enterprise: 120 req/2s
    - Power: 100 req/2s
    - Professional: 80 req/2s
    - Advanced: 40 req/2s
    - Essential: 20 req/2s
  - OAuth access_token limits by plan (higher limits):
    - Enterprise: 480 req/2s
    - Power: (not fully listed in excerpt)
  - Practical takeaway: heavier automation or higher concurrency users should prefer OAuth tokens (higher ceiling) and plan choice influences throughput.

- Custom object support
  - The page references “custom object support” in context of pricing and general API capabilities; implies Pipedrive supports custom objects via the API, though exact endpoints or limits aren’t detailed in the provided excerpt.

- Workflow/action limits
  - No explicit per-workflow or per-action limits are listed in the excerpt. Rate limits and webhook capabilities imply consideration for automated actions, but you may need to consult the full API docs for exact workflow/action quota details.

- Email sync behavior
  - Not described in the provided text. You’ll want to check Pipedrive’s API docs or email integration section for specifics on email syncing via the API or app, including rate impacts and delay expectations.

- Pricing tiers relevant to API usage
  - API access is included with all plans; higher-rate limits apply to higher-tier plans (OAuth 2.0 grants are more favorable for throughput). The excerpt lists tiers (Essential, Advanced, etc.) and their token-rate caps.

What to do next (if you need precise guidance)
- Confirm the exact OAuth limits for the Power plan and any updated tiers from the latest Pipedrive API docs.
- Look up the specific endpoints and quotas for custom objects if you plan to create/use them via the API.
- Check the dedicated section on email integration in the API docs for email sync behavior and any rate implications.
- Review the Postman/OpenAPI specification for exact webhook payloads and event types you plan to subscribe to.

If you share the exact
