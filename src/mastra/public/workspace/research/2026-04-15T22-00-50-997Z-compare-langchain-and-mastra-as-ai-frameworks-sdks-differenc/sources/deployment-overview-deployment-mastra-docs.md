# Deployment overview | Deployment | Mastra Docs
- URL: https://mastra.ai/docs/deployment/overview
- Query: Mastra deployment options and hosting docs: self-hosting, on-prem, managed service, cloud regions, and data residency controls
## Summary

Here’s a concise answer focused on your query about deployment options, hosting, and related controls:

- Self-hosting / on-prem options
  - Mastra server deployment: Build with mastra build and deploy to your own VM, container, or PaaS. Suitable for full infrastructure control, long-running processes, or WebSocket usage.
  - Monorepo deployment: Mastra server can be deployed as part of a monorepo using the same deployment approach as standalone.
  - Web framework deployments: Deploy Mastra alongside your existing app using the framework’s standard deployment flow (e.g., Next.js or Astro setups).

- Managed / platform-hosted options
  - Mastra platform: Studio (hosted visual environment for testing, workflows, traces) and Server (production API server) as managed deployment targets.
  - Cloud providers / serverless options: Optional built-in deployers for Vercel, Netlify, and Cloudflare to automate build and deployment; other cloud providers are supported via standard deployment methods (EC2, Lambda, Azure App Services, Digital Ocean, Netlify, Vercel, Cloudflare).

- Cloud regions, data residency, and hosting controls
  - The documentation covers deployment targets across multiple cloud providers and hosting environments, but it does not explicitly list per-region or data residency controls in the overview. For precise region availability and data residency, refer to provider-specific guides (e.g., AWS, Azure, Cloudflare guides) and Mastra platform documentation for any region-specific configuration options.
  - If you need strict data residency, you’ll likely rely on:
    - Self-hosted Mastra server or monorepo deployment on your own infrastructure or a private cloud region.
    - Using Mastra platform in a hosted setup with regional data management policies, if supported by your subscription.
    - Choosing cloud-provider deployments in desired regions via their deployment guides (e.g., AWS Lambda/EC2 regions, Vercel/Netlify/Cloudflare boundaries).

- Workflow and runtime support
  - Runtime environments: Node.js v22.13+ (default), Bun, Deno, Cloudflare Workers.
  - Workflows can run on the built-in engine, with potential deployment to Inngest or other managed runners for production QoS features.

- How to choose based on your needs
  - Maximum control and on-prem requirements: Mastra server on your own VM/container, or monorepo deployment.
  - Quick start with managed hosting: Mastra platform (Studio + Server) or cloud providers with built-in deployers (Vercel, Netlify, Cloudflare) for scalable hosting.
  - Existing infrastructure: Deploy alongside your web framework using standard deployment flows.

If you want, I can map these options to concrete steps for your environment (e.g., on-prem Kubernetes, specific cloud region choices, or a comparison table of self-host vs. managed options with data residency implications).
