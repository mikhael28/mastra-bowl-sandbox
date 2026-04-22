# Pipedrive API Reference and Documentation
- URL: https://developers.pipedrive.com/docs/api
- Query: Pipedrive API rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers — vendor docs and recent independent reviews
- Published: 2019-01-22T10:43:47.000Z
- Author: Pipedrive Inc / Pipedrive OÜ
## Summary

Summary:

- What this page is: The Pipedrive API Reference and Documentation hub for v1 (with OpenAPI 3 support) and links to all API endpoints and related tooling.

- Key topics covered:
  - Getting started and overview of RESTful JSON API, stateless design, API token authentication, and CORS support.
  - Comprehensive endpoint list (Activities, Deals, Persons/Organizations, Leads, Notes, Files, Webhooks, Pipelines, Products, Tasks, Users, etc.) and related field resources (LeadFields, DealFields, OrganizationFields, PersonFields, NoteFields, etc.).
  - OpenAPI/Postman integration: Run in Postman, importable OpenAPI 3 specs for v1 (and v2) APIs, with tutorials for using Postman or Insomnia.
  - Authentication guidance: API tokens required; how to obtain the token from the Pipedrive app.
  - Miscellaneous: OAuth 2.0 support, legacy/advanced resources (LegacyTeams, Permissions Sets), and a note that the API uses JSON and supports cross-origin requests.

- What this means for your specific topics:
  - Pipedrive API rate limits: The page does not prominently display rate limit details in the excerpt. You may need to check the individual endpoint docs or the general API rate limits section within the full docs.
  - Custom object support: The presence of “Custom fields” resources (e.g., LeadFields, DealFields, OrganizationFields, PersonFields) implies support for custom objects/fields as part of standard objects; explicit “custom objects” terminology isn’t highlighted here—refer to field resources and any Custom Objects/Custom Fields sections in the full docs.
  - Workflow/action limits: Not specified in this excerpt; check endpoint or workflow-related sections within the full documentation (e.g., Automations, Webhooks, or Actions if present in the full API).
  - Email sync behavior: Not covered in the excerpt; likely documented under Contacts/Emails/Activity types or in the Email/Mailbox sections in the full API docs.
  - Pricing tiers: No pricing information is shown on this page; this is an API docs hub, not a pricing page. Look for a pricing or plans page on Pipedrive’s site for current tiers and limits.

- Practical takeaways:
  - If you need rate limits or performance constraints, consult the full API rate limits section within the v1/v2 docs.
  - For building with custom objects, inspect the Field resources (e.g., LeadFields, DealFields, PersonFields) and their field types, plus any Custom Object documentation if present.
  - For automation gonna rely on workflows, Webhooks, and related endpoints—start from the Webhooks and Tasks/Automation areas in the endpoint list.
  - To start coding quickly: use the OpenAPI 3 specs or “Run in Postman” feature to experiment, or import the OpenAPI YAML for v1 or v2.

- Quick links you might want:
  - API Reference main: https://developers.pipedrive
