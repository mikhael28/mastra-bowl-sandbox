# Building a HubSpot Agent Connector Using the HubSpot API
- URL: https://airbyte.com/agentic-data/hubspot-agent-connector
- Query: HubSpot integration patterns for autonomous AI assistants — APIs, webhooks, custom objects, workflow/actions, email sync, and pros/cons for SMB vs mid-market
## Summary

Summary tailored to your query: HubSpot integration patterns for autonomous AI assistants, focusing on APIs, webhooks, custom objects, workflows/actions, email sync, and SMB vs mid-market considerations, with pros/cons.

Key patterns and takeaways:
- Multi-tenant, scalable auth: For customer-facing AI assistants accessing HubSpot data across many accounts, use OAuth 2.0 with per-tenant authorization, scopes that align to the assistant’s needs, and a robust token lifecycle (short-lived access tokens with refresh, handling rotation and tenant-specific storage). Private app tokens are only suitable for single-account prototypes.
- Robust authentication lifecycle: Implement proactive token refresh (2–5 minutes before expiry), distributed locking to prevent concurrent refresh races, encryption for token storage, and alerting on failures. Expect 30-minute access token lifetimes with potential refresh token rotation.
- Authorization scope management: Use granular scopes per install; enforce least privilege to minimize risk in AI-assisted workflows. Scopes should align with the assistant’s tasks (e.g., read contacts, read deals, write notes or activities where appropriate).
- Rate limits and reliability: HubSpot rate limits vary by auth method and endpoint, with particular sensitivity around Search. Build queuing, backoff, and caching, plus incremental syncing via webhooks to avoid constant polling. Use association-chaining to reconstruct complete CRM context for AI agents.
- Data synchronization patterns:
  - Webhooks + incremental sync: Prefer real-time or near-real-time updates for freshness; complement with incremental backfills for historical context.
  - Schema normalization: HubSpot’s API/version fragmentation requires normalization/mapping layers to unify objects (contacts, companies, deals, tickets) across tenants and versions.
  - Association resolution: Maintain relationships (e.g., contact-to-company, deal associations) to enable rich contextual prompts for AI agents.
- Architecture considerations for production connectors:
  - Multi-tenant isolation: Each customer’s data and tokens must be isolated; tenant-aware routing and rate-limiting guards.
  - Reliability at scale: Durable queues, idempotent operations, and error handling for failed syncs or partial updates.
  - Privacy and security: Encrypt tokens at rest, strict access controls, and auditing per tenant.
- SMB vs mid-market deployment implications:
  - SMB patterns: Fewer tenants, simpler OAuth flow, faster time-to-value, potentially longer-lived tokens for internal tools; needs simpler monitoring and lower operational overhead.
  - Mid-market patterns: Larger tenant base, stricter compliance, more complex scoping, higher data volume, and more stringent uptime. Requires robust automation for onboarding, token management, and SLA-driven reliability.
- Practical integration patterns for AI assistants:
  - Use HubSpot APIs for read-heavy tasks (contacts, companies, deals, tickets) to supply context to the AI.
  - Leverage webhooks to trigger incremental updates and keep the assistant’s context fresh.
  - Employ custom objects and workflows when you need domain-specific data or actions that aren’t exposed by standard objects (e.g., agent-guided processes, approval steps, or downstream actions triggered
