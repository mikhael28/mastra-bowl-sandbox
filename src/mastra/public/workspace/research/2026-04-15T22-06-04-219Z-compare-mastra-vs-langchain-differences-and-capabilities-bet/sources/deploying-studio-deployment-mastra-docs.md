# Deploying Studio | Deployment | Mastra Docs
- URL: https://mastra.ai/docs/deployment/studio
- Query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials
## Summary

Summary tailored to your query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials

What the page covers
- Deployment options for Studio:
  - Mastra Cloud: Hosted Studio with shareable team access.
  - Self-hosted Studio: Run on your own infrastructure (standalone SPA or alongside Mastra server).
- How Studio relates to Mastra:
  - Studio is a React SPA that connects to a Mastra server; mastra studio serves a standalone UI, while mastra dev runs Studio and API for development.
- Running Studio locally:
  - Install mastra CLI (npm, pnpm, yarn, or bun) and run mastra studio.
  - Default UI at localhost:3000; it tries to connect to Mastra server at localhost:4111, with a fallback form to enter a Mastra instance URL and API prefix.
  - Optional base path: set MASTRA_STUDIO_BASE_PATH if hosting under a subpath (e.g., /agents behind Nginx).
  - Studio serves static files via Node http and serve-handler.
- Deployment approaches:
  - Standalone Studio: long-running Node.js service; suitable for separate hosting with proper CORS and security.
  - Alongside Mastra server: build Studio assets (mastra build --studio) and configure Mastra to serve them (MASTRA_STUDIO_PATH) from .mastra/output.
- Considerations and cautions:
  - Security: Studio has full access to your agents, workflows, and tools once connected; secure in production (authentication, VPN, etc.).
  - Authentication guidance linked to server docs.
- Publishing with a CDN:
  - Direct CDN deployment isn’t supported for built Studio assets due to dynamic config requirements.
  - You can still create a standalone SPA from built assets and host on static hosting (e.g., Netlify, Vercel) using a setup like Vite.
- Example deployment workflow:
  - Self-hosted standalone:
    - npm/pnpm/yarn/bun installation of mastra CLI.
    - mastra studio to start.
  - Co-located with Mastra server:
    - mastra build --studio to generate assets.
    - Set MASTRA_STUDIO_PATH to point the Mastra server to the Studio assets, then run the server.
- Notable commands and paths:
  - mastra studio to run Studio independently.
  - mastra build --studio to produce assets for co-hosting with Mastra server.
  - MASTRA_STUDIO_BASE_PATH to support subpath deployments.
  - MASTRA_STUDIO_PATH to serve Studio from Mastra server.

What’s not covered (and where to look)
- Licensing, pricing, and detailed tutorials are not included on this page; refer to Mastra Cloud pricing docs and the broader Mastra docs for licensing terms.
- Detailed API surface, authentication methods, and enterprise security features beyond the general caution; check the Authentication docs (linked) for specifics.
- Step-by-step tutorials beyond the deployment basics; for in-depth tutorials
