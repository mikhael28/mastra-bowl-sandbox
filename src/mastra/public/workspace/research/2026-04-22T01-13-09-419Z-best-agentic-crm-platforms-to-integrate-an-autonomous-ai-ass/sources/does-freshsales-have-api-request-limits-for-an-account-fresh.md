# Does Freshsales have API request limits for an account? : Freshsalessuite Support
- URL: https://support.freshsales.io/support/solutions/articles/50000010026-does-freshsales-have-api-request-limits-for-an-account-
- Query: Freshsales (Freshworks CRM) API limits, custom object and module support, workflow action limits, email sync implementation, and pricing — vendor docs and independent benchmarks
## Summary

Summary:

- Freshsales (Freshworks CRM) enforces API rate limits under a fair usage policy, with limits that vary by plan.
- API access is per account (not per user). If you hit the limit, responses return HTTP 429 (Too many requests).
- Rate limits by plan (per hour and per minute):
  - Sprout: per hour 1000, per minute 400
  - Blossom: per hour 1000, per minute 400
  - Garden: per hour 2000, per minute 400
  - Estate: per hour 5000, per minute 400
  - Forest: no published values in the table (likely not applicable or missing)
- Limits apply to all API activities across the account.

Other user-facing considerations (addressing the query topics):
- Custom objects and modules: The API supports custom objects in Freshsales, but rate limits are applied at the account level regardless of object type.
- Workflow actions: API usage counts toward the same rate limits; there’s no separate, higher limit for workflow-related calls.
- Email sync implementation: Not directly tied to API rate limits beyond API usage; email sync status metrics are typically handled via the UI and integrations, not by separate API quotas.
- Pricing and plans: The higher your plan tier, the higher or more generous the per-hour/per-minute limits appear to be (as listed above). Confirm exact values for your current subscription in the official plan table or by contacting support.

Benchmarks and practical guidance:
- If your integration heavily uses REST API calls, design with exponential backoff and retry logic to handle 429 responses gracefully.
- Consider batching actions where possible and leveraging bulk endpoints (if available) to reduce per-call overhead.
- Monitor your usage against plan quotas to avoid unexpected throttling, particularly for high-traffic integrations or data sync jobs.

Note: The source indicates tiered limits by plan and provides explicit per-minute and per-hour thresholds, with 429 responses when limits are reached. For the most up-to-date numbers, refer to Freshsales support documentation or your account’s plan details.
