# Limits - API | Online Help - Zoho CRM
- URL: https://www.zoho.com/crm/help/api/api-limits.html
- Query: Zoho CRM API quotas, custom modules/custom object capabilities, automation/workflow limits, email sync specifics, and SMB vs mid-market pricing — official docs and third-party analyses
## Summary

Summary tailored to your query:

- Zoho CRM API quotas:
  - API calls consume credits from a per-24-hour credit limit. Most calls deduct 1 credit; some operations cost more (e.g., Convert Lead is 5 credits).
  - Daily credit limits vary by edition:
    - Free: 5,000 credits (max 5,000)
    - Standard/Starter: 50,000 + (users×250) credits, max 100,000
    - Professional: 50,000 + (users×500) credits, max 3,000,000
    - Enterprise/Zoho One: 50,000 + (users×1,000) credits, max 5,000,000
    - Ultimate/CRM Plus: 50,000 + (users×2,000) credits, unlimited
  - A 24-hour rolling window with concurrency controls may reduce throughput.
  - When you’ve used 50%+ of your daily credits (excluding add-ons), remaining credits are shown in the X-API-CREDITS-REMAINING header.

- Custom modules/custom objects:
  - The docs outline standard API calls (Users, Roles, Profiles, Modules, Field Metadata, Module Metadata, Composite requests, COQL queries, Deleted records, etc.). They provide per-call credit costs (most are 1 credit; some costs vary up to 3 credits or more depending on operation).

- Automation/workflows and SMB vs mid-market:
  - The page focuses on API limits, not on automation/workflow execution limits or pricing tiers. For automation/workflow limits and SBO vs mid-market specifics, consult Zoho’s feature lists and pricing docs.

- Additional notes:
  - Trial editions follow the same API limits as their paid counterparts.
  - There are calculators and references to feature-wise limits in Zoho’s complete feature list page.
  - For specific third-party analyses or pricing comparisons (SMB vs mid-market), you’ll need external sources beyond Zoho’s official API limits page.

If you want, I can extract the exact per-call credit costs for a specific API (e.g., Convert Lead, Get Records with cvid, composite requests) or compare edition credits based on a given user count.
