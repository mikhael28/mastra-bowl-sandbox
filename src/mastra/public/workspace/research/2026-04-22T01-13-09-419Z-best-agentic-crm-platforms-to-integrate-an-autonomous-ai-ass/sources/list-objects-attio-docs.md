# List objects - Attio Docs
- URL: https://docs.attio.com/rest-api/endpoint-reference/objects
- Query: Attio developer API documentation: webhooks, REST/GraphQL endpoints, custom object support, automation primitives, and email-sync implementation
## Summary

Summary for: Attio developer API documentation: webhooks, REST/GraphQL endpoints, custom object support, automation primitives, and email-sync implementation

Key takeaways:
- REST API endpoints: Access the Attio API via https://api.attio.com with OpenAPI spec v2.0. Highlights include core object operations (list, create, read, update, delete) for system-defined and user-defined objects, and how records, lists, entries, and attributes interrelate.
- Webhooks: Support for webhook events to notify you about changes in objects, records, lists, and other workspace activities. Ideal for real-time integrations and automation triggers.
- GraphQL: Attio exposes a GraphQL interface in addition to REST, enabling flexible queries for objects, records, lists, and related metadata.
- Custom object support: Create and manage custom objects (in addition to standard objects like People, Companies, Deals). Custom objects have schema (attributes) and can be included in lists and views. Supports defining complex attributes and relationships.
- Automation primitives: Built-in automation capabilities to model processes, including creating lists, entries, and automations that respond to events or data changes.
- Email-sync implementation: Mechanisms to sync emails with Attio records, enabling email-based activity capture and association with relevant objects and entries.
- Security and scopes: Access controlled via OAuth2 scopes (e.g., object_configuration:read). Ensure appropriate permissions for endpoints and webhooks.
- Documentation organization: Core concepts include Objects, Lists, Attributes, Records, Entries, and SCIM (groups, schemas, users) for provisioning. Other related areas include file storage, notes, meetings, and workspace members.
- How to get started: Use the OpenAPI spec for endpoint details, and consult the Objects and Lists guide for modeling data, relationships, and common patterns across REST and GraphQL usage.

Best for:
- Developers integrating Attio data into apps, automations, or analytics.
- Building custom objects and complex data models with associated lists and entries.
- Setting up real-time workflows via webhooks and automations.
- Implementing email-based activity capture and syncing with Attio records.

If you want, I can extract direct API endpoint patterns, key webhook event types, or walk you through a sample REST/GraphQL query relevant to your use case.
