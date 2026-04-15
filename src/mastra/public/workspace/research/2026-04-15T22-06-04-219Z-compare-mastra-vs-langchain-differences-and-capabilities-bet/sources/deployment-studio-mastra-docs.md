# Deployment | Studio | Mastra Docs
- URL: https://mastra.ai/docs/studio/deployment
- Query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials
## Summary

Mastra Studio deployment options and hosting patterns

- Deployment options
  - Hosted by Mastra platform: Studio is provided as a hosted service with team access via shareable links.
  - Self-hosted: Run Studio on your own infrastructure, either with or separate from your Mastra server (as a standalone SPA).

- Quickstart and local setup
  - Use the mastra CLI:
    - mastra studio to serve a standalone UI that connects to a running Mastra server (default at http://localhost:4111).
    - If no local server is detected, Studio prompts for Mastra instance URL and API prefix.
  - Install globally:
    - npm: npm install -g mastra
    - pnpm: pnpm add -g mastra
    - yarn: yarn global add mastra
    - bun: bun add --global mastra
  - Run: mastra studio
  - Access: http://localhost:3000 (default)
  - Optional subpath support: set MASTRA_STUDIO_BASE_PATH to run Studio under a subpath (e.g., /agents).

- Hosting on Mastra platform
  - Command: mastra studio deploy
  - Builds src/mastra/ into .mastra/output, packages as an artifact ZIP, uploads, and deploys to a cloud sandbox.
  - First deploy prompts to create/select a project; writes .mastra-project.json automatically.
  - Deployment states: queued → uploading → starting → running (or failed).
  - If a sandbox exists, it hot-updates in place with no downtime.
  - Stable instance URL per project slug across deploys.
  - Environment variables from .env, .env.local, and .env.production included automatically.

- Running as a server
  - Studio can run as a long-running Node.js service (like other Node apps).
  - Supported deployment patterns: PM2, Docker, cloud services that host Node.js apps.
  - Security considerations: configure CORS; monitor errors; in production, protect Studio with authentication, VPN, etc., since it has access to agents, workflows, and tools.

- Additional notes
  - Studio is a React SPA that connects to a Mastra server.
  - Subpath deployments require base path configuration for correct routing.
  - For full CLI capabilities, refer to the Mastra CLI reference and CI/CD guidance.

What you asked about (concise): 
- Deployment options: hosted by Mastra vs self-hosted; can run standalone or with Mastra server.
- Hosting patterns: local dev server, self-hosted production, Docker/PM2, cloud hosting; cloud deployment via mastra studio deploy.
- APIs and extensibility: Studio connects to Mastra server APIs; environment variables from .env files are included; base path customization supported.
- Licensing and pricing: Not specified in the page.
- Tutorials: Quickstart provided; CLI references and platform overview linked.
