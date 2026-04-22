# Build Headless Agents with the Agent API | Salesforce Developers Blog
- URL: https://developer.salesforce.com/blogs/2025/04/build-headless-agents-with-the-agent-api
- Query: Salesforce approaches to embedding autonomous agents: Apex, Platform Events, Flow, Einstein/AI, API limits, security and scalability for SMB and mid-market integrations
- Published: 2025-04-15T15:00:35.000Z
- Author: Salesforce
## Summary

Summary tailored to your query: Salesforce’s approach to embedding autonomous (headless) agents, with emphasis on Apex, Platform Events, Flow, Einstein/AI, API limits, security, and scalability for SMB and mid-market integrations.

- Headless agents defined: Autonomous agents triggered without user UI, enabling background automation and integration across systems via Apex triggers, scheduled jobs, or external orchestrations.
- Agent API vs MIAW: Two Salesforce APIs for agent interaction:
  - Agent API: Designed for headless, autonomous agent use cases; simple setup and focused operations for agent conversations.
  - Messaging for In-App and Web (MIAW): UI-first, human-in-the-loop use cases (customer service), supports multiple platforms and escalation to humans; more complex to configure.
- Multi-agent workflows: Large workflows may employ an orchestrator agent coordinating multiple specialized sub-agents (e.g., in loan processing: Customer Interaction, Document Verification, Credit Score, Risk Analysis, Loan Decision). Enables distributed, autonomous collaboration across Salesforce orgs and external systems.
- Practical setup: Two-step Agent API setup:
  1) Create a connected app with required OAuth scopes.
  2) Register the connected app as a “connection” in the service agent configuration.
- How conversations work:
  - Agent conversations use synchronous or asynchronous prompts.
  - Typical flow: authenticate to Salesforce, open a conversation, send prompts to enrich context, optionally provide feedback, and close the conversation.
- Use cases and benefits: Enables autonomous, enterprise-grade workflows that can run in the background, integrate with third-party systems, and scale with multiple agents, suitable for SMB and mid-market needs with considerations for security and API usage.
- Security and governance: Highlights include OAuth-based authentication, controlled access via connections, and the need to manage API limits and secure interactions for scalable deployments.

If you’re evaluating embedding autonomous agents for SMB/mid-market integrations, focus on:
- Leveraging the Agent API for headless automation and clean, minimal setup.
- Using an orchestrator + sub-agents approach for complex processes (e.g., loan workflows).
- Planning around API limits and robust security controls as workloads scale.
