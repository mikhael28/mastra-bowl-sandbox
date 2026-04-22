# Changelog - Copper Developer API
- URL: https://developer.copper.com/introduction/changelog.html
- Query: Copper CRM and Monday CRM technical docs and independent evaluations: API/webhook schemas, custom object models, automation primitives, email sync details, and rate limits (2026 sources preferred)
- Author: Copper
## Summary

Here’s a concise, user-focused summary of the page you provided.

What this page is
- A changelog for the Copper Developer API, detailing new features, endpoint updates, and enhancements by date.

Key recent updates (most relevant to developers and integrations)
- Feb 24, 2026: Added logo_mini_url in account details responses.
- Aug 15, 2025: Made primary contact optional when creating opportunities.
- Mar 10, 2025: Introduced an endpoint to list field layouts by entity type.
- Jan 9, 2025: Added bulk create opportunities endpoint.
- Dec 5, 2024: Optional tag_names_only parameter added to the tags index endpoint.
- Nov 11, 2024: Expanded pipeline and opportunity endpoints with new fields (type, is_revenue, pipeline_type, pipeline_is_revenue).
- Oct 30, 2024: Primary contact can be used as a filter for list opportunities.
- Jun 19, 2024: Fetch current API user endpoint added; OAuth2.0 flow clarified.
- Apr 24, 2024: Primary contact management on company records introduced.

Notable historical items and context
- 2023–2022: Various enhancements including OAuth2.0 support, webhook header support, search by IDs, new field visibility (is_filterable), and API-related defaults and field enhancements.
- 2023: Introduction of Bulk APIs (beta) for bulk-create/update of multiple entities.
- Earlier items show ongoing maturation of authentication, field definitions, and error handling.

What this means for developers working with Copper API
- If you rely on account details, you can expect a logo_mini_url now.
- Opportunities and filtering are more flexible (optional primary contact, new filters).
- You can perform bulk operations (opportunities, people, leads, etc.) via new/beta endpoints.
- You have finer control over data retrieval (field layouts by entity type, tag filtering options).
- New or updated fields across pipelines and opportunities can affect data mapping and reporting.
- OAuth2.0 remains supported and clarified for integrations.

If you’re evaluating for your integration, consider:
- Do you need bulk creation/update workflows? Look at the bulk APIs.
- Do you require additional filters or optional fields (e.g., primary contact) to simplify UI flows or automations?
- Are you relying on specific fields in pipelines or opportunities that were added (type, is_revenue, etc.)?
- Will you display account branding (logo_mini_url) in your UI?

Would you like a diff-style update note highlighting changes relevant to a specific API surface (accounts, opportunities, pipelines, webhooks), or a targeted checklist for migrating an existing integration to incorporate these changes?
