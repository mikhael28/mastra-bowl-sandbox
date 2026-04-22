# Rate limits - Monday.com Developers
- URL: https://developer.monday.com/api-reference/docs/rate-limits
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2021-02-10T23:05:11.000Z
## Summary

Summary focused on your likely needs:

- Topic: monday.com API rate limits and how to manage them.
- Key limits:
  - Complexity limit: measures query load.
    - Personal tokens: combined reads/writes up to 10M complexity per minute (or 1M for trial/NGO/free).
    - App tokens: up to 5M complexity points per minute (reads/writes).
    - Playground: up to 5M per minute (or 1M for trial/free).
    - Individual query contributes to a per-call complexity budget.
  - Daily call limit: resets at midnight UTC; varies by plan.
    - Free/Trial: 200 calls/day
    - Standard/Basic: 1,000/day
    - Pro: 10,000/day (soft limit)
    - Enterprise: 25,000/day (soft limit)
  - Other limits mentioned: minute rate limit, concurrency limit, IP limit, and resource protection limits.
- How to prevent hitting limits:
  - Use complexity field to gauge remaining budget.
  - Request only necessary fields; minimize nested queries.
  - Use page and limit to paginate data.
- Exceptions and notes:
  - Limits and exceptions can change; some limits are soft (may require request for increase via API Analytics Dashboard for high usage).
  - A single API call typically uses 1 daily call unit; certain calls and behaviors may vary (specifics in the documentation are shown within the rate-limit sections).

If you need, I can tailor this to your exact plan and typical usage (e.g., your expected daily calls, whether you use app tokens vs personal tokens) and highlight the specific API calls most likely to hit complexity or daily limits.
