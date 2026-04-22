# Triggers
- URL: https://developer.monday.com/apps/docs/triggers-recipes
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2021-03-16T15:41:11.000Z
## Summary

Summary tailored to the user’s query about monday.com triggers and automation (high-level, focused on practical use):

- Purpose: This page documents how to implement trigger blocks for integrations in monday.com (a deprecated approach). It also points developers toward the newer monday workflows infrastructure.

- Key lifecycle events:
  - Subscribe: When a user adds a trigger to a board. monday.com POSTs to your Subscribe URL with a webhookUrl, subscriptionId, and metadata. Return 200 OK and store the subscription details (especially webhookUrl). You may supply your own webhookId via webhookId in the response.
  - Trigger: When the external event occurs, your app should POST to the provided webhookUrl to run the integration. Steps include creating a JWT for authentication and sending a request to the webhook with trigger output fields.
  - Unsubscribe: When a trigger is removed, monday.com POSTs to your Unsubscribe URL with a webhookId. Delete the stored subscription and respond 200 OK. Note: Unsubscribe is invoked when a recipe is deleted, not merely turned off.

- How to authenticate and trigger:
  - Create a short-lived JWT using your appId and signing secret (expires in 1 minute).
  - Use the webhookUrl from the subscription to POST trigger data, including outputFields (e.g., text and number).

- Request/response essentials:
  - Subscribe request body includes: webhookUrl, subscriptionId, blockMetadata, inputFields, inboundFieldValues, recipeId, integrationId.
  - Optional webhookId can be used in place of subscriptionId.
  - Unsubscribe request requires webhookId to clean up storage.
  - Keeping the webhookUrl and subscriptionId/webhookId in storage is critical for future triggers.

- Important caveats:
  - This feature is being deprecated; migration to the monday workflows infrastructure is recommended.
  - If an app responds with a non-2xx status during subscribe/unsubscribe, the automation may be deleted or fail to trigger.
  - The Unsubscribe endpoint is invoked only when a recipe is deleted, not when it’s just turned off.

- Quick reference commands:
  - Subscribe: POST to your Subscribe URL with the provided payload; respond 200 OK.
  - Trigger: Generate a JWT, POST to webhookUrl with trigger outputFields.
  - Unsubscribe: POST to Unsubscribe URL with webhookId; remove subscription; respond 200 OK.

- Glossary highlights:
  - Subscribe event: adding a trigger to a workflow.
  - Unsubscribe event: deleting a trigger.
  - Invocation: your app calling monday.com’s API via the webhook.

If you need, I can extract a tight, step-by-step checklist or create a minimal example workflow for migrating to monday workflows.
