# REST API endpoints for repository statistics - GitHub Docs
- URL: https://docs.github.com/en/rest/metrics/statistics
- Query: How to fetch authoritative GitHub repo stats (stars, forks, commits, contributors) via GitHub REST or GraphQL API — curl + jq examples 2026
## Summary

Here’s a concise, user-focused summary of the page you asked about, tailored to your query about fetching authoritative GitHub repo stats (stars, forks, commits, contributors) via REST or GraphQL with curl + jq examples.

What this page covers
- The REST API endpoints for repository statistics that GitHub uses to power activity graphs.
- How caching works and how to handle long-running statistic computations (202 then 200 after the background job completes).
- Data scope and exclusions: statistics exclude merge commits; contributor statistics exclude empty commits.
- Headers you typically need (Authorization: Bearer <token>, Accept: application/vnd.github+json, and X-GitHub-Api-Version: 2026-03-10).

Key endpoints (REST)
1) Weekly code frequency (additions/deletions)
   - GET /repos/{owner}/{repo}/stats/code_frequency
   - Returns a weekly aggregate of additions and deletions.
   - Constraints: only for repositories with fewer than 10,000 commits (≥10,000 returns 422).
   - Response: an array (each entry is a pair representing a week’s data).

2) Last year of commit activity
   - GET /repos/{owner}/{repo}/stats/commit_activity
   - Returns the last year of commit activity grouped by week (days array per week, starting Sunday).
   - Response: array of Commit Activity items (days, total, week).

3) All contributor commit activity
   - GET /repos/{owner}/{repo}/stats/contributors
   - Returns total commits authored by each contributor, plus a weeks array (with w: week start as Unix timestamp, a: adds, and other fields).
   - Note: contributor data is subject to exclusions consistent with the page’s general rules (no empty commits, etc.).

How to use with curl + jq (typical pattern)
- Fetch data (with required headers):
  curl -L \
    -X GET \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    https://api.github.com/repos/OWNER/REPO/stats/code_frequency

- Handle possible 202 (processing) and retry after a short interval. If 200, parse with jq, e.g.:
  curl ... | jq .

- For commit activity:
  curl -L \
    -X GET \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    https://api.github.com/repos/OWNER/REPO/stats/commit_activity | jq .

- For contributors:
  curl -L \
    -X GET \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-
EN" -H "Accept: application/vnd.github+json" https://api.github.com/repos/{owner}/{repo}/stats/code_frequency
  - GET last year of commit activity:
    - curl -H "Authorization: Bearer TOKEN" -H "Accept: application/vnd.github+json" https://api.github.com/repos/{owner}/{repo
