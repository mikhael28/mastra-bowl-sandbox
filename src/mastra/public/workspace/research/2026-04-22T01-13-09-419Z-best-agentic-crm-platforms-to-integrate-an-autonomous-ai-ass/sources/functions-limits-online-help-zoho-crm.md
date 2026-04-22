# Functions - Limits | Online Help - Zoho CRM
- URL: https://www.zoho.com/crm/developer/docs/functions/functions-limits.html
- Query: Zoho CRM API quotas, custom modules/custom object capabilities, automation/workflow limits, email sync specifics, and SMB vs mid-market pricing — official docs and third-party analyses
## Summary

Summary:

This Zoho CRM help page explains the credits-based rate limiting for Functions (Deluge scripts) and the per-edition quotas that govern function usage, alongside practical limits that affect performance and execution.

Key points relevant to your query:
- Credits system: Each function call consumes one credit; credits are limited by edition and number of users.
- Edition-based limits (maximum daily credits):
  - Standard: 5,000 free credits + 200 per user; max 15,000
  - Professional: 5,000 free credits + 200 per user; max 20,000
  - Enterprise/Zoho One: 20,000 free credits + 500 per user + add-ons; max up to 400,000
  - CRM Plus/Ultimate: 20,000 free credits + 1,000 per user + add-ons; effectively unlimited (subject to admin configuration)
  - Note: Standard/Professional functions are available only through Extensions.
- Credits calculator and examples provided (e.g., 100 Enterprise users yields 70,000 credits available).
- Per-function and execution limits:
  - 10 MB response limit
  - 200,000 lines of execution (not always equal to source lines)
  - Send mail: up to 50,000/day
  - SMS: up to 1,000,000/day
  - Invoke URL (GET/POST): up to 5,000,000 requests/day
- Timeouts by category:
  - Related List, Button, Validation Rule, REST API: 10 seconds
  - Automation: 30 seconds
  - Schedule: 15 minutes

Implications for API quotas, custom modules, automation/workflows, and pricing:
- SMB vs mid-market: Quotas scale with edition and user count; higher tiers (Enterprise/Zoho One, Ultimate) provide substantially higher (and often unlimited) credit ceilings, suitable for automation-heavy environments.
- Custom modules/objects: Functions and their limits apply to any custom development; the “lines of execution” and timeout constraints can impact complex custom logic.
- Email/SMS and HTTP invocations: Daily caps exist, so high-volume automation (emails, SMS, or API calls) may require planning around quotas or upgrading editions/add-ons.
- Pricing and credits: Some editions include higher free credits; for additional needs, there are add-ons and explicit pages to purchase more credits.

If you want, I can tailor a quick guide for:
- Estimating your expected monthly Function credits based on current workflows
- Mapping your automation use cases to appropriate Zoho CRM editions
- Strategies to optimize function performance within the time/lines/response limits
- A comparison outline of SMB vs mid-market tiers focusing on quotas and pricing

Would you like a concise checklist or a side-by-side edition comparison focused on your environment (number of users, expected function calls, and automation workloads)?
