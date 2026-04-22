# Zoho Deluge Scripting: Custom Functions | knowledgelib.io
- URL: https://knowledgelib.io/business/erp-integration/zoho-deluge-scripting/2026
- Query: Zoho CRM API quotas, custom modules/custom object capabilities, automation/workflow limits, email sync specifics, and SMB vs mid-market pricing — official docs and third-party analyses
- Published: 2026-03-02T01:58:11.000Z
## Summary

Summary for user query: Zoho Deluge Scripting: Custom Functions

- Focus: Deluge 2.0 scripting in Zoho apps (CRM, Creator, Desk, Books, etc.) used for custom logic, automation, data validation, and cross-service integration. Not ideal for heavy compute or high-volume ETL.
- Core capabilities:
  - Integration Tasks: Zoho-to-Zoho operations via internal REST calls (CRM/Books/Desk, etc.). Uses API credits; real-time and supports workflow contexts.
  - invokeURL: HTTPS calls to third-party APIs or webhooks. Up to large payloads (5 MB response external; 15 MB internal), rate varies by edition (2,000–5,000,000 per day). Real-time, no bulk processing.
  - Standalone Functions (REST API): Expose Deluge logic as API endpoints (HTTPS POST). 10 MB response, 95 KB body limit; shares CRM API credit pool. Real-time, single endpoints.
  - Scheduled Functions: Internal triggers for batch operations; suitable for periodic sync. 15-minute execution window; supports bulk via scheduling.
- Key limits to design around:
  - Executed statements: 5,000 per function (loops multiply); e.g., a loop with 3 statements × 100 iterations = 300 toward the limit.
  - Recursive calls: 75 max.
  - Execution timeouts: 10s (UI/validation), 30s (workflow), 15 min (scheduled).
- Best practices:
  - Favor Deluge for small-to-moderate automation tasks, data validation, and cross-service integrations.
  - Monitor statement counts and optimize loops; avoid heavy, compute-intensive workloads within a single Deluge function.
  - Use invokeURL judiciously for third-party calls; consider batching or scheduling to stay within rate limits.
  - Leverage Standalone Functions to expose reusable logic securely if you need external access, but manage API credit usage.
- What it is and where it runs:
  - Deluge is Zoho’s proprietary scripting language embedded across 40+ Zoho products; the runtime is consistent across Zoho apps (CRM, Creator, Desk, Books, etc.).
  - Version: Deluge 2.0; deployment is cloud-based; editions vary in quotas and API credits.
- Quick takeaway:
  - Use Deluge 2.0 for automated workflows and cross-app processes within Zoho. Plan for strict execution limits and optimize loops. For external APIs, prefer invokeURL with awareness of payload and rate/credit constraints, or expose logic via REST endpoints when appropriate.
