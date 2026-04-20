# REST API endpoints for repositories - GitHub Docs
- URL: https://docs.github.com/rest/repos/repos
- Query: How to fetch authoritative GitHub repo stats (stars, forks, commits, contributors) via GitHub REST or GraphQL API — curl + jq examples 2026
- Published: 2011-01-26T19:01:12.000Z
## Summary

Summary:
- The page documents GitHub REST API endpoints for repositories, focusing on how to list organization repositories and the expected response structure.
- Core takeaway for the query: to obtain authoritative repo stats (stars, forks, commits, contributors) you’ll need to query repository data via REST or GraphQL endpoints and combine fields/edges as needed. The REST endpoint covered here is GET /orgs/{org}/repos, which returns a list of repositories with attributes such as stargazers_count (stars), forks_count (forks), and other repository metadata. It includes pagination and sorting/query parameters (type, sort, direction, per_page, page).
- How this helps your goal:
  - Stars and forks: available in each repository object (fields like stargazers_count and forks_count) when listing org repos or a repository’s details.
  - Commits: REST list of repos itself does not return commit counts. To get commit counts, you’d query the commits API (e.g., GET /repos/{owner}/{repo}/commits) or use GraphQL to fetch the history/commit count. The REST list endpoint can be combined with per-repo commits queries if you’re iterating over repos.
  - Contributors: REST exposes contributors via endpoints like GET /repos/{owner}/{repo}/contributors, or via GraphQL with contributors/statistics fields. The repository list itself does not include a contributor count; you must query the per-repo contributors endpoint or GraphQL equivalents.
- Practical approach (REST + jq examples to align with 2026 tokens guidance):
  - List repositories in an organization (REST):
    - curl -H "Authorization: Bearer <TOKEN>" -H "Accept: application/vnd.github+json" https://api.github.com/orgs/<ORG>/repos?per_page=100
    - Use pagination (page and per_page) to cover all repos.
    - Extract per-repo stars and forks:
      - jq '.[] | {name, full_name, stars: .stargazers_count, forks: .forks_count}'
  - For each repository, fetch commits count (REST):
    - curl -H "Authorization: Bearer <TOKEN>" -H "Accept: application/vnd.github+json" https://api.github.com/repos/<OWNER>/<REPO>/commits?per_page=1&author_date
    - To get a total count, use the Link header for pagination or use GraphQL for aggregate counts.
  - For contributors (REST):
    - curl -H "Authorization: Bearer <TOKEN>" -H "Accept: application/vnd.github+json" https://api.github.com/repos/<OWNER>/<REPO>/contributors?per_page=1&anon=true
    - Read the Link header to approximate total contributors, or fetch GraphQL for aggregate counts.

Notes:
- Authorization headers and API version header are recommended (Bearer token, Accept: application/vnd.github+json, X-GitHub-Api-Version: 2026-03-10).
- The page primarily covers listing repos; it describes response
