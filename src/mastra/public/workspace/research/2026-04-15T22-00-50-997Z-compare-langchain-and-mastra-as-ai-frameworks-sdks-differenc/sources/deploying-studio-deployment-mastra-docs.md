# Deploying Studio | Deployment | Mastra Docs
- URL: https://mastra.ai/docs/deployment/studio
- Query: Mastra deployment options and hosting docs: self-hosting, on-prem, managed service, cloud regions, and data residency controls
## Summary

Summary tailored to your query: Mastra deployment options and hosting, including self-hosting, on-prem, managed service, cloud regions, and data residency controls

- Deployment options
  - Mastra Cloud: Studio is hosted for you; easy team sharing via links.
  - Self-hosted Studio: Run Studio on your own infrastructure, either alongside a Mastra server or as a standalone SPA.

- Self-hosting / on-prem considerations
  - Use the mastra studio CLI to run Studio as a standalone UI that connects to a running Mastra server.
  - You can deploy Studio under a subpath (e.g., /agents) by setting MASTRA_STUDIO_BASE_PATH, to ensure correct base URL and asset routing.
  - Running Studio like any Node.js service: suitable for PM2, Docker, or cloud environments; ensure proper CORS configuration and monitoring.
  - Security note: Studio gains full access to your agents/workflows/tools once connected; secure with authentication, VPN, etc.

- Running alongside Mastra server
  - Build Studio with mastra build --studio to generate assets, then serve Studio from the Mastra server.
  - Set MASTRA_STUDIO_PATH to point the Mastra server to the built Studio assets.

- Hosting and deployment basics
  - Studio is a React SPA; runs in the browser and connects to a Mastra server.
  - Local development defaults: Studio at localhost:3000; tries to connect to Mastra at localhost:4111 unless configured otherwise.
  - When hosting under a subpath, you must configure the base path so the SPA and API calls resolve correctly.

- CDN and static hosting caveat
  - Built Studio assets aren’t directly deployable to a CDN due to dynamic configuration needs.
  - You can create a standalone SPA from the built assets and host it on static platforms (e.g., Netlify, Vercel) with additional setup (e.g., Vite-based SPA).

- Cloud regions and data residency
  - The page does not provide explicit details on cloud region selections or data residency controls.
  - If using Mastra Cloud, regional options and data residency controls would typically be managed by the cloud provider’s capabilities or Mastra’s enterprise offerings; refer to Mastra Cloud docs or contact support for specifics.

- Quick setup commands
  - Install and run Studio locally:
    - npm install -g mastra
    - mastra studio
  - If hosting with a Mastra server:
    - mastra build --studio
    - Set MASTRA_STUDIO_PATH to .mastra/output/studio and run the server to serve Studio from the Mastra backend.

- Security best practices
  - Secure Studio behind authentication/VPN in production.
  - Regularly monitor logs and errors; ensure CORS is properly configured when Studio is self-hosted.

If you want, I can tailor this to a particular deployment scenario (e.g., purely on-prem with Docker, or Mastra Cloud with restricted regional data residency) and pull out the exact steps and config
