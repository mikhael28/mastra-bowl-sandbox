# Freshworks Developer Docs | Rate limits and constraints
- URL: https://freshworks.dev/docs/app-sdk/v3.0/sales_account/rate-limits-and-constraints/
- Query: Freshsales (Freshworks CRM) API limits, custom object and module support, workflow action limits, email sync implementation, and pricing — vendor docs and independent benchmarks
## Summary

Here’s a concise summary tailored to your query about Freshsales (Freshworks CRM) API limits, custom object/module support, workflow action limits, email sync implementation, and pricing benchmarks, drawn from the Freshworks Developer Docs page on rate limits and constraints.

What this page covers
- Core rate limits and constraints across the Freshworks app platform (Sales Account scope), including:
  - Requests: 50 requests per minute for certain methods (get, history, updateStatusMessage) per installation.
  - Concurrent jobs: up to 15 jobs running concurrently per installation (invoke method).
  - Execution time: typical limits around 15–20 seconds, with possible extension up to 30 seconds per app (and increments of 5 seconds where applicable).
  - Content types: supported formats include JSON, JSONP, XML, HTML, plain text, and related variants.
- Specific resource limits (per feature) including:
  - External events: up to 250 requests per minute per installation (extendable); incoming payload cap 100 KB.
  - Server Method Invocation (SMI): up to 50 requests per minute per installation; max payload 100 KB.
  - Jobs: execution time cap of 2 minutes per installation; max payload 100 KB.
  - Scheduled and recurring events: up to 1,000 one-time events per installation; only 1 recurring event per installation.
  - Data payload limits: per data payload 4 KB; per product events payload cap 256 KB.
  - Status messages: max length 500 characters.
- Scope and extension notes:
  - Several limits are extendable on a per-installation basis (e.g., external events, SMI, run-time for jobs), while others are fixed (e.g., payload sizes for certain features, number of scheduled/recurring events).
- Tools and applicability:
  - The document enumerates rate limits for various app integration features within Freshworks’ platform, serving as a reference for developers building apps (including Freshsales CRM integrations) that operate within the Freshworks app ecosystem.

Relevance to your specific topics
- API limits: The page provides per-installation rate limits (50 requests/min for certain methods, 50/min for SMI, 15 concurrent jobs) and per-app execution time constraints (up to 20 seconds, extendable to 30s).
- Custom object and module support: The page is a rate-limits reference; it does not detail custom objects/modules, but these constraints will apply to app-driven operations interacting with the platform.
- Workflow action limits: Constraints on external events, scheduled/recurring events, and server method invocations impact how many workflow actions you can trigger or handle—e.g., up to 250 external event requests/min, 1000 one-time scheduled events, and 1 recurring event per installation.
- Email sync implementation: Not specifically addressed in this page; rate limits apply to the app platform in general. For email sync specifics, you’d need the email integration or CRM mail sync docs within Freshsales/Freshworks CRM docs.

the current migration guide and vendor benchmarks.
