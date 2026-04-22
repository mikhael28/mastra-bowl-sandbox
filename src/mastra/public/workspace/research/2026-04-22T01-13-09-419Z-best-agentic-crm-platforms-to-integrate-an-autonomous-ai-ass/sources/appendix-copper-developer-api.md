# Appendix - Copper Developer API
- URL: https://developer.copper.com/introduction/appendix.html
- Query: Copper CRM and Monday CRM technical docs and independent evaluations: API/webhook schemas, custom object models, automation primitives, email sync details, and rate limits (2026 sources preferred)
- Author: Copper
## Summary

Summary:

- Topic focus: Copper CRM Developer API Appendix, with emphasis on API schemas, data types, and field categorization. The page defines basic JSON-like data types (boolean, string, number, object, identifier, timestamp, x[], mixed) and explains how these types are used in Copper’s API request/response formats.
- Data modeling notes:
  - When creating/updating entities (e.g., leads, people), fields such as email, phone, social, and website include value and category. Valid categories:
    - Email: work, personal, other
    - Phone: mobile, work, home, other
    - Social: linkedin, twitter, googleplus, facebook, youtube, quora, foursquare, klout, gravatar, other
    - Website: work, personal, other
- Relevance to user’s broader interests (Copper + Monday.com equivalent comparisons):
  - The appendix serves as foundational schema reference for API data shapes and field categorization, useful for anyone evaluating or engineering integrations between Copper and other systems (including automation and event/webhook design in API contexts).
- What’s not covered here (per user’s request focus):
  - API/webhook schemas beyond basic data types and field categories
  - Custom object models, automation primitives
  - Email sync specifics
  - Rate limits
- Actionable takeaway for integration work:
  - Use the defined data types and field categories to structure request payloads and to map contact data (email, phone, social, website) to appropriate categories.
  - When modeling integrations, rely on the object/identifier semantics and timestamp formats to ensure consistent data representation and synchronization logic.

If you want, I can pull in parallel references for Monday CRM, API schemas, webhook structures, and rate-limit policies to build a direct comparative brief (2026 sources preferred).
