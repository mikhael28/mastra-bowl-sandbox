# Webhooks
- URL: https://developer.monday.com/api-reference/reference/webhooks
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2021-02-10T00:00:00.000Z
## Summary

Summary
- The page explains how to use monday.com webhooks (real-time HTTP push updates) to receive event data for board activity, with options for subscribing via HTTP/HTTPS POST to a configured URL.
- Key steps to add a webhook to a board:
  - Open Automations Center → Integrations → search for webhooks → choose a webhook recipe → provide the receiver URL.
  - The platform will send a verification challenge to your URL; your endpoint must respond with the same challenge value in a JSON body.
- URL verification details:
  - The platform posts a JSON body like {"challenge": "<token>"}; your response should be the identical JSON.
  - Example listener snippets are provided in JavaScript and Python to illustrate handling the challenge and echoing it back.
- Authenticating webhook requests:
  - Some requests include a JWT in the Authorization header, which can be verified against the app’s Signing Secret.
  - To enable, create a webhooks integration via an app, generate an OAuth token, and call the create_webhook mutation with that token.
- End-user control:
  - End-users cannot disable integration webhooks; to allow control, create the webhook with an integration app token.
- Retry policy:
  - Webhook delivery will be retried every minute for up to 30 minutes if failures occur.
- Related notes:
  - If building a marketplace app, refer to the app lifecycle webhooks guide for additional guidance.

Top takeaways for developers
- Implement a robust webhook listener that correctly handles and echoes the challenge for URL verification.
- Consider enabling JWT-based authentication to validate incoming webhook requests.
- Use an integration app token (OAuth) to manage webhook creation and maintain control over the webhook behavior.
- Plan for retries (30 minutes of 1-minute intervals) to ensure delivery reliability.
