# Does the web application have API request limits for an account ? : Freshsales
- URL: https://crmsupport.freshworks.com/support/solutions/articles/50000005599-does-the-web-application-have-api-request-limits-for-an-account-
- Query: Freshsales (Freshworks CRM) API limits, custom object and module support, workflow action limits, email sync implementation, and pricing — vendor docs and independent benchmarks
## Summary

Summary:

- API request limits (Freshsales):
  - API access is available to all registered users via API key, email, and password.
  - Account-level limits apply (not per user); limits are shown by plan:
    - Free: 1000 requests per account per hour
    - Growth: 1000 per account per hour
    - Pro: 2000 per account per hour
    - Enterprise: 5000 per account per hour
  - If the limit is reached, API responses return HTTP 429 Too Many Requests.
  - If you need higher limits, you can request an increase by emailing crm-support@freshworks.com.

- Custom objects, modules, and workflow actions:
  - The article excerpt does not provide specifics on custom objects, module support, or workflow action limits. It focuses on API rate limits and general API access; for details on customization capabilities, you should consult Freshsales/Freshworks developer documentation or vendor support.

- Email sync and integration notes:
  - No explicit details on email sync implementation are included in the page. It primarily covers API usage limits and contact with support for inquiries.

- Pricing and plan context:
  - The page lists plan tiers (Free, Growth, Pro, Enterprise) and ties API limits to these plans. There is a path to request higher limits via CRM support channels.

- Benchmarks and external references:
  - The provided page is a vendor support article; no independent benchmarks are included. For independent performance benchmarks, you would need third-party reviews or user benchmarks outside of Freshworks docs.

If you’re evaluating Freshsales for API-heavy use (e.g., custom objects, modules, and automation), consider:
- Starting with your plan’s stated hourly limits and monitoring usage to anticipate 429 responses.
- Contacting crm-support@freshworks.com to discuss higher limits or specific needs.
- Reviewing the Freshworks developer API docs for details on custom objects, module APIs, and workflow action endpoints, as well as any rate-limiting nuances for those features.
- Checking vendor benchmarks and third-party comparisons for performance under load if you require independent validation.
