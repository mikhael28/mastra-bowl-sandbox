# Agents overview | Mastra Docs
- URL: https://mastra.ai/docs/agents/overview
- Query: Mastra architecture and core features: agents, memory, connectors, tooling, SDKs, languages
## Summary

Mastra is an extensible AI platform focused on building, orchestrating, and executing AI-driven workflows with multiple collaborating components. Key elements and core features include:

- Agents
  - Self-contained AI entities that use LLMs and tools to solve open-ended tasks.
  - They reason about goals, select tools, manage memory, and iterate until a final answer or stop condition.
  - Can be used directly or composed into workflows or multi-agent systems.
  - Create agents via Mastra’s core, configure with instructions (system prompts) and a provider/model (via model router).
  - Access to shared services (memory, logging, observability) when registered in a Mastra instance.
  - Interact via generate() (full response) or stream() (token-by-token output).
  - Retrieved with mastra.getAgentById() and integrated into workflows, tools, or clients.

- Memory and state
  - Centralized memory and state sharing across agents and workflows to retain context and enable informed decision-making.

- Connectors and tooling
  - Tools and connectors enable agents to perform actions (calls to external services, APIs, or internal operations).
  - Agents decide which tools to call and how many iterations are needed.

- SDKs and deployment
  - Mastra provides SDKs (e.g., Mastra Client) for integration in JavaScript/TypeScript environments.
  - Supports server adapters, route handlers, and CLI usage.
  - Studio offers an interactive environment to test agents, inspect tool calls, responses, and debug behavior.

- Workflows vs. agents
  - Use agents for open-ended tasks where steps aren’t predetermined.
  - For predefined, multi-step processes with explicit control flow, use workflows instead.

- How to use
  - Instantiate an Agent with id, name, instructions, and model.
  - Register the agent in a Mastra instance to enable shared services access.
  - Retrieve and invoke via .generate() or .stream() from various entry points (workflows, tools, client, server adapters, CLI).
  - Tools and agents can leverage memory, logging, and observability features for better traceability and performance.

- References and tooling
  - Studio for testing and debugging agents.
  - Documentation and references for agent properties, generate/stream output shapes, and integration guidance.
  - Model routing to select provider/model combinations.

In short, Mastra provides a cohesive framework to create intelligent agents, manage shared memory and observability, connect with external tools, and deploy via SDKs and Studio, with clear guidance on when to choose agents versus workflows for different task types.
