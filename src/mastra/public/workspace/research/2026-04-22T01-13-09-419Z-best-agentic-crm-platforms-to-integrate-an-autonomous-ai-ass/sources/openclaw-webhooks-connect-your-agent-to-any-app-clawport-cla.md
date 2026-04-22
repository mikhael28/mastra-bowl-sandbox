# OpenClaw Webhooks: Connect Your Agent to Any App — ClawPort | ClawPort
- URL: https://clawport.io/blog/openclaw-webhook-integrations
- Query: OpenClaw integration blueprint for CRMs: concrete auth flows (OAuth2, API keys), webhook schemas, sample API calls, middleware/MCP mapping, and recommended security/error-retry patterns in 2026
- Published: 2026-03-10T11:21:30.000Z
## Summary

Here’s a concise summary tailored to your query about an OpenClaw integration blueprint for CRMs, focusing on concrete auth flows, webhook schemas, sample API calls, middleware/MCP mapping, and security/error-retry patterns.

What OpenClaw provides (relevant to CRM integration)
- Webhook-driven actions: OpenClaw can notify your CRM or middleware when events occur (conversation started/ended, message received/sent, lead qualified, intent detected, handoff, custom triggers).
- Payloads: Rich event payloads include event type, timestamp, conversation and user data, and domain-specific fields (lead_data, metadata, context).

Authentication and security patterns (auth flows)
- Webhook signing: Each payload is signed with HMAC-SHA256 using a shared secret. Your endpoint must verify the signature (x-openclaw-signature header) to ensure authenticity.
- Secret management: Use per-endpoint secrets or rotate secrets periodically. Store in a secure vault and avoid logging secrets.
- API access to CRM from webhook endpoints: Prefer OAuth2 for CRM API calls where possible, with:
  - Authorization Code flow for user-delegated access.
  - Refresh tokens to maintain long-lived access.
  - Scopes minimal and aligned to needed CRM actions (e.g., createLead, updateContact).
- API key fallback: If your CRM supports API keys, use them as a secondary header (e.g., Authorization: Bearer <CRM_API_KEY>), but rotate keys and monitor usage.

Webhook schemas (recommended structure)
- Event envelope (common fields):
  - event: string (e.g., conversation.started, lead.qualified, custom.triggered)
  - timestamp: ISO 8601
  - conversation_id: string
  - user: object (id, email, name, etc.)
  - payload: domain-specific data (lead_data, context, metadata)
  - channel: string (e.g., telegram, web, chat)
  - event_name: optional for custom.triggered
- Signature header: x-openclaw-signature
- Optional headers: Authorization: Bearer <CRM_API_KEY> or other CRM auth tokens per endpoint

Example event-to-CRM mapping patterns
- New lead from OpenClaw (lead.qualified):
  - CRM action: Create or update contact and lead record
  - Map: user.email -> CRM contact email; lead_data fields to CRM lead fields (name, company, team_size, use_case, urgency, score)
  - If contact exists: update; else create with status derived from lead_data. Use lead_id as external reference.
- Conversation started (conversation.started):
  - CRM action: Create or update a CRM activity or task for a sales rep
  - Map: conversation_id to activity external_id; user to lead/contact; metadata to activity notes
- Custom event (custom.triggered):
  - CRM action: Trigger a workflow or create a record for later automation
  - Map event_name to a CRM workflow or custom field

Sample API calls (CRM-agnostic patterns)
-
