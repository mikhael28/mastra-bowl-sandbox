# Configuring webhooks - Attio Docs
- URL: https://docs.attio.com/rest-api/guides/webhooks
- Query: Attio developer API documentation: webhooks, REST/GraphQL endpoints, custom object support, automation primitives, and email-sync implementation
## Summary

Summary:

- Webhooks in Attio: Real-time notifications of changes via HTTPS POST requests to a target URL. Useful for real-time data syncing and automations (e.g., ETL pipelines, Zapier integrations).

- Creating webhooks:
  - API: Full CRUD capabilities for webhooks (create, update, delete, view) with advanced filtering. Essential for multi-customer integrations.
  - Settings page: Create webhooks for an integration in the developer settings. Note: Webhooks created via OAuth-token flows may not appear in developer settings.

- Authenticating webhooks:
  - Attio signs every webhook with a secret using SHA-256 HMAC on the request body.
  - Signature is sent in Attio-Signature (and X-Attio-Signature for legacy support).
  - Verify by computing your own HMAC with the same secret and comparing (timing-safe compare).
  - Example NodeJS snippet provided.

- Security requirements:
  - Webhooks must target HTTPS endpoints to protect payload confidentiality and integrity.

- Idempotency:
  - Attio includes an Idempotency-Key header to help deduplicate retries. Deliveries are at-least-once.

- Delivery behavior:
  - Attio considers 2xx responses successful. If a non-2xx is returned, delivery retries up to 10 times with exponential back-off over ~3 days.

- Additional context:
  - Filtering options are available via the webhooks API to control which events trigger notifications.
  - Webhooks are suitable for integrating with external systems, automations, and data-sync workflows.
