# How to configure webhooks
- URL: https://docs.attio.com/rest-api/how-to/webhooks
- Query: Attio developer API documentation: webhooks, REST/GraphQL endpoints, custom object support, automation primitives, and email-sync implementation
- Published: 2025-01-22T00:00:00.000Z
## Summary

Summary tailored to your query

What this page covers
- Attio’s webhook system: how to configure, manage, and use webhooks to receive real-time HTTP requests about changes in Attio.
- Two creation paths: via API (REST endpoints) and via the settings page in the Developer/Settings area.

Key capabilities and use cases
- Real-time data syncing and automation: build ETL pipelines, live automations, or integrate Attio events with external services (e.g., Zapier-powered workflows).
- Filtering and delivery control: webhook API supports filtering to deliver only selected events; you can tailor which changes trigger notifications.

Creating webhooks
- API-based creation: Use the webhooks REST endpoints to create, update, delete, and view webhooks. Suitable for developers building multi-tenant integrations or automated provisioning.
- Settings-page creation: Create webhooks directly in the developer settings UI for quicker, manual setup or testing.

Authentication and security
- Webhooks require authentication where applicable and should be configured with secure target URLs (HTTPS) and proper handling of delivery retries and idempotency.

Delivery and reliability
- Delivery attempts: Webhooks implement retry logic; plan for transient failures with idempotent processing on the receiver side.
- HTTPS requirement and IP considerations are documented to ensure secure and reliable delivery.

Payloads and events
- Event types include a range of changes such as entry, note, task, and workspace events (and their attributes/contents).
- Payloads are structured to reflect the Attio objects and changes, enabling precise downstream processing.

Migration and compatibility
- If migrating from V1 webhooks, there’s a migration guide with step-by-step instructions to align with current API features and payload structures.

How to get started
- Decide between API-based creation (for automation and multi-tenant setups) or settings-page creation (for quick, manual setups).
- Review the webhook reference for event types and payload schemas.
- Implement appropriate filtering, secure endpoints, and idempotent handling on your webhook receivers.
- Test webhooks to confirm delivery, payload structure, and retry behavior.

For deeper detail and exact endpoints, refer to:
- Webhooks API reference (REST endpoints)
- Webhook event and payload documentation (entry.created, entry-attribute.updated, note events, etc.)
- Step-by-step migration guide (if upgrading from V1)

If you want, I can extract the specific REST endpoints, example payloads, or filtering syntax to target your exact use case (e.g., real-time sync for a custom object or a particular event type).
