# Releases · mastra-ai/mastra - GitHub
- URL: https://github.com/mastra-ai/mastra/releases
- Query: Mastra repository and package metrics: GitHub repo, npm/pypi/registry stats, stars, forks, contributors, download counts, release cadence
- Author: mastra-ai
## Summary

Summary of the Mastra releases page

What this page covers:
- Release notes for Mastra AI (mastra-ai/mastra) with highlights from the latest release and the @mastra/core@1.24.0 changes.
- Focus areas include end-to-end RAG tracing, expanded observability, span filtering, AI SDK v6 support, and reliability improvements.
- Breaking change: CloudExporter endpoint format updated (base endpoint configuration required).

Key highlights relevant to users and developers:
- End-to-end RAG tracing: New span types (RAG_INGESTION, RAG_EMBEDDING, RAG_VECTOR_OPERATION, RAG_ACTION, GRAPH_ACTION) with helpers like startRagIngestion()/withRagIngestion(). Instrumentation opt-in via observabilityContext. Automatic context threading for RAG tools.
- CloudExporter enhancements: Now ships all observability signals (logs, metrics, scores, feedback, and traces) to Mastra Cloud via a unified exporter path. Requires base collector URL; publish paths derived automatically.
- Span filtering to cut noise and cost: New excludeSpanTypes and spanFilter in ObservabilityInstanceConfig to drop whole span categories or apply predicate filtering before export.
- AI SDK v6 compatibility: Mastra core now supports AI SDK v6 messages in MessageList; added helpers to load/store between Mastra messages and AI SDK v5/v6 UIs.
- Reliability and debugging: Improved log correlation across agent runs; better memory recall for browsing and part timing; MCP tool resilience with reconnects and correct 404s.
- Breaking changes: CloudExporter endpoint format changed; set a base endpoint URL and let Mastra derive publisher paths.

Changelog snapshot (@mastra/core@1.24.0):
- Added excludeSpanTypes and spanFilter to filter spans prior to export to reduce observability costs.
- Introduced RAG observability with new span types listed above to surface RAG ingestion and query activity in tracing.
- Examples provided for excludeSpanTypes and spanFilter usage.
- General improvements to reliability, memory recall, and debugging.

If you’re evaluating Mastra for observability and RAG workflows, this release prioritizes reducing observability cost, improving RAG trace visibility, and enabling a unified export path to Mastra Cloud. To adopt:
- Update to @mastra/core@1.24.0 and related packages.
- Configure ObservabilityInstanceConfig with excludeSpanTypes and/or spanFilter to suit your usage and billing model.
- Update CloudExporter endpoint configuration to use the new base endpoint format.
