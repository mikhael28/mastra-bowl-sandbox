# Role-based access control - Docs by LangChain
- URL: https://docs.langchain.com/langsmith/rbac
- Query: LangChain / LangSmith enterprise features, observability and governance pages, SLA and compliance documentation
## Summary

Summary:

- The page explains LangSmith’s Role-Based Access Control (RBAC), an Enterprise feature for managing workspace-level permissions within LangSmith, with organization-level roles also possible in Plus/Enterprise plans.
- Key concepts:
  - Each user has an organization role (applies across the whole organization) and a workspace role (per workspace they belong to; requires Enterprise RBAC).
  - Organization roles are fixed (not customizable): Organization Admin, Organization Operator, Organization User, Organization Viewer. Organization User/Viewer are only on Plus/Enterprise; in Developer orgs, users default to Organization Admin.
  - Custom workspace roles with granular permissions are available on Enterprise plans.
  - RBAC setup and role assignment are documented in the User Management guide.
- Role highlights:
  - Organization Admin: full control over organization settings, users, billing, and workspaces (permissions include organization:manage, organization:read, organization:pats:create).
  - Organization Operator: manage workspaces and users (day-to-day ops; non-admin).
  - Organization User: read access to organization info; can create personal access tokens.
  - Organization Viewer: read-only access to organization info.
- For comprehensive permissions mapping, see:
  - Organization and workspace reference (permissions by operation and role).
  - User Management guide (setup RBAC and assign roles).
- Enterprise-specific notes:
  - Custom workspace roles and granular permissions are available.
  - If you’re evaluating RBAC, contact LangSmith sales for enterprise features.

User intent alignment (query: “LangChain / LangSmith enterprise features, observability and governance pages, SLA and compliance documentation”):
- This page provides the RBAC framework, how enterprise roles apply to governance and access control, and directs to detailed permission references and governance-related guides. If you need observability, SLA, or compliance specifics, follow the referenced Organization/Workspace operations and governance docs linked within.
