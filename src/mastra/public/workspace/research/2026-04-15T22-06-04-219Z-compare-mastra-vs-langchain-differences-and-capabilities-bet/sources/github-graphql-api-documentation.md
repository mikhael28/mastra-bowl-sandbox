# GitHub GraphQL API documentation
- URL: https://docs.github.com/en/graphql
- Query: How to fetch authoritative GitHub repo stats (stars, forks, commits, contributors) via GitHub REST or GraphQL API — curl + jq examples 2026
## Summary

Summary tailored to your query:
- This page documents the GitHub GraphQL API, which lets you fetch precise, flexible data about GitHub resources using GraphQL instead of REST.
- Key topics you’ll likely need:
  - Getting started: authentication, forming GraphQL calls, and running queries/mutations.
  - Data modeling: understanding objects, interfaces, enums, unions, input objects, and scalars.
  - Core capabilities: selecting exactly which fields you want (for repo stats, e.g., stars, forks, commits, contributors) and handling pagination with cursors.
  - Practical guidance: migrating from REST, rate limits, and breaking changes.
- Practical relevance to your goal (repo stats via REST or GraphQL):
  - GraphQL can fetch precise stats (stars, forks, commits, contributor activity) in a single query, potentially reducing round trips.
  - REST equivalents are available, but GraphQL often yields more tailored results with a single request.
- Quick start pointers from the page:
  - See “About the GraphQL API” for flexibility and data selection.
  - Use “Forming calls with GraphQL” to authenticate and execute queries/mutations.
  - For large results, leverage “Using pagination in the GraphQL API.”
  - Review the public schema and reference sections (Queries, Mutations, Objects) to identify fields (e.g., repository stargazer count, fork count, commit history, contributor stats).
- If you want explicit curl + jq examples: the docs describe how to issue GraphQL queries over HTTP and parse results, though this page focuses on overview and navigation to more detailed guides.

Bottom line: To fetch authoritative repo stats via GraphQL, start with authentication and a tailored GraphQL query selecting fields like stargazerCount, forks, defaultBranchRef/comits, and contributor stats, using pagination as needed for large histories. If you’re deciding between REST and GraphQL, GraphQL offers more precise, single-request retrieval, especially for custom stat sets.
