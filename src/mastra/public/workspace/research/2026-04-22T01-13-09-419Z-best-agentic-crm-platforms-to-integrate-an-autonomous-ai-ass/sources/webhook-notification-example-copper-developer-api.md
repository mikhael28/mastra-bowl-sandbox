# Webhook Notification Example - Copper Developer API
- URL: https://developer.copper.com/webhooks/notification-example.html
- Query: Copper CRM and Monday CRM technical docs and independent evaluations: API/webhook schemas, custom object models, automation primitives, email sync details, and rate limits (2026 sources preferred)
- Author: Copper
## Summary

Summary:

- Topic coverage: The Copper Developer API webhook notification structure is demonstrated, including the HTTP POST payload format, fields, and variations for updates, computed vs. non-computed custom fields, and timestamps.
- Key payload elements:
  - ids: array of entity IDs
  - type: entity type (e.g., person)
  - event: event type (e.g., update)
  - subscription_id: webhook subscription identifier
  - secret_field(s): optional custom fields configured for security or routing
  - updated_attributes: present for update events; shows changed fields (e.g., custom_fields with field IDs and old/new values)
  - timestamp: ISO 8601 timestamp
  - headers: any custom HTTP headers configured for the webhook
- Custom field handling:
  - Non-computed (default): shows raw old/new values for custom fields
  - Computed values: can show human-readable values for certain fields (e.g., dropdowns) when custom_field_computed_values is true in the subscription
- Example payloads provided:
  - Basic update with non-computed custom fields
  - Update with computed custom fields (strings like "Apples", "Bananas")
- Practical usage implications:
  - Useful as a reference for implementing webhook listeners that ingest Copper “update” events and extract changed attributes
  - Demonstrates structure for validating signatures (secret fields) and routing via headers
- Note on scope vs. user query:
  - The Copper doc excerpt focuses specifically on webhook notification payloads and does not cover broader API schemas, data models, automation primitives, email sync, or rate limits.
- For Copper CRM vs Monday CRM:
  - The provided page is Copper’s webhook example. It does not cover Monday CRM schemas or independent evaluations.
- Suggested next steps to meet the user’s broader interests:
  - Look for Copper API docs on: authentication, rate limits, entity schemas (people, companies, deals), custom fields definitions, automation/triggers, and event types.
  - For Monday (formerly Integromat) CRM docs, search for Mondays.com API docs and webhooks, including object models and rate limits.
  - Compare independent evaluations or reviews from 2026 sources focusing on API/webhook reliability, schema consistency, and integration complexity.
  - If possible, gather side-by-side schema comparisons, especially for:
    - API/webhook schemas
    - Custom object models
    - Automation primitives
    - Email sync behavior
    - Rate limits and retry policies
