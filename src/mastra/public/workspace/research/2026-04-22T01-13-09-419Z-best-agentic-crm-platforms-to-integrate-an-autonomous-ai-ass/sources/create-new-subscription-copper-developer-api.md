# Create new subscription - Copper Developer API
- URL: https://developer.copper.com/webhooks/create-new-subscription.html
- Query: Copper CRM and Monday CRM technical docs and independent evaluations: API/webhook schemas, custom object models, automation primitives, email sync details, and rate limits (2026 sources preferred)
- Author: Copper
## Summary

Summary:
- The page explains how to create a new webhook subscription via Copper’s Developer API.
- Core API: POST https://api.copper.com/developer_api/v1/webhooks
- Required fields:
  - target: valid webhook endpoint URL
  - type: entity (lead, person, company, opportunity, project, task)
  - event: notification trigger (new, update, delete)
- Optional fields:
  - secret: key/value for authenticating requests
  - headers: custom HTTP headers sent with every notification
  - custom_field_computed_values: if true, convert dropdown field option_ids to names
- Example: create a subscription for lead updates with a secret and custom headers.
- Request/response patterns:
  - On success: JSON with id, target, type, event, secret, headers, custom_field_computed_values, created_at.
  - Common error: 422 with message like “Invalid input: Invalid URI For External Request” (e.g., invalid target URL).
- Usage notes:
  - Use secret and headers to validate and secure webhook deliveries.
  - Ensure target URL is publicly accessible and valid; invalid URLs yield 422 errors.
- Related references (in-page): Webhook properties overview and examples; supports events for lead, person, company, opportunity, project, task.

Top takeaways for a user evaluating Copper vs Monday CRM:
- Copper and Monday both expose webhook/automation primitives; Copper’s API topics include subscription creation, event types (new/update/delete), and per-subscription authentication via secret and per-request headers.
- The schema shown focuses on webhook subscriptions for data-change events, with an emphasis on validating the endpoint URL and optionally enriching fields (custom_field_computed_values).
- For broader API/webhook schemas, independent evaluations should compare: authentication models (token-based in headers vs per-subscription secret), event granularity (which objects and events are supported), rate-limits, object models, and automation primitives across both platforms.
- From 2026 sources, look for:
  - Copper: detailed webhook properties, rate limits, and any changes to supported objects or event types.
  - Monday CRM (MonDay/Unito integrations): webhook formats, custom fields, and email sync behavior, plus how they model custom objects and rate limits.
- Suggested next steps: fetch the official API docs for Copper and Monday CRM’s webhook schemas, compare their event models, field mappings, and authentication methods; look for independent developer reviews or benchmarks that cover reliability and latency, plus any 2026 updates on rate limits and email synchronization features.
