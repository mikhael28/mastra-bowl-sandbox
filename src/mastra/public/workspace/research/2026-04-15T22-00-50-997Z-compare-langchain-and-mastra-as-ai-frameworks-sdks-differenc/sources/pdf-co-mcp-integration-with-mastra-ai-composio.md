# Pdf co MCP Integration with Mastra AI | Composio
- URL: https://composio.dev/toolkits/pdf_co/framework/mastra-ai
- Query: Mastra SOC 2 Type II report PDF 2026
- Published: 2026-02-28T15:22:01.000Z
## Summary

Summary:

- This page explains how to connect Pdf co MCP (Model Context Protocol) to Mastra AI using Composio’s tool router, enabling a Mastra AI agent to control Pdf co capabilities.
- Key capabilities enabled by the integration:
  - Extract structured data from PDFs (e.g., invoices) using Pdf co templates.
  - Convert Excel files (via URL) to JSON, CSV, HTML, etc., for downstream processing.
  - Generate and encode barcodes (including QR codes) for payment links and labeling.
  - Create, merge, and split PDF documents automatically.
  - Manage asynchronous Pdf co jobs (uploads, status tracking, result retrieval) through the agent.
- Mastra AI context:
  - TypeScript framework for building AI agents with tool support via MCP.
  - Supports OpenAI integration, step callbacks for debugging, toolsets, and MCP client capabilities.
- What the integration achieves for your query context (Mastra SOC 2 Type II report PDF 2026):
  - If you need to automate handling of a 2026 SOC 2 report PDF (e.g., extraction of audit sections, metadata, controls, dates), the Pdf co MCP server can be used by your Mastra AI agent to:
    - Upload and process the SOC 2 report PDF and extract specified data points using templates.
    - Convert and export embedded data (tables) to JSON/CSV for analysis.
    - Generate QR codes for related payment or verification links if needed.
    - Merge or split related PDFs (versions or addenda) into a single document automatically.
- Getting started workflow (high level):
  - Connect Pdf co to Mastra AI via Composio’s MCP tool router (handle OAuth/token management automatically).
  - Attach Pdf co tool definitions as a toolset in Mastra, configure MCP client to the Composio MCP URL.
  - Create a Tool Router session exposing Pdf co tools to your Mastra agent.
  - Build an agent that can call Pdf co tools, parse results, and return structured outputs (e.g., extracted SOC 2 sections, audit dates, and control descriptions).

If you want a more focused extraction plan for the SOC 2 Type II report (e.g., which sections to extract, templates to use), I can tailor the data points and a minimal code snippet to implement the extraction workflow.
