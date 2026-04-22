# API Limits for Sales and Support Products in Freshworks
- URL: https://crmsupport.freshworks.com/support/solutions/articles/50000010517-api-limits-for-sales-and-support-products-in-freshworks
- Query: Freshsales (Freshworks CRM) API limits, custom object and module support, workflow action limits, email sync implementation, and pricing — vendor docs and independent benchmarks
- Published: 2025-01-10T00:00:00.000Z
## Summary

Summary:

- Focus: API limits for Freshworks’ Sales and Support products, with emphasis on Freshsales (Freshworks CRM) and related modules. The document primarily lists which modules/projects have API access and how limits vary by plan, plus notes on exceptions and escalation paths.

Key points relevant to the query:
- Modules with API access (per product):
  - Freshdesk, Omni, Freshchat, Freshcaller, Freshsales, Freshsales Suite, Freshmarketer: Tickets, Chats/Conversations, CRM Contacts and Accounts, CRM Deals, Marketing Campaigns and Journeys, and Phone (availability varies by product; some entries show limited or NA access for certain plans).
- Plan-based API limits (illustrative figures):
  - Chats/Conversations: Free/ Growth/ Pro/ Enterprise largely unavailable or 2000 APIs per minute for Growth/Pro/Enterprise.
  - Tickets: Growth/Pro/Enterprise limits: 200 APIs/min (Growth), 400 APIs/min (Pro), 700 APIs/min (Enterprise).
  - Contacts, Accounts, and Deals: Free 1000 APIs/hour; Growth 1000 APIs/hour; Pro 2000 APIs/hour; Enterprise 5000 APIs/hour.
  - Marketing Campaigns and Journeys: Free 2000 APIs/min; Growth/Pro/Enterprise not clearly distinct in the provided snippet.
  - Phone: Free/ Growth/ Pro/ Enterprise: No limit stated for Free; 2000 APIs/min for Growth/Pro/Enterprise (implied).
- Important caveats:
  - Excludes some “Classic” products (Freshchat Classic, Freshcaller Classic, Freshsales Classic, Freshmarketer Classic).
  - To request higher API limits, contact support@freshdesk.com.
  - API rate limits are per account (Chat/Conversations) or per agent (other modules), with 429 status when limit is reached.
  - Limits cover all API requests and apply across activities invoked via the API.
- Additional context:
  - The page lists a product/module API availability table and a separate plan-based limit table, but some table formatting appears garbled in the source, so exact values may require verification in the live docs.
- Practical takeaway for users:
  - If you’re using Freshsales (CRM) APIs for Contacts, Accounts, Deals, or Marketing Campaigns/Journeys, expect higher limits on higher-tier plans (up to 5000 APIs/hour for Enterprise for Contacts/Accounts/Deals).
  - For real-time workflows involving Chats/Conversations, prepare for higher per-minute limits on Growth/Pro/Enterprise (around 2000 APIs/min).
  - If your use case needs more than listed limits, reach out to Freshdesk support to request a quota increase.
- Notable gaps to verify with vendor docs:
  - Precise per-module API limits for all plan tiers (the provided text has some inconsistencies/garbled rows).
  - Whether Freshsales (CRM) specifically includes all modules under the “Suite” versus separate product limits.
  - Updated limits post-Jan 202
