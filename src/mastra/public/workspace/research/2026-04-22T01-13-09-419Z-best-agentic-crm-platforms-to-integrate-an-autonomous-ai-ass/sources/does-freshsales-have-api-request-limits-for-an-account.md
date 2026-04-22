# Does Freshsales have API request limits for an account?
- URL: https://crmsupport.freshworks.com/support/solutions/articles/50000010025-does-freshsales-have-api-request-limits-for-an-account-
- Query: Freshsales (Freshworks CRM) API limits, custom object and module support, workflow action limits, email sync implementation, and pricing — vendor docs and independent benchmarks
- Published: 2024-07-05T00:00:00.000Z
## Summary

Summary:
- Freshsales (Freshworks CRM) imposes tiered API request limits by plan, with per-hour and per-minute caps. The limits are account-wide and apply regardless of the number of users.
- API response will return 429 Too Many Requests when the limit is reached.
  - Per-hour limits: Free 1000, Growth 1000, Pro 2000, Enterprise 5000.
  - Per-minute limits: All plans 400.
- The page outlines general API usage, but does not cover:
  - Custom objects or modules: no explicit details found here beyond generic API usage.
  - Workflow actions: no specified limits.
  - Email sync implementation specifics or related constraints.
  - Pricing beyond plan names and the stated limits.
- For vendor docs and independent benchmarks: consider consulting Freshsales developer docs for up-to-date API schemas, rate-limiting behavior, and any changes to custom objects/modules, as well as third-party benchmarks for performance comparisons.
