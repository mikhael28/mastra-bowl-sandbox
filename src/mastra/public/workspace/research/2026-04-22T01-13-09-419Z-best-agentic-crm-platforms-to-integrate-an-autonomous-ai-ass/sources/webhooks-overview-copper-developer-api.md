# Webhooks - Overview - Copper Developer API
- URL: https://developer.copper.com/webhooks/overview.html
- Query: Copper CRM and Monday CRM technical docs and independent evaluations: API/webhook schemas, custom object models, automation primitives, email sync details, and rate limits (2026 sources preferred)
- Author: Copper
## Summary

Summary tailored to your query

- Copper Webhooks (developer API)
  - Purpose: Near real-time notifications from Copper when specified events occur, enabling data updates and automated workflows.
  - Core concepts:
    - Subscription: Register a target URL to receive notifications for chosen events.
    - Event: A Copper action that triggers a notification (Create, Update, Delete).
    - Notification: The JSON payload sent via HTTPS to the subscribed URL.
  - Supported event types: Create, Update, Delete.
  - Entity types with events: Lead, Person, Company, Opportunity, Project, Task, Activity (Activity uses the type "activity_log").
  - Technical constraints:
    - Subscriptions: up to 100 active per account.
    - Rate limits: up to 600 notifications per minute, 1,800 per 10 minutes per account.
    - Multi-event notifications: payloads include an array of affected IDs (1–30 IDs per notification); more than 30 records trigger multiple notifications; each notification counts as one request toward rate limits.
    - Retries: Notifications are fired at most once per event; no retries.
    - Security: HTTPS only (https:// endpoints).
  - Webhook payload schema (key fields):
    - id: Subscription ID
    - target: Notification URL
    - type: Entity type (e.g., "lead", "person", "company", "opportunity", "project", "task", "activity_log")
    - event: Trigger type ("new" (Create), "update" (Update), "delete" (Delete))
    - secret: Optional authentication payload
    - headers: Optional HTTP headers to include in requests
    - custom_field_computed_values: If true, convert dropdown option_ids to option names in computed values
    - created_at: Subscription creation timestamp

Context for your broader needs (API/webhook schemas, object models, automation, email sync, rate limits)
- If comparing Copper with Monday CRM: Both offer webhooks or automation hooks with event-driven capabilities; expect similar constraints around rate limits, retries, and HTTPS requirements. Both platforms typically expose schemas for webhook payloads and entity types; verify current docs for any changes in event naming, payload structure, and security practices.
- Custom object models and automation primitives: Copper’s webhook payloads deliver arrays of affected IDs, enabling batch processing within the per-notification limits. For complex automations, plan for idempotent handlers since retries aren’t performed by the platform.
- Email sync details: Not covered in Copper’s webhook overview; assess separately if email-to-lead/transaction sync is a requirement.
- Rate limits guidance: Design listeners to handle up to 600 notifications/minute and 1,800/10-min window; implement backoff and parallel processing within those bounds.

If you want, I can compare Copper’s webhook API to Monday’s webhook/API docs side-by-side, focusing on:
- API/webhook schemas and payload examples
- Custom object models and extendable fields
- Automation primitives (triggers, actions, workflows)

