# How to Connect OpenClaw to Your CRM (HubSpot, Salesforce, Pipedrive) | TryOpenClaw.ai
- URL: https://www.tryopenclaw.ai/blog/openclaw-crm-integration/
- Query: OpenClaw integration blueprint for CRMs: concrete auth flows (OAuth2, API keys), webhook schemas, sample API calls, middleware/MCP mapping, and recommended security/error-retry patterns in 2026
- Published: 2026-03-13T23:32:44.000Z
## Summary

Summary tailored to your query: OpenClaw integration blueprint for CRMs with concrete auth flows, webhooks, middleware/MCP mapping, and robust security/retry patterns in 2026

What the page covers:
- Problem: OpenClaw agents and CRMs don’t auto-sync; need reliable integration to move leads from chat to CRM.

Three integration approaches (with concrete steps and trade-offs):
1) ClawHub skills (easy path)
   - What it is: Native CRM skills for major CRMs; no code or webhooks needed.
   - HubSpot: Install hubspot skill, create a HubSpot private app with CRM scopes, set HUBSPOT_ACCESS_TOKEN. Capabilities include creating/searching/updating contacts, deals, owners, and associations; example prompts shown.
   - Salesforce: OAuth-based setup via a Salesforce Connected App; full CRUD on standard objects; you can query with plain-English SOQL-like requests; token refresh required.
   - Pipedrive: No official ClawHub skill yet; use Method 2 (MCP via Composio) or use OpenClaw’s Skill Creator to build a Pipedrive skill using API token.
   Pros: Quick setup, minimal coding, natural-language to API translation.
   Cons: OAuth/token management may be manual (Salesforce), limited native support for some CRMs (Pipedrive).

2) MCP servers (flexible path)
   - What it is: Model Context Protocol adapters (e.g., Composio) act as a middleware proxy that handles OAuth and API calls between OpenClaw and your CRM.
   - Benefits: Automatic token refresh, reduced auth headaches, broadly supports HubSpot, Salesforce, and Pipedrive.
   Considerations: Introduces a third party between your agent and data; data-privacy concerns for sensitive data.

3) Purpose-built CRM agents (all-in path)
   - What it is: Teams build CRM-like systems directly on OpenClaw, fully custom and tightly integrated.
   - Implications: Potentially the most seamless UX and control, but highest development effort.

Concrete auth flows and security patterns implied:
- OAuth2: Used by HubSpot (private apps), Salesforce (Connected App). Expect token lifecycles, refresh flows, and potential token expiration edge cases.
- API keys/tokens: HubSpot private app tokens, Pipedrive API tokens as alternatives when no OAuth is used.
- Webhook schemas: For real-time updates and event-driven sync between OpenClaw and CRMs.
- Middleware/MCP mapping: Use an MCP like Composio to abstract auth, provide retry logic, and normalize API calls across CRMs.
- Security best practices: least-privilege tokens, scope-limited access, encrypted storage of tokens, rotate credentials, audit logging, and robust retry/error handling.

What’s actionable for 2026 deployments:
- If you want quick value with minimal dev effort: go with ClawHub skills for HubSpot or Salesforce; consider MCP (Composio) to streamline OAuth management and cover Pipedrive too.

