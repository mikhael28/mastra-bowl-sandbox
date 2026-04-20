# Deployment overview | Deployment | Mastra Docs
- URL: https://mastra.ai/en/docs/deployment/overview
- Query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials
## Summary

Mastra deployment options and hosting patterns

What you can deploy
- Mastra server: standalone server (Hono-based) for full control over infra, long-running processes, or WebSocket-heavy workloads.
- Monorepo deployment: Mastra server as part of a monorepo, same approach as standalone.
- Cloud providers and serverless: deploy to major cloud platforms with optional built-in deployers for Vercel, Netlify, Cloudflare; supports auto-scaling and minimal infra management.
- Web frameworks: deploy Mastra alongside your app using your framework’s standard process (e.g., Next.js on Vercel, Astro on Vercel/Netlify) with framework-specific config.
- Mastra Cloud (beta): managed hosting and observability for Mastra agents via Mastra Cloud docs.

Supported runtimes
- Node.js v22.13.0 or later
- Bun
- Deno
- Cloudflare

Hosting patterns and recommended use cases
- Full control and long-running processes: Mastra Server deployment (standalone or within a monorepo).
- Scaled, managed hosting with minimal ops: Cloud providers (Vercel, Netlify, Cloudflare, AWS Lambda/EC2, Azure App Services, Digital Ocean, Netlify, Vercel) with optional built-in deployers.
- Framework+Mastra integration: deploy alongside Next.js or Astro apps using standard framework deployment flows.
- Managed deployment and observability: Mastra Cloud (beta) for easier deployment and monitoring.

APIs and extensibility
- The docs indicate integration points via framework-specific guides and cloud provider deployers, enabling extensibility through:
  - Framework adapters (e.g., Next.js, Astro)
  - Cloud deployers for automation and scaling
  - Workflow runners for production execution (Inngest integration option)

Licensing and pricing
- The page does not include licensing or pricing details. For specifics, refer to Mastra pricing docs or contact Mastra sales.

Tutorials and guides (quick access)
- Mastra Server deployment guide
- Monorepo deployment guide
- Cloud provider deployment guides (EC2, AWS Lambda, Azure App Services, Cloudflare, Digital Ocean, Netlify, Vercel)
- Web framework deployment guides (Next.js on Vercel, Astro on Vercel/Netlify)
- Mastra Cloud overview (beta)
- Workflow runners and Inngest deployment guides

If you’re evaluating options, start with:
- If you need control and long-running processes: Mastra Server (standalone or monorepo)
- If you want minimal ops and auto-scaling: Cloud providers with built-in deployers (Vercel, Netlify, Cloudflare) or serverless (Lambda)
- If you’re integrating into an existing framework app: framework-specific deployment guides
- If you prefer a managed hosting/observability layer: Mastra Cloud (beta)

Note: For detailed steps, configurations, and pricing, consult the linked deployment guides and the Mastra Cloud documentation.
