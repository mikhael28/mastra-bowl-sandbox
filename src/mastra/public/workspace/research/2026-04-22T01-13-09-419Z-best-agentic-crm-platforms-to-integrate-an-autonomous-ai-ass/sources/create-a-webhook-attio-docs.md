# Create a webhook - Attio Docs
- URL: https://docs.attio.com/rest-api/endpoint-reference/webhooks/create-a-webhook
- Query: Attio developer API documentation: webhooks, REST/GraphQL endpoints, custom object support, automation primitives, and email-sync implementation
- Published: 2023-04-27T00:00:00.000Z
- Author: ​Authorizationstringheaderrequired
## Summary

Summary for user query:
Attio’s API docs describe how to create and manage webhooks and their subscriptions (requires webhook:read-write). The OpenAPI spec is available at https://api.attio.com with endpoints like POST /v2/webhooks. Attio’s REST API centers on core objects (people, companies, deals), lists, entries, attributes, and files, with additional support for SCIM (groups, schemas, users) and meta endpoints for token info. Key concepts relevant to the query include:
- Webhooks: creation and subscription management via the REST API.
- Objects and lists: core models (people, companies, deals) and their attributes.
- Automation primitives: hooks/integration points through webhooks to automate workflows.
- Custom object support: create and work with custom objects beyond standard ones.
- Email-sync and automation: mechanisms to sync with external systems and automate processes.
- Authentication: OAuth2 security scheme for API access.

If you’re specifically implementing webhooks, start with the POST /v2/webhooks endpoint in the Attio API, ensure your OAuth2 token has webhook:read-write scope, and review the OpenAPI 3.1 spec for request/response schemas and subscription details. For broader needs (custom objects, automation, email sync), explore the Objects, Lists, Entries, and Files sections in the docs.
