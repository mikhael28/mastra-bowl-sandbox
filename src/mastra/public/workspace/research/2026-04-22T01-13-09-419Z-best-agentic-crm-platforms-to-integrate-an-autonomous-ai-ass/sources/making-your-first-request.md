# Making your first request
- URL: https://developer.monday.com/api-reference/docs/getting-started
- Query: monday.com CRM developer documentation: API (REST/GraphQL), webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, and automation primitives
- Published: 2021-02-10T00:00:00.000Z
## Summary

Summary tailored to your query: monday.com CRM developer documentation (REST/GraphQL, webhooks, rate limits, board/column as custom-object patterns, email-sync behavior, automation primitives)

- Getting started
  - Sign up for a monday.com account (including a developer account if you’re building apps).
  - Enable Developer mode to easily view template IDs, column IDs, doc IDs, and other IDs needed by the API.

- Authentication
  - Use an Access Token and send it in the Authorization header for all API requests.
  - Review the authentication docs for secure and correct usage.

- API basics
  - monday.com uses GraphQL at a single endpoint: https://api.monday.com/v2
  - Requests are POST with a JSON body containing:
    - query: the GraphQL query or mutation
    - variables (optional): your query variables
  - Content-Type must be application/json.
  - Use the API-Version header to specify the version (e.g., 2023-07).

- Example request formats
  - Curl and code examples (JavaScript fetch, PHP) show how to structure headers and the JSON body:
    - Authorization: YOUR_API_KEY_HERE
    - API-Version: e.g., 2023-07 or 2023-04
    - Body: {"query": "query { boards(ids: 123) { name } }"}

- GraphQL usage
  - GraphQL is preferred for interacting with monday.com data (boards, items, columns, users, etc.).
  - You can explore the schema via the API playground or the v2 schema endpoint.

- Practical patterns for CRM usage
  - Boards and columns map to CRM entities (e.g., leads, contacts, deals) and their attributes.
  - Custom-object patterns: model CRM concepts using boards and column values; consider using templates and IDs exposed by Developer mode.
  - Email-sync behavior: refer to docs on how email integrations map to items/updates and how to configure inbound/outbound email linking (specifics require checking the Email/Automation sections).
  - Automations: leverage monday.com automation primitives to trigger actions on item/board events (e.g., status changes, date reminders, email notifications).

- Webhooks
  - Use webhooks to receive real-time updates for CRM events (e.g., item changes, board changes). Set up and secure endpoints to process webhook payloads.

- Rate limits
  - Be aware of API rate limits and best practices for batching queries and using efficient queries to minimize calls.

- Next steps
  - If you’re building a CRM, start by defining your core entities as boards and items, map required fields to columns, and experiment with basic GraphQL queries to read/write data.
  - Use Developer mode to fetch IDs for boards, items, and columns you’ll query or mutate.
  - Inspect the authentication and versioning guidance to ensure your app remains compatible across API versions.

If you want, I can tailor this into a quick-start plan for a specific CRM data model (e
