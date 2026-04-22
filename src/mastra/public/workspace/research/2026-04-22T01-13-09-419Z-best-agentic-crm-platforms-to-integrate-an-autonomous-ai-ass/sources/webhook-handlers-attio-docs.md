# Webhook Handlers - Attio Docs
- URL: https://docs.attio.com/sdk/server/webhooks/webhook-handlers
- Query: Attio developer API documentation: webhooks, REST/GraphQL endpoints, custom object support, automation primitives, and email-sync implementation
- Published: 2025-01-22T00:00:00.000Z
## Summary

Summary:

- Topic: Attio Webhook Handlers (server-side HTTP endpoints for receiving external requests).
- Purpose: Enable apps to listen for and process inbound requests from third-party services, allowing data synchronization into Attio or on-demand data responses to external systems.
- Key requirements:
  - Files located under src/webhooks
  - Use .webhook.ts suffix
  - Export a default async function(Request) => Response
- Core concepts:
  - Webhook Handlers vs. server functions (listeners vs. initiators)
  - Useful for integrating external systems, automating workflows, and triggering Attio data updates
- Core API:
  - createWebhookHandler: create a new webhook endpoint
  - updateWebhookHandler: modify an existing webhook endpoint
  - deleteWebhookHandler: remove a webhook endpoint
- Related scope in Attio docs (as per user query):
  - Webhooks, REST/GraphQL endpoints, custom object support
  - Automation primitives
  - Email-sync implementation
- Practical takeaway: If you need to receive events from third-party services and push data into Attio or respond with data, implement webhook files in src/webhooks with the proper structure and use the webhook API to manage them.
