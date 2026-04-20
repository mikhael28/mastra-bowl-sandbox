# Deployment | Mastra Cloud | Mastra Docs
- URL: https://www.mastra.ai/docs/mastra-cloud/deployment
- Query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials
## Summary

Summary:

- Deployment purpose: Expose Mastra agents, tools, and workflows as REST API endpoints in production via Mastra Cloud. Cloud is in beta but widely used for managed deployments.

- How to enable:
  - In project settings, choose Deployment and enable Deployments.
  - On future pushes to the main branch, automatic redeployments occur.

- Dashboard overview:
  - Shows domain URL, status, latest deployment, connected agents/workflows.
  - Deployments section for build logs; Settings to configure environment variables, branch, storage, and endpoint URLs.
  - Note: Changes in Settings require a new deployment to take effect.

- Storage options:
  1) Mastra Cloud Store (managed): Configured at the Mastra instance level, not per-agent memory.
     - Example setup uses LibSQLStore; storage is defined on Mastra instance.
     - Agents can inherit instance-level storage (no per-agent storage needed).
  2) Bring your own database: Use any external storage provider with appropriate configuration.
     - Set database connection strings as environment variables in project Settings.

- Using the deployment:
  - Interact with agents via the Mastra Client or REST API endpoints.

- Next steps and related topics:
  - Studio: Test agents in the cloud.
  - Observability: Monitor traces and logs.

- Practical considerations:
  - If using Mastra Cloud Store, expect instance-level storage configuration and inheritance for agents.
  - Changes to deployment settings require a fresh deployment to apply.
  - Deployment is designed to simplify hosting and exposure of agents as API endpoints.
