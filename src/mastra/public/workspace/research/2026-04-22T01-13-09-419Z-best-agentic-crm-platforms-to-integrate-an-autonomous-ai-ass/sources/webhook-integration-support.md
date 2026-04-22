# Webhook integration – Support
- URL: https://support.monday.com/hc/en-us/articles/360003540679-Webhook-integration
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2024-06-12T00:00:00.000Z
## Summary

Summary for query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives

- Webhook capability: monday.com supports real-time webhooks via its Integrations (board automations) and API. Webhooks deliver payloads immediately when a chosen event occurs (e.g., item creation, column value changes) without polling.
- Verification: When creating a webhook, monday.com sends a JSON challenge to your endpoint. Your service must echo back the same challenge value in a JSON response to confirm control of the URL.
- How to create: In a board, use Integrations > Create > Webhooks, pick the event to trigger on, and supply a receiver URL that can handle the JSON challenge and future payloads.
- Payload structure: Each webhook payload includes an event object with fields such as userId, boardId, pulseId (item), pulseName, groupId/groupName, column values (for column-change events), triggerTime, and subscription/triggerUuid.
- Example events:
  - create_item: payload contains boardId, pulseId, pulseName, group details, and event metadata.
  - column value change: includes columnId, columnType, columnTitle, previous and current values.
- Suggested usage: Use the payload to synchronize external systems, trigger workflows, or update dashboards in real time. Add descriptive notes on each webhook to document its purpose within your workflow.
- Developer notes: The page references a related API endpoint for creating webhooks via the REST API (link provided in the doc). For development, plan for handling JSON challenge verification and robustly parsing event data to map to your internal models.

If you’re after implementation specifics (code samples in your stack, handling the challenge, or mapping monday.com event data to a CRM schema), tell me your tech stack and I can tailor concrete examples.
