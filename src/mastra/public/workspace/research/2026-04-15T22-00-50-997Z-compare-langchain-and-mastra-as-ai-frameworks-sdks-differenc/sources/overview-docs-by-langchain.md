# Overview - Docs by LangChain
- URL: https://docs.langchain.com/langsmith/administration-overview
- Query: LangChain / LangSmith enterprise features, observability and governance pages, SLA and compliance documentation
## Summary

Summary tailored to your query (LangChain/LangSmith enterprise features, observability/governance, SLA and compliance):

- LangSmith enterprise scope:
  - Organization-level governance: manage users, SSO/OAuth, custom roles, billing, usage tracking.
  - Resource hierarchy: Organizations > Workspaces > Applications > Resources.
  - Separate personal vs shared organizations: collaboration, billing, and workspace limits differ by plan.

- Observability and governance features:
  - Workspaces isolate teams and access; RBAC governs workspace permissions.
  - Applications organize resources within a workspace; resources include tracing projects, datasets, prompts, and deployments.
  - Resource tagging and ABAC controls to manage access across applications.
  - Workload isolation guidance to tailor resource organization to isolation requirements.
  - Centralized visibility across resources via LangSmith UI (applications, resources, and tracing data).

- Observability capabilities:
  - Tracing projects and prompts for Monitoring and Observability.
  - Metrics and usage tracking at organization/workspace levels.
  - Logs and deployment visibility tied to applications and resources.

- Compliance and governance considerations:
  - Organization-level policy management (SSO, OAuth, roles).
  - Billing governance across plans; personal vs shared organization implications.
  - Access control and resource provisioning aligned with RBAC and ABAC models.

- SLA and reliability (implied through enterprise setup):
  - Enterprise planning generally includes centralized administration, role-based access, and policy enforcement, with configurable collaboration and billing options.

- How to navigate and implement:
  - Use the Documentation Index to locate pages on setup, administration, and governance.
  - Follow the hierarchy setup: create organization, add workspaces, define applications, then assign resources.
  - Leverage tags and ABAC to control cross-application access and resource visibility.
  - Refer to setup guides for organization/workspace creation and best practices for workload isolation.

If you want, I can extract specific SLA or compliance policy details from the LangSmith docs or compare enterprise features across plans.
