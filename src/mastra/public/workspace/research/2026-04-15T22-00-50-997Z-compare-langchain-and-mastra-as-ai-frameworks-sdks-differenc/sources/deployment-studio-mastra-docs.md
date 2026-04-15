# Deployment | Studio | Mastra Docs
- URL: https://mastra.ai/docs/studio/deployment
- Query: Mastra deployment options and hosting docs: self-hosting, on-prem, managed service, cloud regions, and data residency controls
## Summary

Summary:

- Studio deployment options
  - Self-hosted Studio: Run Studio as a standalone SPA on your own infrastructure and connect to a Mastra server (local or remote). Can be deployed alongside the Mastra server or separately.
  - Mastra platform (managed): Use Mastra’s hosted Studio with team access via links; Platform handles provisioning, deployment, and hosting.

- Quickstart and hosting details
  - CLI-based deployment:
    - Local development: mastra studio serves a standalone UI that connects to a Mastra server.
    - Full cloud deployment: mastra studio deploy builds, packages, and deploys Studio to a cloud sandbox as an artifact ZIP.
  - Install and run:
    - Install mastra CLI (npm, pnpm, Yarn, or Bun).
    - Run mastra studio to start the SPA; default Mastra server URL is http://localhost:4111, with a fallback form to input a custom Mastra instance URL and API prefix.
  - Subpath deployment:
    - If Studio is hosted under a subpath, export MASTRA_STUDIO_BASE_PATH to ensure correct base URL and asset routing.

- Cloud deployment workflow (Mastra platform)
  - Run mastra studio deploy to provision and deploy to a cloud sandbox.
  - On first deploy, create or choose a project; a .mastra-project.json file is created automatically.
  - Deployment stages: queued → uploading → starting → running (or failed).
  - If a sandbox exists, updates occur in place with no downtime.
  - Environment variables from .env(.local/.production) are included automatically.
  - Instance URL is project-slug based and stable across deploys.

- Running and security considerations
  - Studio can be run long-term as a Node.js service (supporting PM2, Docker, and cloud environments).
  - Ensure proper CORS configuration and monitoring.
  - Security note: Studio has full access to agents, workflows, and tools once connected; secure production deployments (authentication, VPN, etc.) to prevent unauthorized access.

- Additional references
  - mastra CLI reference for full flags and CI/CD usage.
  - Authentication and platform docs for securing access in production.

If you need guidance specific to self-hosted versus managed hosting, or recommendations for data residency and region hosting, I can tailor the details to your stack and compliance requirements.
