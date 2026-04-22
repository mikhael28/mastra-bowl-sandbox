# Automation and integration rate limits - monday Support
- URL: https://support.monday.com/hc/en-us/articles/9060097050258-Automation-and-integration-rate-limits
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2026-02-03T00:00:00.000Z
## Summary

Here’s a concise, user-focused summary tailored to your query about monday.com CRM developer documentation on API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives:

- Rate limits (automation and integration):
  - Automations: Each recipe has per-minute triggers/actions limits. Exceeding limits can occur due to API/webhook triggers, automation loops, or mass Batch Actions. When hit, you’ll see a failure notification and a potential delay before re-running; run history will reflect the delay.
  - Integrations: Rate limits follow the third-party app’s API (not set by monday.com). Overloads from loops, API/webhooks, or Batch Actions can trigger limits. Outbound actions (e.g., mass emails via Outlook) illustrate per-minute caps enforced by the external service.
  - How to prevent: diagnose why triggers fire so frequently (API/webhook calls, loops, batch actions), simplify workflows, and consider splitting workloads or increasing quota via the third-party app.

- What happens when limits are reached:
  - Notifications indicate failures to run. Re-triggers may occur after a delay; this delay is visible in the automation activity log.

- Practical guidance for developers (aligned with your areas of interest):
  - API usage (REST/GraphQL): Build idempotent requests; monitor per-minute trigger/action counts; avoid tight loops that repeatedly trigger automations or integrations.
  - Webhooks: Ensure webhook handlers respect rate limits and implement backoff/retry logic to reduce repeated triggers.
  - Board/column as custom-object patterns: Use explicit field mappings and avoid excessive automatic triggers when creating or updating many items; consider batch processing where supported.
  - Email-sync behavior: Be mindful that integration rate limits may constrain the number of outbound actions (e.g., emails) per minute; distribute load or leverage higher quotas if available from the third-party provider.
  - Automation primitives: Use simpler automation recipes when possible; consolidate actions and reduce redundant triggers; watch for cross-workflow triggering loops.

- Quick remedial tips:
  - Identify root cause of high trigger rates (API/webhook activity, automation loops, or batch actions) and adjust workflows accordingly.
  - If applicable, request higher quotas from third-party apps for integrations (e.g., email services) or split templates across accounts.
  - Regularly review run histories to spot patterns leading to rate-limit occurrences.

If you want, I can tailor this into a developer-facing cheat sheet or map these points to specific API endpoints, webhook patterns, and recommended best practices for monday.com CRM workflows.
