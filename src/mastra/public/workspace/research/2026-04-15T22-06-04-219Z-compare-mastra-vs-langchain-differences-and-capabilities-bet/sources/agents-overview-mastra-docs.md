# Agents overview | Mastra Docs
- URL: https://mastra.ai/en/docs/agents/overview
- Query: Mastra framework overview: architecture, core components (agents, memory, pipelines), SDKs and tool integrations
## Summary

Summary of Mastra framework overview (architecture, core components, SDKs and tool integrations)

- Architecture and core idea
  - Mastra enables building AI-driven systems using agents that reason about goals, select tools, manage memory, and iterate until a final answer or stop condition.
  - Agents can be used standalone or composed into workflows, pipelines, or multi-agent systems.
  - Shared services (memory, logging, observability) and a model routing system are available to agents.

- Core components
  - Agents
    - Purpose: Open-ended reasoning tasks where steps aren’t pre-defined.
    - Capabilities: Decide which tools to call, loop/stop conditions, retain memory, produce structured responses.
    - Key API: Instantiate Agent with id, name, instructions (system prompts), and model (provider/model-name).
    - Lifecycle: Registered in Mastra instance; accessible through workflows, tools, or agents; can be invoked via generate() or stream().
    - Interactions: Supports memory, logging, observability, and shared services; can be tested in Studio.
  - Memory
    - Shared across agents and workflows to retain context across interactions.
  - Workflows
    - For predetermined, multi-step processes with explicit control flow.
    - Use workflows when steps are known in advance; otherwise, use agents.
  - Tool integrations
    - Agents can call tools; tool calls and results are part of the agent’s generate() output.
    - Tools can be wired into workflows or agents, enabling external APIs, data fetches, or actions.
  - Observability and infrastructure
    - Shared services like logging and storage are available to agents; supports debugging and monitoring.

- SDKs and integration points
  - Client-side and server-side usage
    - Mastra provides a Mastra client and a core API to retrieve agents by ID and invoke actions.
  - APIs and references
    - Agent reference for properties and configurations.
    - Guides and Studio for testing and debugging agent behavior.
  - Model routing
    - Models are referenced as provider/model-name (via Mastra’s model router) to support multi-provider usage.

- How to get started
  - Create and configure an Agent with required properties (id, name, instructions, model).
  - Register the agent in a Mastra instance to make it available across the app.
  - Use mastra.getAgentById() to retrieve and call generate() for full responses or stream() for incremental output.
  - Choose between agents (open-ended) and workflows (explicit steps) based on task structure.

- Practical usage notes
  - Use agents for open-ended tasks requiring decision-making about tool usage and looping.
  - Use workflows for fixed, multi-step processes with explicit control flow.
  - Leverage shared memory and observability to maintain context and monitor performance across agents and tools.
  - Studio is recommended for testing agents, inspecting tool calls, and debugging behavior.
