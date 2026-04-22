# Added Daily API Limit for POST/PUT Endpoints
- URL: https://developers.pipedrive.com/changelog/post/daily-api-limit-for-postput-endpoints
- Query: Pipedrive API rate limits, custom object support, workflow/action limits, email sync behavior, and pricing tiers — vendor docs and recent independent reviews
- Published: 2019-05-24T08:31:00.000Z
- Author: Pipedrive Inc / Pipedrive OÜ
## Summary

- Pipedrive API daily limit: A new fair-use cap of 10,000 POST/PUT requests per user per 24 hours, reset at UTC midnight. If exceeded repeatedly, POST/PUT requests may be blocked. This is in addition to existing rate limiting and applies to all POST/PUT endpoints across the API.
- Scope and fairness: The limit applies across all apps and custom integrations acting on behalf of a user (e.g., installed marketplace apps and custom integrations share the same limit for that user).
- Example impact: If multiple apps/integrations are active, their combined POST/PUT calls count toward the 10,000 daily total. The remaining quota is shared among them until reset.
- Rationale: Aims to protect the system from data overload and provide more consistent performance.
- Availability and tiers: The limit is the same across Silver, Gold, and Platinum plans.
- Related concepts: This limit sits alongside existing general API rate limiting (unrelated to POST/PUT specific quota) and does not affect GET or other non-POST/PUT endpoints.
- Additional notes: The change was announced May 24, 2019 and effective June 25, 2019; the policy is documented in Pipedrive’s changelog and developer docs. 
- For further detail: See Pipedrive API docs on rate limiting and the changelog entry “Daily API limit for POST/PUT endpoints.”
