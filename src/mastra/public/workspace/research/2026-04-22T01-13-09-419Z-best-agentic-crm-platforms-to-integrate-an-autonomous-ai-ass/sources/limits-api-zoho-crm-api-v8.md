# Limits - API | Zoho CRM API | V8
- URL: https://www.zoho.com/crm/developer/docs/api/api-limits.html
- Query: Zoho CRM API quotas, custom modules/custom object capabilities, automation/workflow limits, email sync specifics, and SMB vs mid-market pricing — official docs and third-party analyses
## Summary

Here's a concise, user-focused summary tailored to your query about Zoho CRM API quotas, custom modules, automation/workflow limits, email sync specifics, and SMB vs mid-market pricing, drawn from the official Limits - API doc.

Key points for API quotas and credits
- Zoho CRM API usage is governed by a credit system. Each API call consumes credits, with variations (e.g., Convert Lead costs 5 credits).
- 24-hour credit limits vary by edition:
  - Free: 5,000 credits (max 5,000)
  - Standard/Starter: base 50,000 + 250 per user + add-ons (max 100,000)
  - Professional: base 50,000 + 500 per user + add-ons (max 3,000,000)
  - Enterprise/Zoho One: base 50,000 + 1,000 per user + add-ons (max 5,000,000)
  - Ultimate/CRM Plus: 50,000 + 2,000 per user + add-ons (unlimited)
- Examples/caveats:
  - In Standard, 10 users yields 52,500 credits available; max remains 100,000.
  - Concurrency/sub-concurrency limits apply to prevent overload.
  - If 50%+ of daily credits are consumed, the remaining credits are shown in header X-API-CREDITS-REMAINING.
  - Trial editions mirror the paid edition limits.
- Typical credit deductions:
  - Most common calls: Get Users/Roles/Profiles, Get Modules, Get Field/Module Meta, Composite requests: 1 credit
  - Get IDs of deleted records: 2 credits
  - Get Related Records Count: 2 credits
  - COQL/other specialized calls vary (see the table for specifics)

Custom modules and object capabilities
- The doc focuses on API limits; it does not provide detailed limits for custom modules/custom objects beyond general API call credits. For specifics on creating, listing, or interacting with custom modules, refer to the Modules API and Module Meta data sections in the V8 docs.

Automation, workflows, and integration limits
- The page describes concurrency controls and API request limits but does not enumerate per-workflow or per-automation execution limits. Expect similar credit-based constraints and potential throttling under high load.

Email sync specifics
- The limits doc does not address email sync behavior or quotas. For email sync specifics (rate limits, synchronization windows, and mailbox integration) consult Zoho CRM email sync docs or support articles.

Pricing positioning (SMB vs mid-market)
- The pricing/credit caps vary by edition, with larger organizations benefitting from higher credit ceilings (Enterprise/Zoho One and Ultimate tiers). SMBs on Free/Standard plans have lower daily credits and tighter caps, influencing how many API-driven automations or integrations they can support daily.

Practical guidance
- If you rely on API-heavy integrations (e.g., bulk data sync, COQL queries, composites), map your expected calls to
