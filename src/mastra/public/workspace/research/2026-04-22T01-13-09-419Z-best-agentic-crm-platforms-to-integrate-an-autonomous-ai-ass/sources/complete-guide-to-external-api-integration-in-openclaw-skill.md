# Complete Guide to External API Integration in OpenClaw Skills — OpenClaw Tutorials
- URL: https://www.oepnclaw.com/en/tutorials/openclaw-skill-api-integration.html
- Query: OpenClaw integration blueprint for CRMs: concrete auth flows (OAuth2, API keys), webhook schemas, sample API calls, middleware/MCP mapping, and recommended security/error-retry patterns in 2026
- Published: 2026-03-30T15:50:24.000Z
## Summary

Here’s a concise, user-focused summary tailored to the query about an “OpenClaw integration blueprint for CRMs” with concrete auth flows, webhook schemas, sample API calls, middleware/MCP mapping, and security/error-retry patterns in 2026.

What this page covers
- Purpose: A practical guide to external API integration in OpenClaw Skills, focusing on how to connect CRMs or other services via REST APIs using the HTTP Fetch MCP tool.
- Architecture: End-to-end flow from user message → skill → HTTP fetch MCP → external API → JSON → AI response.
- Core components:
  - Configuration for the HTTP Fetch MCP server, including default timeout and domain whitelisting.
  - HTTP fetch methods: GET, POST, PUT, PATCH, DELETE.
  - Authentication methods: API Key, OAuth 2.0, and Basic Auth (with emphasis on secure key/storage and environment-variable-based secrets).
  - Response handling: JSON parsing, error handling, status codes, timeouts, retries, rate limiting, and API limit strategies.
- Security best practices: Centralized secrets management, environment variables, key rotation, and limiting allowed domains to reduce risk.
- Hands-on examples (CRMs and related tools): 
  - GitHub integration (API Key/OAuth patterns demonstrated).
  - Jira integration (typical REST/issue-tracking API calls).
  - Notion integration (token management for content APIs).
- Practical patterns and templates:
  - Secrets schema and injection into MCP server configuration.
  - Example request headers and query parameters for common APIs.
  - Basic retry and rate-limit strategies to apply in skills.
- Documentation artifacts:
  - SKILL.md snippets for API authentication and integration usage.
  - References for implementing API calls and security practices within OpenClaw Skills.

If you’re building a CRM integration in 2026, expect to:
- Use OAuth 2.0 for user-consent-driven APIs (e.g., Google Workspace, Microsoft Graph) or API keys for service-to-service APIs (e.g., GitHub, Notion, Jira) with responsible secret management.
- Implement a robust HTTP fetch workflow:
  - Define allowed domains to minimize exposure.
  - Standardize headers (Authorization, Accept, Content-Type) and query parameter usage per API.
  - Parse JSON responses consistently and map to OpenClaw skill outputs.
- Implement reliable error handling:
  - Distinguish retryable vs. non-retryable errors.
  - Implement exponential backoff and respect API rate limits.
  - Provide clear user-facing messages when API calls fail or time out.
- Maintain security hygiene:
  - Use environment-based secrets with rotation hooks.
  - Avoid hard-coding tokens; prefer centralized secret storage.
  - Monitor and log API calls with minimal sensitive data exposure.

If you want, I can tailor this into a crisp blueprint for a specific CRM (e.g., Salesforce, HubSpot, Jira) including:
- Exact authentication flow (OAuth 2.0 vs API Key)
- Sample HTTP fetch configuration
- Concrete sample API calls
