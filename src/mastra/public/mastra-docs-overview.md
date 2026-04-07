# Mastra Documentation Overview

> Generated on 2026-04-07 from the Mastra docs source.
> This document covers the high-level concepts and architecture of Mastra — an AI framework for TypeScript.

---

## Table of Contents

- [Introduction](#introduction)
- [Agents](#agents)
- [Workflows](#workflows)
- [Memory](#memory)
- [RAG (Retrieval-Augmented Generation)](#rag-retrieval-augmented-generation-)
- [Voice](#voice)
- [Streaming](#streaming)
- [MCP (Model Context Protocol)](#mcp-model-context-protocol-)
- [Evaluations](#evaluations)
- [Observability](#observability)
- [Deployment](#deployment)
- [Server](#server)
- [Studio](#studio)
- [Mastra Cloud](#mastra-cloud)
- [Workspace](#workspace)

---



# Introduction

# Get started

Build AI agents your users actually depend on. Mastra is a TypeScript framework that gives you everything you need to prototype fast and ship with confidence. Create your first agent with a single command and start building.

## Quickstart

Run this command to create a new project you can test immediately in [Studio](/docs/studio/overview):

```bash npm2yarn
npm create mastra@latest
```

See the [quickstart guide](/guides/getting-started/quickstart) for a full walkthrough.

## Integrate with your framework

Add Mastra to an existing project, or create a new app with your preferred framework:

For other frameworks, see the [framework integration guides](/guides/getting-started/next-js).

## What you can build

Here are some of the ways you can use Mastra:


  <details>
    <summary>Embed agents in your product</summary>

    Add AI capabilities to your platform so your users can build or interact with agents.

    Used by [Replit](https://mastra.ai/blog/replitagent3), [Fireworks](https://mastra.ai/blog/fireworks-xml-prompting), [Medusa](https://mastra.ai/blog/medusa-ecommerce)
  </details>

  <details>
    <summary>Customer-facing assistants</summary>

    Build agents that handle inquiries, schedule appointments, send reminders, and answer questions via chat, WhatsApp, or voice.

    Used by [Vetnio](https://mastra.ai/blog/vetnio), [Lua](https://mastra.ai/blog/lua-scaling)

    Templates: [Docs Chatbot](https://mastra.ai/templates/docs-chatbot), [Slack Agent](https://mastra.ai/templates/slack-agent)
  </details>

  <details>
    <summary>Internal copilots</summary>

    Help employees work faster with AI that understands your domain—HR queries, clinical documentation, sales prep, or document generation.

    Used by [Factorial](https://mastra.ai/blog/factorial-case-study), [Counsel Health](https://mastra.ai/blog/counsel-health), [Cedar](https://mastra.ai/blog/cedar-case-study), [SoftBank](https://mastra.ai/blog/softbank-productivity-mastra-2025-08-20)

    Templates: [Chat with PDF](https://mastra.ai/templates/chat-with-pdf), [Google Sheet Analysis](https://mastra.ai/templates/google-sheets-analysis)
  </details>

  <details>
    <summary>Data analysis agents</summary>

    Let users query databases and dashboards in natural language. Connect to your data sources and return answers, charts, or reports.

    Used by [Index](https://mastra.ai/blog/index-case-study), [PLAID Japan](https://mastra.ai/blog/plaid-jpn-gcp-agents)

    Templates: [Chat with Database](https://mastra.ai/templates/text-to-sql), [CSV to Questions](https://mastra.ai/templates/csv-to-questions)
  </details>

  <details>
    <summary>Content automation</summary>

    Generate, transform, and manage structured content at scale—whether for a CMS, knowledge base, or documentation system.

    Used by [Sanity](https://mastra.ai/blog/sanity)

    Templates: [Chat with YouTube](https://mastra.ai/templates/chat-with-youtube), [Flash Cards from PDF](https://mastra.ai/templates/flash-cards-from-pdf)
  </details>

  <details>
    <summary>DevOps & engineering automation</summary>

    Automate deployments, debug production issues, manage infrastructure, and handle on-call workflows.

    Used by [StarSling](https://mastra.ai/blog/starsling)

    Templates: [GitHub PR Code Review](https://mastra.ai/templates/github-pr-code-review-agent), [Browser Agent](https://mastra.ai/templates/browsing-agent)
  </details>

  <details>
    <summary>Sales & GTM workflows</summary>

    Turn customer conversations into structured tasks, generate investment memos, or automate outreach sequences.

    Used by [Kestral](https://mastra.ai/blog/kestral), [Orange Collective](https://mastra.ai/blog/orange-collective-vc-operating-system), [WorkOS](https://mastra.ai/blog/workos-teaching-mastra)

    Templates: [Customer Feedback Summarization](https://mastra.ai/templates/customer-feedback-summarization)
  </details>


Browse [templates](https://mastra.ai/templates) for working examples.

## Not ready to build yet?

Watch this quick introduction:

---

# Project structure

Your new Mastra project, created with the `create mastra` command, comes with a predefined set of files and folders to help you get started.

Mastra is a framework, but it's **unopinionated** about how you organize or colocate your files. The CLI provides a sensible default structure that works well for most projects, but you're free to adapt it to your workflow or team conventions. You could even build your entire project in a single file if you wanted! Whatever structure you choose, keep it consistent to ensure your code stays maintainable and straightforward to navigate.

## Default project structure

A project created with the `create mastra` command looks like this:

```
src/
├── mastra/
│   ├── agents/
│   │   └── weather-agent.ts
│   ├── tools/
│   │   └── weather-tool.ts
│   ├── workflows/
│   │   └── weather-workflow.ts
│   ├── scorers/
│   │   └── weather-scorer.ts
│   └── index.ts
├── .env.example
├── package.json
└── tsconfig.json
```

> **Tip:**
Use the predefined files as templates. Duplicate and adapt them to quickly create your own agents, tools, workflows, etc.


### Folders

Folders organize your agent's resources, like agents, tools, and workflows.

| Folder | Description |
| - | - |
| `src/mastra` | Entry point for all Mastra-related code and configuration. |
| `src/mastra/agents` | Define and configure your agents - their behavior, goals, and tools. |
| `src/mastra/workflows` | Define multi-step workflows that orchestrate agents and tools together. |
| `src/mastra/tools` | Create reusable tools that your agents can call |
| `src/mastra/mcp` | (Optional) Implement custom MCP servers to share your tools with external agents |
| `src/mastra/scorers` | (Optional) Define scorers for evaluating agent performance over time |
| `src/mastra/public` | (Optional) Contents are copied into the `.build/output` directory during the build process, making them available for serving at runtime |

### Top-level files

Top-level files define how your Mastra project is configured, built, and connected to its environment.

| File | Description |
| - | - |
| `src/mastra/index.ts` | Central entry point where you configure and initialize Mastra. |
| `.env.example` | Template for environment variables - copy and rename to `.env` to add your secret [model provider](/models) keys. |
| `package.json` | Defines project metadata, dependencies, and available npm scripts. |
| `tsconfig.json` | Configures TypeScript options such as path aliases, compiler settings, and build output. |

## Next steps

- Read more about [Mastra's features](/docs#what-you-can-build).
- Integrate Mastra with your frontend framework: [Next.js](/guides/getting-started/next-js), [React](/guides/getting-started/vite-react), or [Astro](/guides/getting-started/astro).
- Build an agent from scratch following one of our [guides](/guides).
- Watch conceptual guides on our [YouTube channel](https://www.youtube.com/@mastra-ai) and [subscribe](https://www.youtube.com/@mastra-ai?sub_confirmation=1)!

---



# Agents

# Agents overview

Agents use LLMs and tools to solve open-ended tasks. They reason about goals, decide which tools to use, retain conversation memory, and iterate internally until the model emits a final answer or an optional stop condition is met. Agents produce structured responses you can render in your UI or process programmatically. Use agents directly or compose them into workflows or multi-agent systems.

## When to use agents

Use agents when the task is open-ended and the steps aren't known in advance. An agent decides which tools to call, how many times to loop, and when to stop. You provide the goal and constraints instead of defining each step. For predetermined, multi-step processes with explicit control flow, use [workflows](/docs/workflows/overview) instead.

> **Tip:**
Watch an introduction to agents, and how they compare to workflows on [YouTube (7 minutes)](https://youtu.be/0jg2g3sNvgw).


## Quickstart

Create an agent by instantiating the `Agent` class from `@mastra/core` and provide the required properties:

```typescript
export const testAgent = new Agent({
  id: 'test-agent',
  name: 'Test Agent',
  instructions: 'You are a helpful assistant.',
  model: 'openai/gpt-5.4',

```

The `instructions` define the agent's behavior, personality, and capabilities. They're system-level prompts that establish the agent's core identity and expertise. The `model` is specified as `'provider/model-name'` using Mastra's [model router](/models).

To make the agent available throughout your application, register it in your Mastra instance (typically located in `src/mastra/index.ts`):

```typescript
export const mastra = new Mastra({
  agents: { testAgent },

```

Once registered, it can be called from workflows, tools, or other agents, and has access to shared resources such as memory, logging, and observability features.

> **Tip:**
Use [Studio](/docs/studio/overview) to test your agent with different messages, inspect tool calls and responses, and debug agent behavior.


> **Note:**
Visit the [agent reference](/reference/agents/agent) for more information on available properties and configurations.


## Use your agent

After registration, retrieve your agent with [`mastra.getAgentById()`](/reference/core/getAgentById). Call `.generate()` for a complete response or `.stream()` to deliver tokens in real time. You can call agents from [workflow steps](/docs/workflows/agents-and-tools), [tools](/docs/agents/using-tools), the [Mastra Client](/reference/client-js/mastra-client), route handlers, [server adapters](/docs/server/server-adapters), or the command line. Visit the [guides section](/guides) to learn how to use agents in your framework of choice.

When referencing an agent from your Mastra instance, use `mastra.getAgentById()` to ensure it has access to shared services such as instance-level storage, logging, and agent registry. A directly imported agent can still work with its own local configuration, but it won't have access to those shared services.


  Returns the full response after all tool calls and steps complete. The result includes `text`, `toolCalls`, `toolResults`, `steps`, and token `usage` statistics.

    ```ts
    const agent = mastra.getAgentById('test-agent')
    const response = await agent.generate('Help me organize my day')
    console.log(response.text)
    ```

Returns a stream you can consume as tokens arrive. The result exposes `textStream` for incremental output and promises for `toolCalls`, `toolResults`, `steps`, and token `usage` that resolve when the stream finishes.

    ```ts
    const agent = mastra.getAgentById('test-agent')
    const stream = await agent.stream('Help me organize my day')

    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk)

    ```

## Expand your agent

Once your agent is running, use this table to find the right page for what you want to do next:

| Goal | Start here |
| - | - |
| Give your agent tools to call external APIs or services | [Tools](/docs/agents/using-tools) |
| Keep context and preferences across conversations | [Memory](/docs/memory/overview) |
| Get typed objects back instead of plain text | [Structured output](/docs/agents/structured-output) |
| Human-in-the-loop: Pause execution and wait for human approval | [Approval](/docs/agents/agent-approval) |
| Build a multi-agent network | [Supervisor agents](/docs/agents/supervisor-agents) |
| Register subagents | [Tools](/docs/agents/using-tools#agents-as-tools) |
| Intercept or transform messages before and after generation | [Processors](/docs/agents/processors) |
| Keep your agent safe | [Guardrails](/docs/agents/guardrails) |
| Swap instructions or models based on request context | [Dynamic configuration](/docs/server/request-context) |
| Add speech-to-text or text-to-speech | [Voice](/docs/agents/adding-voice) |
| Connect to Slack, Discord, or Telegram | [Channels](/docs/agents/channels) |

## Multi-agent systems

A multi-agent system uses multiple agents to solve a task that's too broad or too specialized for a single agent. Instead of building one agent with dozens of tools and a long instruction set, you split responsibilities across focused agents and let a coordinator bring results together.

Read the [conceptual overview of multi-agent systems](/guides/concepts/multi-agent-systems) to learn how you can apply different patterns with Mastra.

---

# Tools

Agents use tools to call APIs, query databases, or run custom functions from your codebase. Tools give agents capabilities beyond language generation by providing structured access to data and performing clearly defined operations. You can also load tools from remote [MCP servers](/docs/mcp/overview) to expand an agent's capabilities.

## When to use tools

Use tools when an agent needs additional context or information from remote resources, or when it needs to run code that performs a specific operation. This includes tasks a model can't reliably handle on its own, such as fetching live data or returning consistent, well-defined outputs.

## Quickstart

Import [`createTool`](/reference/tools/create-tool) from `@mastra/core/tools` and define a tool with an `id`, `description`, `inputSchema`, `outputSchema`, and `execute` function.

This example shows how to create a tool that fetches weather data from an API. When the agent calls the tool, it provides the required input as defined by the tool's `inputSchema`. The tool accesses this data through its `inputData` parameter, which in this example includes the `location` used in the weather API query.

```typescript
export const weatherTool = createTool({
  id: 'weather-tool',
  description: 'Fetches weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  outputSchema: z.object({
    weather: z.string(),
  }),
  execute: async inputData => {
    const { location } = inputData

    const response = await fetch(`https://wttr.in/${location}?format=3`)
    const weather = await response.text()

    return { weather }
  },

```

When creating tools, keep descriptions concise and focused on what the tool does, emphasizing its primary use case. Descriptive schema names can also help guide the agent on how to use the tool.

> **Note:**
Visit the [`createTool`](/reference/tools/create-tool) reference for more information on available properties, configurations, and examples.


To make a tool available to an agent, add it to the `tools` property on the `Agent` class. Mentioning available tools and their general purpose in the agent's system prompt helps the agent decide when to call a tool and when not to.

```typescript
export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: `
    You are a helpful weather assistant.
    Use the weatherTool to fetch current weather data.`,
  model: 'openai/gpt-5.4',
  tools: { weatherTool },

```

## Multiple tools

An agent can use multiple tools to handle more complex tasks by delegating specific parts to individual tools. The agent decides which tools to use based on the user's message, the agent's instructions, and the tool descriptions and schemas.

```typescript
export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: `
    You are a helpful weather assistant.
    Use the weatherTool to fetch current weather data.
    Use the hazardsTool to provide information about potential weather hazards.`,
  model: 'openai/gpt-5.4',
  tools: { weatherTool, hazardsTool },

```

## Agents as tools

Add subagents through the `agents` configuration to create a [supervisor](/docs/agents/supervisor-agents). Mastra converts each subagent to a tool named `agent-<key>`. Include a `description` on each subagent so the supervisor knows when to delegate.

```typescript
const writer = new Agent({
  id: 'writer',
  name: 'Writer',
  description: 'Drafts and edits written content',
  instructions: 'You are a skilled writer.',
  model: 'openai/gpt-5.4',

export const supervisor = new Agent({
  id: 'supervisor',
  name: 'Supervisor',
  instructions: 'Coordinate the writer to produce content.',
  model: 'openai/gpt-5.4',
  // highlight-next-line
  agents: { writer },

```

## Workflows as tools

Add workflows through the `workflows` configuration. Mastra converts each workflow to a tool named `workflow-<key>`, using the workflow's `inputSchema` and `outputSchema`. Include a `description` on the workflow so the agent knows when to trigger it.

```typescript
export const researchAgent = new Agent({
  id: 'research-agent',
  name: 'Research Agent',
  instructions: 'You are a research assistant.',
  model: 'openai/gpt-5.4',
  // highlight-next-line
  workflows: { researchWorkflow },

```

## Shape output for the model

Use `toModelOutput` when your tool returns rich structured data for your application, but you want the model to receive a smaller or multimodal representation. This keeps model context focused while preserving the full tool result in your app.

```typescript
export const weatherTool = createTool({
  execute: async ({ location }) => {
    const response = await fetch(`https://wttr.in/${location}?format=j1`)
    const data = await response.json()

    return {
      location,
      temperature: data.current_condition[0].temp_F,
      condition: data.current_condition[0].weatherDesc[0].value,
      weatherIconUrl: data.current_condition[0].weatherIconUrl[0].value,
      source: data,

  },
  toModelOutput: output => {
    return {
      type: 'content',
      value: [

          type: 'text',
          text: `${output.location}: ${output.temperature}F and ${output.condition}`,
        },
        { type: 'image-url', url: output.weatherIconUrl },
      ],

  },

```

## Control tool selection

Pass `toolChoice` or `activeTools` to `.generate()` or `.stream()` to control which tools the agent uses at runtime.

```typescript
await agent.generate('Check the forecast', {
  toolChoice: 'required',
  activeTools: ['weatherTool'],

```

> **Note:**
See the [`Agent.generate()` reference](/reference/agents/generate) for all runtime options including `toolsets`, `clientTools`, and `prepareStep`.


## Control `toolName` in stream responses

The `toolName` in stream responses is determined by the **object key** you use, not the `id` property of the tool, agent, or workflow.

```typescript
export const weatherTool = createTool({
  id: 'weather-tool',

// Using the variable name as the key
tools: { weatherTool }
// Stream returns: toolName: "weatherTool"

// Using the tool's id as the key
tools: { [weatherTool.id]: weatherTool }
// Stream returns: toolName: "weather-tool"

// Using a custom key
tools: { "my-custom-name": weatherTool }
// Stream returns: toolName: "my-custom-name"
```

This lets you specify how tools are identified in the stream. If you want the `toolName` to match the tool's `id`, use the tool's `id` as the object key.

### Subagents and workflows as tools

Subagents and workflows follow the same pattern. They're converted to tools with a prefix followed by your object key:

| Property | Prefix | Example key | `toolName` |
| - | - | - | - |
| `agents` | `agent-` | `weather` | `agent-weather` |
| `workflows` | `workflow-` | `research` | `workflow-research` |

```typescript
const orchestrator = new Agent({
  agents: {
    weather: weatherAgent, // toolName: "agent-weather"
  },
  workflows: {
    research: researchWorkflow, // toolName: "workflow-research"
  },

```

Note that for subagents, you'll see two different identifiers in stream responses:

- `toolName: "agent-weather"` in tool call events — the generated tool wrapper name
- `id: "weather-agent"` in `data-tool-agent` chunks — the subagent's actual `id` property

## Related

- [`createTool` reference](/reference/tools/create-tool)
- [`Agent.generate()` reference](/reference/agents/generate): Runtime options for tool selection, steps, and callbacks
- [MCP overview](/docs/mcp/overview)
- [Dynamic tool search](/reference/processors/tool-search-processor): Load tools on demand for agents with large tool libraries
- [Tools with structured output](/docs/agents/structured-output#combine-tools-and-structured-output): Model compatibility when combining tools and structured output
- [Agent approval](/docs/agents/agent-approval)
- [Request context](/docs/server/request-context)

---

# Structured output

Structured output lets an agent return an object that matches the shape defined by a schema instead of returning text. The schema tells the model what fields to produce, and the model ensures the final result fits that shape.

## When to use structured output

Use structured output when you need an agent to return a data object rather than text. Having well defined fields can make it simpler to pull out the values you need for API calls, UI rendering, or application logic.

## Define schemas

Agents can return structured data by defining the expected output with either [Zod](https://zod.dev/) or [JSON Schema](https://json-schema.org/). Zod is recommended because it provides TypeScript type inference and runtime validation, while JSON Schema is useful when you need a language agnostic format.


  Define the `output` shape using [Zod](https://zod.dev/):

    ```typescript
    import { z } from 'zod'

    const response = await testAgent.generate('Help me plan my day.', {
      structuredOutput: {
        schema: z.array(
          z.object({
            name: z.string(),
            activities: z.array(z.string()),
          }),
        ),
      },

    console.log(response.object)
    ```

You can also use JSON Schema to define your output structure:

    ```typescript
    const response = await testAgent.generate('Help me plan my day.', {
      structuredOutput: {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              activities: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['name', 'activities'],
          },
        },
      },

    console.log(response.object)
    ```

> **Note:**
Visit [`.generate()`](/reference/agents/generate) for a full list of configuration options.


**Example output:** The `response.object` will contain the structured data as defined by the schema.

```json
[

    "name": "Morning Routine",
    "activities": ["Wake up at 7am", "Exercise", "Shower", "Breakfast"]
  },

    "name": "Work",
    "activities": ["Check emails", "Team meeting", "Lunch break"]
  },

    "name": "Evening",
    "activities": ["Dinner", "Relax", "Read a book", "Sleep by 10pm"]

]
```

## Stream structured output

Streaming also supports structured output. The final structured object is available on `stream.fullStream` and after the stream completes on `stream.object`. Text stream chunks are still emitted, but they contain natural language text rather than structured data.

```typescript
const stream = await testAgent.stream('Help me plan my day.', {
  structuredOutput: {
    schema: z.array(
      z.object({
        name: z.string(),
        activities: z.array(z.string()),
      }),
    ),
  },

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'object-result') {
    console.log('\n', JSON.stringify(chunk, null, 2))

  process.stdout.write(JSON.stringify(chunk))

console.log(await stream.object)

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)

```

## Structuring agent

When your main agent isn't proficient at creating structured output you can provide a `model` to `structuredOutput`. In this case, Mastra uses a second agent under the hood to extract structured data from the main agent's natural language response. This makes two LLM calls, one to generate the response and another to turn that response into the structured object, which adds some latency and cost but can improve accuracy for complex structuring tasks.

```typescript
const response = await testAgent.generate('Analyze the TypeScript programming language.', {
  structuredOutput: {
    schema: z.object({
      overview: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      useCases: z.array(
        z.object({
          scenario: z.string(),
          reasoning: z.string(),
        }),
      ),
      comparison: z.object({
        similarTo: z.array(z.string()),

      }),
    }),
    model: 'openai/gpt-5.4',
  },

console.log(response.object)
```

## Combine tools and structured output

When an agent has both tools and structured output configured, some models may not support using both features together. This is a limitation of the underlying model APIs, not Mastra itself.

If your tools aren't being called when structured output is enabled, or you receive an error when combining both features, try one of the workarounds below.

### Workaround options

When your model doesn't support tools and structured output together, you have three options:

1. **Use `jsonPromptInjection: true`** - Injects the schema into the prompt instead of using the API's `response_format` parameter
1. **Use a separate structuring model** - Pass a `model` to `structuredOutput` to use a second LLM for structuring
1. **Use `prepareStep`** - Handle tools and structured output in separate steps

Each approach is detailed in the sections below.

## LLM structured output support

Structured output support varies across LLMs due to differences in their APIs. The sections below cover workarounds for models that don't fully support structured output or combining it with tools.

### `jsonPromptInjection`

By default, Mastra passes the schema to the model provider using the `response_format` API parameter. Most model providers have built-in support for this, which reliably enforces the schema.

If your model provider doesn't support `response_format`, you'll get an error from the API. When this happens, set `jsonPromptInjection: true`. This adds the schema to the system prompt instead, instructing the model to output JSON. This is less reliable than the API parameter approach.

```typescript
const response = await testAgent.generate('Help me plan my day.', {
  structuredOutput: {
    schema: z.array(
      z.object({
        name: z.string(),
        activities: z.array(z.string()),
      }),
    ),
    jsonPromptInjection: true,
  },

console.log(response.object)
```

:::note[Gemini 2.5 with tools]

Gemini 2.5 models don't support combining `response_format` (structured output) with function calling (tools) in the same API call. If your agent has tools and you're using `structuredOutput` with a Gemini 2.5 model, you must set `jsonPromptInjection: true` to avoid the error `Function calling with a response mime type: 'application/json' is unsupported`.

```typescript
const response = await agentWithTools.generate('Your prompt', {
  structuredOutput: {
    schema: yourSchema,
    jsonPromptInjection: true, // Required for Gemini 2.5 when tools are present
  },

```


### Use a separate structuring model

When `model` is provided to the `structuredOutput` property, Mastra uses a separate internal agent to handle the structured output. The main agent will handle all of the steps (including tool calling) and the structured output model will handle only the generation of structured output.

```typescript
const response = await testAgent.generate('Tell me about TypeScript.', {
  structuredOutput: {
    schema: yourSchema,
    model: 'openai/gpt-5.4',
  },

```

### Multi-step approach with `prepareStep`

For models that don't support tools and structured outputs together, you can use `prepareStep` to handle them in separate steps.

```typescript
const result = await agent.stream('weather in vancouver?', {
  prepareStep: async ({ stepNumber }) => {
    if (stepNumber === 0) {
      return {
        model: 'openai/gpt-5.4',
        tools: {
          weatherTool,
        },
        toolChoice: 'required',


    return {
      model: 'openai/gpt-5.4',
      tools: undefined,
      structuredOutput: {
        schema: z.object({
          temperature: z.number(),
          humidity: z.number(),
          windSpeed: z.number(),
        }),
      },

  },

```

## Handle errors

When schema validation fails, you can control how errors are handled using `errorStrategy`. The default `strict` strategy throws an error, while `warn` logs a warning and continues. The `fallback` strategy returns the values provided using `fallbackValue`.

```typescript
const response = await testAgent.generate('Tell me about TypeScript.', {
  structuredOutput: {
    schema: z.object({
      summary: z.string(),
      keyFeatures: z.array(z.string()),
    }),
    errorStrategy: 'fallback',
    fallbackValue: {
      summary: 'TypeScript is a typed superset of JavaScript',
      keyFeatures: ['Static typing', 'Compiles to JavaScript', 'Better tooling'],
    },
  },

console.log(response.object)
```

---

# Guardrails

Mastra provides built-in processors that add security and safety controls to your agent. These processors detect, transform, or block harmful content before it reaches the language model or the user.

For an introduction to how processors work, how to add them to an agent, and how to create custom processors, see [Processors](/docs/agents/processors).

## Input processors

Input processors run before user messages reach the language model. They handle normalization, validation, prompt injection detection, and security checks.

### Normalize user messages

The `UnicodeNormalizer()` cleans and normalizes user input by unifying Unicode characters, standardizing whitespace, and removing problematic symbols.

```typescript
export const normalizedAgent = new Agent({
  id: 'normalized-agent',
  name: 'Normalized Agent',
  inputProcessors: [
    new UnicodeNormalizer({
      stripControlChars: true,
      collapseWhitespace: true,
    }),
  ],

```

> **Note:**
Visit [`UnicodeNormalizer()`](/reference/processors/unicode-normalizer) reference for a full list of configuration options.


### Prevent prompt injection

The `PromptInjectionDetector()` scans user messages for prompt injection, jailbreak attempts, and system override patterns. It uses an LLM to classify risky input and can block or rewrite it before it reaches the model.

```typescript
export const secureAgent = new Agent({
  id: 'secure-agent',
  name: 'Secure Agent',
  inputProcessors: [
    new PromptInjectionDetector({
      model: 'openrouter/openai/gpt-oss-safeguard-20b',
      threshold: 0.8,
      strategy: 'rewrite',
      detectionTypes: ['injection', 'jailbreak', 'system-override'],
    }),
  ],

```

> **Note:**
Visit [`PromptInjectionDetector()`](/reference/processors/prompt-injection-detector) reference for a full list of configuration options.


### Detect and translate language

The `LanguageDetector()` detects and translates user messages into a target language, enabling multilingual support. It uses an LLM to identify the language and perform the translation.

```typescript
export const multilingualAgent = new Agent({
  id: 'multilingual-agent',
  name: 'Multilingual Agent',
  inputProcessors: [
    new LanguageDetector({
      model: 'openrouter/openai/gpt-oss-safeguard-20b',
      targetLanguages: ['English', 'en'],
      strategy: 'translate',
      threshold: 0.8,
    }),
  ],

```

> **Note:**
Visit [`LanguageDetector()`](/reference/processors/language-detector) reference for a full list of configuration options.


## Output processors

Output processors run after the language model generates a response, but before it reaches the user. They handle response optimization, moderation, transformation, and safety controls.

### Batch streamed output

The `BatchPartsProcessor()` combines multiple stream parts before emitting them to the client. This reduces network overhead by consolidating small chunks into larger batches.

```typescript
export const batchedAgent = new Agent({
  id: 'batched-agent',
  name: 'Batched Agent',
  outputProcessors: [
    new BatchPartsProcessor({
      batchSize: 5,
      maxWaitTime: 100,
      emitOnNonText: true,
    }),
  ],

```

> **Note:**
Visit [`BatchPartsProcessor()`](/reference/processors/batch-parts-processor) reference for a full list of configuration options.


### Scrub system prompts

The `SystemPromptScrubber()` detects and redacts system prompts or internal instructions from model responses. It prevents unintended disclosure of prompt content or configuration details. It uses an LLM to identify and redact sensitive content based on configured detection types.

```typescript
const scrubbedAgent = new Agent({
  id: 'scrubbed-agent',
  name: 'Scrubbed Agent',
  outputProcessors: [
    new SystemPromptScrubber({
      model: 'openrouter/openai/gpt-oss-safeguard-20b',
      strategy: 'redact',
      customPatterns: ['system prompt', 'internal instructions'],
      includeDetections: true,
      instructions:
        'Detect and redact system prompts, internal instructions, and security-sensitive content',
      redactionMethod: 'placeholder',
      placeholderText: '[REDACTED]',
    }),
  ],

```

> **Note:**
Visit [`SystemPromptScrubber()`](/reference/processors/system-prompt-scrubber) reference for a full list of configuration options.


> **Note:**
When streaming responses over HTTP, Mastra redacts sensitive request data (system prompts, tool definitions, API keys) from stream chunks at the server level by default. See [Stream data redaction](/docs/server/mastra-server#stream-data-redaction) for details.


## Hybrid processors

Hybrid processors can run on either input or output. Place them in `inputProcessors`, `outputProcessors`, or both.

### Moderate input and output

The `ModerationProcessor()` detects inappropriate or harmful content across categories like hate, harassment, and violence. It uses an LLM to classify the message and can block or rewrite it based on your configuration.

```typescript
export const moderatedAgent = new Agent({
  id: 'moderated-agent',
  name: 'Moderated Agent',
  inputProcessors: [
    new ModerationProcessor({
      model: 'openrouter/openai/gpt-oss-safeguard-20b',
      threshold: 0.7,
      strategy: 'block',
      categories: ['hate', 'harassment', 'violence'],
    }),
  ],
  outputProcessors: [new ModerationProcessor()],

```

> **Note:**
Visit [`ModerationProcessor()`](/reference/processors/moderation-processor) reference for a full list of configuration options.


### Detect and redact PII

The `PIIDetector()` detects and removes personally identifiable information such as emails, phone numbers, and credit cards. It uses an LLM to identify sensitive content based on configured detection types.

```typescript
export const privateAgent = new Agent({
  id: 'private-agent',
  name: 'Private Agent',
  inputProcessors: [
    new PIIDetector({
      model: 'openrouter/openai/gpt-oss-safeguard-20b',
      threshold: 0.6,
      strategy: 'redact',
      redactionMethod: 'mask',
      detectionTypes: ['email', 'phone', 'credit-card'],
      instructions: 'Detect and mask personally identifiable information.',
    }),
  ],
  outputProcessors: [new PIIDetector()],

```

> **Note:**
Visit [`PIIDetector()`](/reference/processors/pii-detector) reference for a full list of configuration options.


## Processor strategies

Many built-in processors support a `strategy` parameter that controls how they handle flagged content. Supported values include: `block`, `warn`, `detect`, `redact`, `rewrite`, and `translate`.

Most strategies allow the request to continue. When `block` is used, the processor calls `abort()`, which stops the request immediately and prevents subsequent processors from running.

```typescript
inputProcessors: [
  new PIIDetector({
    model: 'openrouter/openai/gpt-oss-safeguard-20b',
    threshold: 0.6,
    strategy: 'block',
    detectionTypes: ['email', 'phone', 'credit-card'],
  }),
]
```

## Handle blocked requests

When a processor calls `abort()`, the agent stops processing. How you detect this depends on whether you use `generate()` or `stream()`.

### With `generate()`

Check the `tripwire` field on the result:

```typescript
const result = await agent.generate('Is this credit card number valid?: 4543 1374 5089 4332')

if (result.tripwire) {
  console.error('Blocked:', result.tripwire.reason)
  console.error('Processor:', result.tripwire.processorId)

```

### With `stream()`

Listen for `tripwire` chunks in the stream:

```typescript
const stream = await agent.stream('Is this credit card number valid?: 4543 1374 5089 4332')

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tripwire') {
    console.error('Blocked:', chunk.payload.reason)
    console.error('Processor:', chunk.payload.processorId)


```

## Speed up guardrails

Guardrail processors that use an LLM (moderation, PII detection, prompt injection) add latency to every request. Three techniques reduce this overhead.

### Run guardrails in parallel

By default, processors run sequentially. Guardrails that only `block` (and never mutate messages) are independent and can run at the same time using a [workflow processor](/docs/agents/processors#use-workflows-as-processors).

You can also mix `block` and `redact` strategies in a single parallel step. Map to the `redact` branch so its transformed messages carry forward.

For output guardrails, run `TokenLimiterProcessor` and `BatchPartsProcessor` sequentially _before_ the parallel step, and any `redact` processors that depend on each other sequentially _after_ it:

```typescript
  ProcessorStepSchema,
  PIIDetector,
  ModerationProcessor,
  SystemPromptScrubber,
  TokenLimiterProcessor,
  BatchPartsProcessor,
} from '@mastra/core/processors'

export const outputGuardrails = createWorkflow({
  id: 'output-guardrails',
  inputSchema: ProcessorStepSchema,
  outputSchema: ProcessorStepSchema,

  // Sequential: limit tokens first, then batch stream chunks
  .then(createStep(new TokenLimiterProcessor({ limit: 1000 })))
  .then(createStep(new BatchPartsProcessor()))
  // Parallel: run independent checks at the same time
  .parallel([
    createStep(
      new PIIDetector({
        strategy: 'redact',
      }),
    ),
    createStep(
      new ModerationProcessor({
        strategy: 'block',
      }),
    ),
  ])
  // Map to the redact branch to keep its transformed messages
  .map(async ({ inputData }) => {
    return inputData['processor:pii-detector']

  // Sequential: scrubber depends on previous redaction output
  .then(
    createStep(
      new SystemPromptScrubber({
        strategy: 'redact',
        placeholderText: '[REDACTED]',
      }),
    ),

  .commit()
```

See [workflows as processors](/docs/agents/processors#use-workflows-as-processors) for more details on `.parallel()` and `.map()`.

### Choose a fast model

Guardrail processors don't need your primary model. Use a small, fast model for classification tasks:

```typescript
const GUARDRAIL_MODEL = 'openai/gpt-5-nano'

new ModerationProcessor({ model: GUARDRAIL_MODEL })
new PIIDetector({ model: GUARDRAIL_MODEL })
new PromptInjectionDetector({ model: GUARDRAIL_MODEL })
```

### Batch stream parts

Output guardrails that implement `processOutputStream` run on every streamed chunk. Use `BatchPartsProcessor` _before_ heavier processors to combine chunks and reduce the number of LLM classification calls:

```typescript
outputProcessors: [
  new BatchPartsProcessor({ batchSize: 10 }),
  // Heavier processors now run on batched chunks instead of individual ones
  new PIIDetector({ model: GUARDRAIL_MODEL, strategy: 'redact' }),
  new ModerationProcessor({ model: GUARDRAIL_MODEL, strategy: 'block' }),
]
```

## Related

- [Processors](/docs/agents/processors): How processors work, execution order, custom processors, and retry mechanism
- [`Processor` Interface](/reference/processors/processor-interface): API reference for the `Processor` interface
- [Memory Processors](/docs/memory/memory-processors): Processors for message history, semantic recall, and working memory

---

# Agent approval

Agents sometimes require the same [human-in-the-loop](/docs/workflows/human-in-the-loop) oversight used in workflows when calling tools that handle sensitive operations, like deleting resources or running long processes. With agent approval you can suspend a tool call before it executes so a human can approve or decline it, or let tools suspend themselves to request additional context from the user.

## When to use agent approval

- **Destructive or irreversible actions** such as deleting records, sending emails, or processing payments.
- **Cost-heavy operations** like calling expensive third-party APIs where you want to verify arguments first.
- **Conditional confirmation** where a tool starts executing and then discovers it needs the user to confirm or supply extra data before finishing.

## Quickstart

Mark a tool with `requireApproval: true`, then check for the `tool-call-approval` chunk in the stream to approve or decline:

```typescript
const deleteTool = createTool({
  id: 'delete-record',
  description: 'Delete a record by ID',
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ deleted: z.boolean() }),
  requireApproval: true,
  execute: async ({ id }) => {
    await db.delete(id)
    return { deleted: true }
  },

const agent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  model: 'openai/gpt-5-mini',
  tools: { deleteTool },

const stream = await agent.stream('Delete record abc-123')

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-approval') {
    const approved = await agent.approveToolCall({ runId: stream.runId })
    for await (const c of approved.textStream) process.stdout.write(c)


```

> **Note:**
Agent approval uses snapshots to capture request state. Configure a [storage provider](/docs/memory/storage) on your Mastra instance or you'll see a "snapshot not found" error.


## How approval works

Mastra offers two distinct mechanisms for pausing tool calls: **pre-execution approval** and **runtime suspension**.

### Pre-execution approval

Pre-execution approval pauses a tool call _before_ its `execute` function runs. The LLM still decides which tool to call and provides arguments, but `execute` doesn't run until you explicitly approve.

Two flags control this, combined with OR logic. If _either_ is `true`, the call pauses:

| Flag | Where to set it | Scope |
| - | - | - |
| `requireToolApproval: true` | `stream()` / `generate()` options | Pauses **every** tool call for that request |
| `requireApproval: true` | `createTool()` definition | Pauses calls to **that specific tool** |

The stream emits a `tool-call-approval` chunk containing the `toolCallId`, `toolName`, and `args`. Call `approveToolCall()` or `declineToolCall()` with the stream's `runId` to continue:

```typescript
const stream = await agent.stream("What's the weather in London?", {
  requireToolApproval: true,

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-approval') {
    console.log('Tool:', chunk.payload.toolName)
    console.log('Args:', chunk.payload.args)

    // Approve
    const approved = await agent.approveToolCall({ runId: stream.runId })
    for await (const c of approved.textStream) process.stdout.write(c)

    // Or decline
    const declined = await agent.declineToolCall({ runId: stream.runId })
    for await (const c of declined.textStream) process.stdout.write(c)


```

### Runtime suspension with `suspend()`

A tool can also pause _during_ its `execute` function by calling `suspend()`. This is useful when the tool starts running and then discovers it needs additional user input or confirmation before it can finish.

The stream emits a `tool-call-suspended` chunk with a custom payload defined by the tool's `suspendSchema`. You resume by calling `resumeStream()` with data matching the tool's `resumeSchema`.

## Tool approval with `generate()`

Tool approval also works with `generate()` for non-streaming use cases. When a tool requires approval, `generate()` returns immediately with `finishReason: 'suspended'`, a `suspendPayload` containing the tool call details (`toolCallId`, `toolName`, `args`), and a `runId`:

```typescript
const output = await agent.generate('Find user John', {
  requireToolApproval: true,

if (output.finishReason === 'suspended') {
  console.log('Tool requires approval:', output.suspendPayload.toolName)

  // Approve
  const result = await agent.approveToolCallGenerate({
    runId: output.runId,
    toolCallId: output.suspendPayload.toolCallId,

  console.log('Final result:', result.text)

  // Or decline
  const result = await agent.declineToolCallGenerate({
    runId: output.runId,
    toolCallId: output.suspendPayload.toolCallId,

```

### Stream vs generate comparison

| Aspect | `stream()` | `generate()` |
| - | - | - |
| Response type | Streaming chunks | Complete response |
| Approval detection | `tool-call-approval` chunk | `finishReason: 'suspended'` |
| Approve method | `approveToolCall({ runId })` | `approveToolCallGenerate({ runId, toolCallId })` |
| Decline method | `declineToolCall({ runId })` | `declineToolCallGenerate({ runId, toolCallId })` |
| Result | Stream to iterate | Full output object |

> **Note:**
`toolCallId` is optional on all four methods. Pass it when multiple tool calls may be pending at the same time (common in supervisor agents). When omitted, the agent resumes the most recent suspended tool call.


## Tool-level approval

Instead of pausing every tool call at the agent level, you can mark individual tools as requiring approval. This gives you granular control: only specific tools pause, while others execute immediately.

### Approval using `requireApproval`

Set `requireApproval: true` on a tool definition. The tool pauses before execution regardless of whether `requireToolApproval` is set on the agent:

```typescript
export const testTool = createTool({
  id: 'test-tool',
  description: 'Fetches weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  outputSchema: z.object({
    weather: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean(),
  }),
  execute: async inputData => {
    const response = await fetch(`https://wttr.in/${inputData.location}?format=3`)
    const weather = await response.text()

    return { weather }
  },
  requireApproval: true,

```

When `requireApproval` is `true`, the stream emits `tool-call-approval` chunks the same way agent-level approval does. Use `approveToolCall()` or `declineToolCall()` to continue:

```typescript
const stream = await agent.stream("What's the weather in London?")

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-approval') {
    console.log('Approval required for:', chunk.payload.toolName)


const handleApproval = async () => {
  const approvedStream = await agent.approveToolCall({ runId: stream.runId })

  for await (const chunk of approvedStream.textStream) {
    process.stdout.write(chunk)

  process.stdout.write('\n')

```

### Approval using `suspend()`

With this approach, neither the agent nor the tool uses `requireApproval`. Instead, the tool's `execute` function calls `suspend()` to pause at a specific point and return context or confirmation prompts to the user. This is useful when approval depends on runtime conditions rather than being unconditional.

```typescript
export const testToolB = createTool({
  id: 'test-tool-b',
  description: 'Fetches weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  outputSchema: z.object({
    weather: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean(),
  }),
  suspendSchema: z.object({
    reason: z.string(),
  }),
  execute: async (inputData, context) => {
    const { resumeData: { approved } = {}, suspend } = context?.agent ?? {}

    if (!approved) {
      return suspend?.({ reason: 'Approval required.' })

    const response = await fetch(`https://wttr.in/${inputData.location}?format=3`)
    const weather = await response.text()

    return { weather }
  },

```

With this approach the stream includes a `tool-call-suspended` chunk, and the `suspendPayload` contains the `reason` defined by the tool's `suspendSchema`. Call `resumeStream` with the `resumeSchema` data and `runId` to continue:

```typescript
const stream = await agent.stream("What's the weather in London?")

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-suspended') {
    console.log(chunk.payload.suspendPayload)


const handleResume = async () => {
  const resumedStream = await agent.resumeStream({ approved: true }, { runId: stream.runId })

  for await (const chunk of resumedStream.textStream) {
    process.stdout.write(chunk)

  process.stdout.write('\n')

```

## Automatic tool resumption

When using tools that call `suspend()`, you can enable automatic resumption so the agent resumes suspended tools based on the user's next message. Set `autoResumeSuspendedTools` to `true` in the agent's default options or per-request:

```typescript
const agent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5-mini',
  tools: { weatherTool },
  memory: new Memory(),

    autoResumeSuspendedTools: true,
  },

```

When enabled, the agent detects suspended tools from message history on the next user message, extracts `resumeData` based on the tool's `resumeSchema`, and automatically resumes the tool. The following example shows a complete conversational flow:

```typescript
const weatherTool = createTool({
  id: 'weather-tool',
  description: 'Fetches weather for a city',
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    weather: z.string(),
  }),
  suspendSchema: z.object({
    message: z.string(),
  }),
  resumeSchema: z.object({
    city: z.string(),
  }),
  execute: async (inputData, context) => {
    const { resumeData, suspend } = context?.agent ?? {}

    // If no city provided, ask the user
    if (!inputData.city && !resumeData?.city) {
      return suspend?.({ message: 'What city do you want to know the weather for?' })

    const city = resumeData?.city ?? inputData.city
    const response = await fetch(`https://wttr.in/${city}?format=3`)
    const weather = await response.text()

    return { weather: `${city}: ${weather}` }
  },

```

```typescript
const stream = await agent.stream("What's the weather like?")

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-suspended') {
    console.log(chunk.payload.suspendPayload)


// User sends follow-up on the same thread
const resumedStream = await agent.stream('San Francisco')
for await (const chunk of resumedStream.textStream) {
  process.stdout.write(chunk)

```

```text
User: "What's the weather like?"
Agent: "What city do you want to know the weather for?"

User: "San Francisco"
Agent: "The weather in San Francisco is: San Francisco: ☀️ +72°F"
```

The second message automatically resumes the suspended tool. The agent extracts `{ city: "San Francisco" }` from the user's message and passes it as `resumeData`.

### Requirements

For automatic tool resumption to work:

- **Memory configured**: The agent needs memory to track suspended tools across messages
- **Same thread**: The follow-up message must use the same memory thread and resource identifiers
- **`resumeSchema` defined**: The tool must define a `resumeSchema` so the agent knows what data structure to extract from the user's message

### Manual vs automatic resumption

| Approach | Use case |
| - | - |
| Manual (`resumeStream()`) | Programmatic control, webhooks, button clicks, external triggers |
| Automatic (`autoResumeSuspendedTools`) | Conversational flows where users provide resume data in natural language |

Both approaches work with the same tool definitions. Automatic resumption triggers only when suspended tools exist in the message history and the user sends a new message on the same thread.

## Tool approval: Supervisor agents

A [supervisor agent](/docs/agents/supervisor-agents) coordinates multiple subagents using `.stream()` or `.generate()`. When a subagent calls a tool that requires approval, the request propagates up through the delegation chain and surfaces at the supervisor level:

1. The supervisor delegates a task to a subagent.
1. The subagent calls a tool that has `requireApproval: true` or uses `suspend()`.
1. The approval request bubbles up to the supervisor.
1. You approve or decline at the supervisor level.
1. The decision propagates back down to the subagent.

Tool approvals also propagate through multiple levels of delegation. If a supervisor delegates to subagent A, which delegates to subagent B that has a tool with `requireApproval: true`, the approval request still surfaces at the top-level supervisor.

### Approve and decline in supervisor agents

The example below creates a subagent with a tool requiring approval. When the tool triggers an approval request, it surfaces in the supervisor's stream as a `tool-call-approval` chunk:

```typescript
const findUserTool = createTool({
  id: 'find-user',
  description: 'Finds user by ID in the database',
  inputSchema: z.object({
    userId: z.string(),
  }),
  outputSchema: z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
  }),
  // highlight-next-line
  requireApproval: true,
  execute: async input => {
    const user = await database.findUser(input.userId)
    return { user }
  },

const dataAgent = new Agent({
  id: 'data-agent',
  name: 'Data Agent',
  description: 'Handles database queries and user data retrieval',
  model: 'openai/gpt-5-mini',
  tools: { findUserTool },

const supervisorAgent = new Agent({
  id: 'supervisor',
  name: 'Supervisor Agent',
  instructions: `You coordinate data retrieval tasks.
    Delegate to data-agent for user lookups.`,
  model: 'openai/gpt-5.4',
  agents: { dataAgent },
  memory: new Memory(),

const stream = await supervisorAgent.stream('Find user with ID 12345')

for await (const chunk of stream.fullStream) {
  // highlight-next-line
  if (chunk.type === 'tool-call-approval') {
    console.log('Tool requires approval:', chunk.payload.toolName)
    console.log('Arguments:', chunk.payload.args)

    // Approve the tool call
    // highlight-start
    const resumeStream = await supervisorAgent.approveToolCall({
      runId: stream.runId,
      toolCallId: chunk.payload.toolCallId,

    //highlight-end

    for await (const resumeChunk of resumeStream.textStream) {
      process.stdout.write(resumeChunk)

    // To decline instead, use:
    const declineStream = await supervisorAgent.declineToolCall({
      runId: stream.runId,
      toolCallId: chunk.payload.toolCallId,

```

### Use `suspend()` in supervisor agents

Tools can also use [`suspend()`](#approval-using-suspend) to pause execution and return context to the user. This approach works through the supervisor delegation chain the same way `requireApproval` does: the suspension surfaces at the supervisor level:

```typescript
const conditionalTool = createTool({
  id: 'conditional-operation',
  description: 'Performs an operation that may require confirmation',
  inputSchema: z.object({
    operation: z.string(),
  }),
  suspendSchema: z.object({
    message: z.string(),
  }),
  resumeSchema: z.object({
    confirmed: z.boolean(),
  }),
  execute: async (input, context) => {
    const { resumeData } = context?.agent ?? {}

    if (!resumeData?.confirmed) {
      return context?.agent?.suspend({
        message: `Confirm: ${input.operation}?`,

    // Proceed with operation
    return await performOperation(input.operation)
  },

```

```typescript
// When using this tool through a subagent in supervisor agents
for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-suspended') {
    console.log('Tool suspended:', chunk.payload.suspendPayload.message)

    // Resume with confirmation
    const resumeStream = await supervisorAgent.resumeStream(
      { confirmed: true },
      { runId: stream.runId },

    for await (const resumeChunk of resumeStream.textStream) {
      process.stdout.write(resumeChunk)


```

### Supervisor approval with `generate()`

Tool approval propagation also works with `generate()` in supervisor agents:

```typescript
const output = await supervisorAgent.generate('Find user with ID 12345', {
  maxSteps: 10,

if (output.finishReason === 'suspended') {
  console.log('Tool requires approval:', output.suspendPayload.toolName)

  // Approve
  const result = await supervisorAgent.approveToolCallGenerate({
    runId: output.runId,
    toolCallId: output.suspendPayload.toolCallId,

  console.log('Final result:', result.text)

```

## Related

- [Tools](./using-tools)
- [Agent overview](./overview)
- [MCP overview](../mcp/overview)
- [Memory](/docs/memory/overview)
- [Request context](/docs/server/request-context)

---

# Agent networks

:::warning[Deprecated — Use supervisor agents]

Agent networks are deprecated and will be removed in a future major release. [Supervisor agents](./supervisor-agents) using `agent.stream()` or `agent.generate()` are now the recommended approach. It provides the same multi-agent coordination with better control, a simpler API, and easier debugging.

See the [migration guide](/guides/migrations/network-to-supervisor) to upgrade.


A **routing agent** uses an LLM to interpret a request and decide which primitives (subagents, workflows, or tools) to call, in what order, and with what data.

## Create an agent network

Configure a routing agent with `agents`, `workflows`, and `tools`. Memory is required as `.network()` uses it to store task history and determine when a task is complete.

Each primitive needs a clear `description` so the routing agent can decide which to use. For workflows and tools, `inputSchema` and `outputSchema` also help the router determine the right inputs.

```typescript
export const routingAgent = new Agent({
  id: 'routing-agent',
  name: 'Routing Agent',
  instructions: `
    You are a network of writers and researchers. The user will ask you to research a topic. Always respond with a complete report—no bullet points. Write in full paragraphs, like a blog post. Do not answer with incomplete or uncertain information.`,
  model: 'openai/gpt-5.4',
  agents: {
    // highlight-start
    researchAgent,
    writingAgent,
    // highlight-end
  },
  workflows: {
    // highlight-next-line
    cityWorkflow,
  },
  tools: {
    // highlight-next-line
    weatherTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'mastra-storage',
      url: 'file:../mastra.db',
    }),
  }),

```

> **Note:**
Subagents need a `description` on the `Agent` instance. Workflows and tools need a `description` plus `inputSchema` and `outputSchema` on `createWorkflow()` or `createTool()`.


## Call the network

Call `.network()` with a user message. The method returns a stream of events you can iterate over.

```typescript
const result = await routingAgent.network('Tell me three cool ways to use Mastra')

for await (const chunk of result) {
  console.log(chunk.type)
  if (chunk.type === 'network-execution-event-step-finish') {
    console.log(chunk.payload.result)


```

## Structured output

Pass `structuredOutput` to get typed, validated results. Use `objectStream` for partial objects as they generate.

```typescript
const resultSchema = z.object({
  summary: z.string().describe('A brief summary of the findings'),
  recommendations: z.array(z.string()).describe('List of recommendations'),
  confidence: z.number().min(0).max(1).describe('Confidence score'),

const stream = await routingAgent.network('Research AI trends', {
  structuredOutput: { schema: resultSchema },

for await (const partial of stream.objectStream) {
  console.log('Building result:', partial)

const final = await stream.object
console.log(final?.summary)
```

## Approve and decline tool calls

When a primitive requires approval, the stream emits an `agent-execution-approval` or `tool-execution-approval` chunk. Use `approveNetworkToolCall()` or `declineNetworkToolCall()` to respond.

Network approval uses snapshots to capture execution state. Ensure a [storage provider](/docs/memory/storage) is enabled in your Mastra instance.

```typescript
const stream = await routingAgent.network('Perform some sensitive action', {
  memory: {
    thread: 'user-123',
    resource: 'my-app',
  },

for await (const chunk of stream) {
  if (chunk.type === 'agent-execution-approval' || chunk.type === 'tool-execution-approval') {
    // Approve
    const approvedStream = await routingAgent.approveNetworkToolCall(chunk.payload.toolCallId, {
      runId: stream.runId,
      memory: { thread: 'user-123', resource: 'my-app' },

    for await (const c of approvedStream) {
      if (c.type === 'network-execution-event-step-finish') {
        console.log(c.payload.result)


```

To decline instead, call `declineNetworkToolCall()` with the same arguments.

## Suspend and resume

When a primitive calls `suspend()`, the stream emits a suspension chunk (e.g., `tool-execution-suspended`). Use `resumeNetwork()` to provide the requested data and continue execution.

```typescript
const stream = await routingAgent.network('Delete the old records', {
  memory: { thread: 'user-123', resource: 'my-app' },

for await (const chunk of stream) {
  if (chunk.type === 'workflow-execution-suspended') {
    console.log(chunk.payload.suspendPayload)


// Resume with user confirmation
const resumedStream = await routingAgent.resumeNetwork(
  { confirmed: true },

    runId: stream.runId,
    memory: { thread: 'user-123', resource: 'my-app' },
  },

for await (const chunk of resumedStream) {
  if (chunk.type === 'network-execution-event-step-finish') {
    console.log(chunk.payload.result)


```

### Automatic resumption

Set `autoResumeSuspendedTools` to `true` so the network resumes suspended primitives based on the user's next message. This creates a conversational flow where users provide the required information naturally.

```typescript
const stream = await routingAgent.network('Delete the old records', {
  autoResumeSuspendedTools: true,
  memory: { thread: 'user-123', resource: 'my-app' },

```

Requirements for automatic resumption:

- **Memory configured**: The agent needs memory to track suspended tools across messages.
- **Same thread**: The follow-up message must use the same `thread` and `resource` identifiers.
- **`resumeSchema` defined**: The tool must define a `resumeSchema` so the network can extract data from the user's message.

| | Manual (`resumeNetwork`) | Automatic (`autoResumeSuspendedTools`) |
| - | - | - |
| Best for | Custom UIs with approval buttons | Chat-style interfaces |
| Control | Full control over resume timing and data | Network extracts data from user's message |
| Setup | Handle suspension chunks, call `resumeNetwork` | Set flag, define `resumeSchema` on tools |

## Related

- [Supervisor agents](./supervisor-agents)
- [Migration: `.network()` to supervisor agents](/guides/migrations/network-to-supervisor)

---

# Supervisor agents

**Added in:** `@mastra/core@1.8.0`

A supervisor agent coordinates multiple subagents using [`Agent.stream()`](/reference/streaming/agents/stream) or [`Agent.generate()`](/reference/agents/generate). You configure subagents on the supervisor's `agents` property, and the supervisor uses its instructions and each subagent's `description` to decide when and how to delegate tasks.

## When to use supervisor agents

Use supervisor agents when a task requires multiple agents with different specializations to work together. The supervisor handles delegation decisions, context passing, and result synthesis.

Common use cases:

- Research and writing workflows where one agent gathers data and another produces content
- Multi-step tasks that need different expertise at each stage
- Tasks where you need fine-grained control over delegation behavior

> **Note:**
Supervisor agents are one approach to building multi-agent systems in Mastra. For other patterns, read the [conceptual overview](/guides/concepts/multi-agent-systems).


## Quickstart

Define subagents with clear descriptions, then create a supervisor agent that references them:

```typescript
const researchAgent = new Agent({
  id: 'research-agent',
  // highlight-next-line
  description: 'Gathers factual information and returns bullet-point summaries.',
  model: 'openai/gpt-5-mini',

const writingAgent = new Agent({
  id: 'writing-agent',
  // highlight-next-line
  description: 'Transforms research into well-structured articles.',
  model: 'openai/gpt-5-mini',

// highlight-start
const supervisor = new Agent({
  id: 'supervisor',
  instructions: `You coordinate research and writing using specialized agents.
    Delegate to research-agent for facts, then writing-agent for content.`,
  model: 'openai/gpt-5.4',
  agents: { researchAgent, writingAgent },
  memory: new Memory({
    storage: new LibSQLStore({ id: 'storage', url: 'file:mastra.db' }),
  }),

// highlight-end

const stream = await supervisor.stream('Research AI in education and write an article', {
  maxSteps: 10,

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)

```

## Delegation hooks

Delegation hooks let you intercept, modify, or reject delegations as they happen. Configure them under the `delegation` option, either in the agent's `defaultOptions` or per-call.

### `onDelegationStart`

Called before the supervisor delegates to a subagent. Return an object to control the delegation:

- `proceed: true`: Allow the delegation (default behavior)
- `proceed: false`: Reject the delegation with a `rejectionReason`
- `modifiedPrompt`: Rewrite the prompt sent to the subagent
- `modifiedMaxSteps`: Limit the subagent's iteration count

```typescript
const stream = await supervisor.stream('Research AI trends', {
  maxSteps: 10,

    onDelegationStart: async context => {
      console.log(`Delegating to: ${context.primitiveId}`)

      // Modify the prompt for a specific agent
      if (context.primitiveId === 'research-agent') {
        return {
          proceed: true,
          modifiedPrompt: `${context.prompt}\n\nFocus on 2024-2025 data.`,
          modifiedMaxSteps: 5,


      // Reject delegation after too many iterations
      if (context.iteration > 8) {
        return {
          proceed: false,
          rejectionReason: 'Max iterations reached. Synthesize current findings.',


      return { proceed: true }
    },
  },

```

The `context` object includes:

| Property | Description |
| - | - |
| `primitiveId` | The ID of the subagent being delegated to |
| `prompt` | The prompt the supervisor is sending |
| `iteration` | Current iteration number |

### `onDelegationComplete`

Called after a delegation finishes. Use it to inspect results, provide feedback, or stop execution:

- `context.bail()`: Stop the supervisor loop immediately
- Return `{ feedback: '...' }`: Add feedback that gets saved to the supervisor's memory and is visible to subsequent iterations

```typescript
const stream = await supervisor.stream('Research AI trends', {
  maxSteps: 10,

    onDelegationComplete: async context => {
      console.log(`Completed: ${context.primitiveId}`)

      // Bail on errors
      if (context.error) {
        context.bail()
        return {
          feedback: `Delegation to ${context.primitiveId} failed: ${context.error}. Try a different approach.`,


    },
  },

```

The `context` object includes:

| Property | Description |
| - | - |
| `primitiveId` | The ID of the subagent that ran |
| `result` | The subagent's response |
| `error` | Error if the delegation failed |
| `bail()` | Function to stop the supervisor loop |

## Message filtering

By default, subagents receive the full conversation context from the supervisor. Use `messageFilter` to control what messages are shared — for example, to remove sensitive data or limit context size.

```typescript
const stream = await supervisor.stream('Research AI trends', {
  maxSteps: 10,

    messageFilter: ({ messages, primitiveId, prompt }) => {
      // Remove messages containing sensitive data
      return messages
        .filter(msg => {
          const content =
            typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          return !content.includes('confidential')

        .slice(-10) // Only pass the last 10 messages
    },
  },

```

The callback receives `messages` (the full conversation history), `primitiveId` (the subagent ID), and `prompt` (the delegation prompt). Return the filtered array of messages.

## Iteration monitoring

`onIterationComplete` is called after each iteration of the supervisor loop. Use it to log progress, inject feedback, or stop execution early.

```typescript
const stream = await supervisor.stream('Research AI trends', {
  maxSteps: 10,
  onIterationComplete: async context => {
    console.log(`Iteration ${context.iteration}/${context.maxIterations}`)
    console.log(`Finish reason: ${context.finishReason}`)

    // Inject feedback to guide the agent
    if (!context.text.includes('recommendations')) {
      return {
        continue: true,
        feedback: 'Please include specific recommendations in your analysis.',


    // Stop early when the response is sufficient
    if (context.text.length > 1000 && context.finishReason === 'stop') {
      return { continue: false }

    return { continue: true }
  },

```

Return `{ continue: true }` to keep iterating, or `{ continue: false }` to stop. Include optional `feedback` to inject guidance into the conversation. When `feedback` is combined with `continue: false`, the model may get one final turn to produce a text response incorporating the feedback, but only if the current iteration is still active (e.g., after tool calls) — otherwise no extra turn is granted.

## Memory isolation

Supervisor agents implement memory isolation. Subagents receive the full conversation context for better decision-making, but only their specific delegation prompt and response are saved to their memory.

How it works:

1. **Full context forwarded**: When the supervisor delegates, the subagent receives all messages from the supervisor's conversation
1. **Scoped memory saves**: Only the delegation prompt and the subagent's response are saved to the subagent's memory
1. **Fresh thread per invocation**: Each delegation uses a unique thread ID, ensuring clean separation

This ensures subagents have the context they need without cluttering their memory with the entire supervisor conversation.

> **Note:**
Visit [memory in multi-agent systems](/docs/memory/overview#memory-in-multi-agent-systems) for more details.


## Tool approval propagation

Tool approvals propagate through the delegation chain. When a subagent uses a tool with `requireApproval: true` or calls `suspend()`, the approval request surfaces to the supervisor level.

```typescript
const sensitiveDataTool = createTool({
  id: 'get-user-data',
  requireApproval: true,
  execute: async input => {
    return await database.getUserData(input.userId)
  },

const dataAgent = new Agent({
  id: 'data-agent',
  tools: { sensitiveDataTool },

const supervisor = new Agent({
  id: 'supervisor',
  agents: { dataAgent },
  memory: new Memory(),

const stream = await supervisor.stream('Get data for user 123')

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'tool-call-approval') {
    console.log('Tool requires approval:', chunk.payload.toolName)


```

## Task completion scoring

Task completion scorers validate whether the task is complete after each iteration. If validation fails, the supervisor continues iterating. Feedback from failed scorers is included in the conversation context so subagents can see what was missing.

```typescript
const taskCompleteScorer = createScorer({
  id: 'task-complete',
  name: 'Task Completeness',
}).generateScore(async context => {
  const text = (context.run.output || '').toString()
  const hasAnalysis = text.includes('analysis')
  const hasRecommendations = text.includes('recommendation')
  return hasAnalysis && hasRecommendations ? 1 : 0

const stream = await supervisor.stream('Research AI in education', {
  maxSteps: 10,
  isTaskComplete: {
    scorers: [taskCompleteScorer],
    strategy: 'all',
    onComplete: async result => {
      console.log('Task complete:', result.complete)
    },
  },

```

## Writing effective instructions

Clear instructions are essential for effective delegation. Your supervisor's `instructions` should specify available resources, when to use each one, how to coordinate them, and success criteria.

Each subagent should have a clear `description` that explains what it does, what format it returns, and when to use it. The supervisor uses these descriptions to make delegation decisions.

```typescript
const supervisor = new Agent({
  instructions: `You coordinate research and writing tasks.

Available resources:
- researchAgent: Gathers factual data and sources (returns bullet points)
- writingAgent: Transforms research into narrative content (returns full paragraphs)

Delegation strategy:
1. For research requests: Delegate to researchAgent first
2. For writing requests: Delegate to writingAgent
3. For complex requests: Delegate to researchAgent first, then writingAgent

Success criteria:
- All user questions are fully answered
- Response is well-formatted and complete`,
  agents: { researchAgent, writingAgent },

```

## Related

- [Guide: Research coordinator](/guides/guide/research-coordinator)
- [Agent.stream() reference](/reference/streaming/agents/stream)
- [Agent.generate() reference](/reference/agents/generate)
- [Agent approval](./agent-approval)
- [Memory in multi-agent systems](/docs/memory/overview#memory-in-multi-agent-systems)
- [Concept: Multi-agent systems](/guides/concepts/multi-agent-systems)

---

# Channels

**Added in:** `@mastra/core@1.22.0`

Channels connect your agents to messaging platforms like Slack, Discord, and Telegram. When a user sends a message on a platform, the agent receives it, processes it through the normal agent pipeline, and streams the response back to the conversation.

## When to use channels

Use channels when you want your agent to:

- Respond to messages in Slack workspaces, Discord servers, or Telegram chats
- Handle both direct messages and mentions in group conversations

## Quickstart

Configure channels directly on your agent using adapters from the [Chat SDK](https://chat-sdk.dev/adapters):

```typescript
export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'Support Agent',
  instructions: 'You are a helpful support assistant.',
  model: 'openai/gpt-5.4',
  channels: {
    adapters: {
      slack: createSlackAdapter(),
    },
  },

```

Register the agent in your Mastra instance with storage so channel state persists across restarts:

```typescript
export const mastra = new Mastra({
  agents: { supportAgent },
  storage: new LibSQLStore({
    url: process.env.DATABASE_URL,
  }),

```

Each adapter reads credentials from environment variables by default.

## Platform setup

Each platform requires credentials and event configuration. See the Chat SDK adapter docs for full setup: [Slack](https://chat-sdk.dev/adapters/slack), [Discord](https://chat-sdk.dev/adapters/discord), [Telegram](https://chat-sdk.dev/adapters/telegram).

Mastra generates a webhook route for each platform at:

```
/api/agents/{agentId}/channels/{platform}/webhook
```

For example: `/api/agents/support-agent/channels/slack/webhook`

Point your platform's webhook or interactions URL to this path.

### Local development

Platform webhooks need a public URL to reach your local server. Use a tunnel to expose `localhost:4111`:

```bash
# ngrok
ngrok http 4111

# cloudflared
cloudflared tunnel --url http://localhost:4111
```

Copy the generated URL and use it as the base for your webhook paths (e.g. `https://abc123.ngrok.io/api/agents/support-agent/channels/slack/webhook`).

## Thread context

When a user mentions the agent mid-conversation in a channel thread, the agent may not have prior context. By default, Mastra fetches the last 10 messages from the platform on the first mention.

1. On the **first mention** in a thread, the agent fetches recent messages from the platform.
1. These messages are prepended to the user's message as conversation context.
1. After responding, the agent subscribes to the thread and has full history via Mastra's memory.
1. Subsequent messages in that thread do **not** re-fetch from the platform.

Set `threadContext: { maxMessages: 0 }` to disable this behavior. This only applies to non-DM threads.

## Tool approval

Tools with `requireApproval: true` render as interactive cards with Approve and Deny buttons:

```typescript
const deleteFile = createTool({
  id: 'delete-file',
  description: 'Delete a file from the system',
  inputSchema: z.object({
    path: z.string().describe('Path to the file to delete'),
  }),
  requireApproval: true,
  execute: async ({ path }) => {
    await fs.unlink(path)
    return { deleted: path }
  },

```

When the agent calls this tool, users see a card with the tool name, arguments, and Approve/Deny buttons. The tool only executes after approval.

Set `cards: false` on an adapter to render tool calls as plain text instead of interactive cards. When cards are disabled and a tool requires approval, the agent uses `autoResumeSuspendedTools` to let the LLM decide based on the conversation context.

## Multi-user awareness

In group conversations, Mastra automatically prefixes each message with the sender's name and platform ID so the agent can distinguish between speakers:

```
[Alice (@U123ABC)]: Can you help me with this?
[Bob (@U456DEF)]: I have a question too.
```

## Multimodal content

Models like Gemini can natively process images, video, and audio. Combine `inlineMedia` and `inlineLinks` to let users share rich content with your agent across platforms:

```typescript
export const visionAgent = new Agent({
  name: 'Vision Agent',
  instructions: 'You can see images, watch videos, and listen to audio.',
  model: google('gemini-3.1-flash-image-preview'),
  channels: {
    adapters: {

    },
    inlineMedia: ['image/*', 'video/*', 'audio/*'],
    inlineLinks: [
      // Gemini treats YouTube URLs as native video file parts
      { match: 'youtube.com', mimeType: 'video/*' },
      { match: 'youtu.be', mimeType: 'video/*' },
      'imgur.com', // HEAD-check imgur links; inline as file part if mimeType matches inlineMedia
    ],
  },

```

With this configuration:

- A user uploads a screenshot and the agent describes what it sees
- A user uploads an `.mp4` clip and the agent summarizes the video
- A user pastes a YouTube link and the agent watches and discusses the video
- A user pastes an imgur link and the agent sees the image directly

By default, only images are sent inline (`inlineMedia: ['image/*']`). Unsupported types are described as text summaries so the agent knows about the file without crashing models that reject them.

> **Note:**
See [Channels reference](/reference/agents/channels#inline-media) for all `inlineMedia` patterns and [inlineLinks reference](/reference/agents/channels#inline-links) for domain matching, HEAD detection, and forced mime types.


## Related

- [Agent overview](/docs/agents/overview)
- [Tool approval](/docs/agents/agent-approval)
- [Channels reference](/reference/agents/channels)
- [Chat SDK adapters](https://chat-sdk.dev/adapters)

---

# Processors

Processors transform, validate, or control messages as they pass through an agent. They run at specific points in the agent's execution pipeline, allowing you to modify inputs before they reach the language model or outputs before they're returned to users.

Processors are configured as:

- **`inputProcessors`**: Run before messages reach the language model.
- **`outputProcessors`**: Run after the language model generates a response, but before it's returned to users.

You can use individual [`Processor`](/reference/processors/processor-interface) objects or compose them into workflows using Mastra's workflow primitives. Workflows give you advanced control over processor execution order, parallel processing, and conditional logic.

Some processors implement both input and output logic and can be used in either array depending on where the transformation should occur.

## When to use processors

Use processors to:

- Normalize or validate user input
- Add guardrails to your agent
- Detect and prevent prompt injection or jailbreak attempts
- Moderate content for safety or compliance
- Transform messages (e.g., translate languages, filter tool calls)
- Limit token usage or message history length
- Redact sensitive information (PII)
- Apply custom business logic to messages

Mastra includes several processors for common use cases. You can also create custom processors for application-specific requirements.

## Quickstart

Import and instantiate the processor, then pass it to the agent's `inputProcessors` or `outputProcessors` array:

```typescript
export const moderatedAgent = new Agent({
  name: 'moderated-agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5-mini',
  inputProcessors: [
    new ModerationProcessor({
      model: 'openai/gpt-5-mini',
      categories: ['hate', 'harassment', 'violence'],
      threshold: 0.7,
      strategy: 'block',
    }),
  ],

```

## Execution order

Processors run in the order they appear in the array:

```typescript
inputProcessors: [new UnicodeNormalizer(), new PromptInjectionDetector(), new ModerationProcessor()]
```

For output processors, the order determines the sequence of transformations applied to the model's response.

### With memory enabled

When memory is enabled on an agent, memory processors are automatically added to the pipeline:

**Input processors:**

```
[Memory Processors] → [Your inputProcessors]
```

Memory loads message history first, then your processors run.

**Output processors:**

```
[Your outputProcessors] → [Memory Processors]
```

Your processors run first, then memory persists messages.

This ordering ensures that if your output guardrail calls `abort()`, memory processors are skipped and no messages are saved. See [Memory Processors](/docs/memory/memory-processors#processor-execution-order) for details.

## Create custom processors

Custom processors implement the `Processor` interface:

### Transform input messages

```typescript
export class CustomInputProcessor implements Processor {
  id = 'custom-input'

  async processInput({ messages }: ProcessInputArgs): Promise<MastraDBMessage[]> {
    // Transform messages before they reach the LLM
    return messages.map(msg => ({
      ...msg,
      content: {
        ...msg.content,
        content: msg.content.content.toLowerCase(),
      },

```

The `processInput()` method receives `messages`, `systemMessages`, and an `abort()` function. Return a `MastraDBMessage[]` to replace messages, or `{ messages, systemMessages }` to also modify system messages.

See the [`Processor` reference](/reference/processors/processor-interface#processinput) for all available arguments and return types.

### Control each step

While `processInput()` runs once at the start of agent execution, `processInputStep()` runs at **each step** of the agentic loop (including tool call continuations). This enables per-step configuration changes like dynamic model switching or tool choice modifications.

```typescript
  Processor,
  ProcessInputStepArgs,
  ProcessInputStepResult,
} from '@mastra/core/processors'

export class DynamicModelProcessor implements Processor {
  id = 'dynamic-model'

  async processInputStep({
    stepNumber,
    model,
    toolChoice,
    messageList,
  }: ProcessInputStepArgs): Promise {
    // Use a fast model for initial response
    if (stepNumber === 0) {
      return { model: 'openai/gpt-5-mini' }

    // Disable tools after 5 steps to force completion
    if (stepNumber > 5) {
      return { toolChoice: 'none' }

    // No changes for other steps
    return {}


```

The method receives the current `stepNumber`, `model`, `tools`, `toolChoice`, `messages`, and more. Return an object with any properties you want to override for that step, for example `{ model, toolChoice, tools, systemMessages }`.

See the [`Processor` reference](/reference/processors/processor-interface#processinputstep) for all available arguments and return types.

### Use the `prepareStep()` callback

The `prepareStep()` callback on `generate()` or `stream()` is a shorthand for `processInputStep()`. Internally, Mastra wraps it in a processor that calls your function at each step. It accepts the same arguments and return type as `processInputStep()`, but doesn't require creating a class:

```typescript
await agent.generate('Complex task', {
  prepareStep: async ({ stepNumber, model }) => {
    if (stepNumber === 0) {
      return { model: 'openai/gpt-5-mini' }

    if (stepNumber > 5) {
      return { toolChoice: 'none' }

  },

```

### Transform output messages

```typescript
export class CustomOutputProcessor implements Processor {
  id = 'custom-output'

  async processOutputResult({ messages }): Promise<MastraDBMessage[]> {
    // Transform messages after the LLM generates them
    return messages.filter(msg => msg.role !== 'system')


```

The method also receives a `result` object with the full generation data — `text`, `usage` (token counts), `finishReason`, and `steps` (each containing `toolCalls`, `toolResults`, etc.). Use it to track usage or inspect tool calls:

```typescript
export class UsageTracker implements Processor {
  id = 'usage-tracker'

  async processOutputResult({ messages, result }) {
    console.log(`Tokens: ${result.usage.inputTokens} in, ${result.usage.outputTokens} out`)
    console.log(`Finish reason: ${result.finishReason}`)
    return messages


```

### Filter streamed output

The `processOutputStream()` method transforms or filters streaming chunks before they reach the client:

```typescript
export class StreamFilter implements Processor {
  id = 'stream-filter'

  async processOutputStream({ part }): Promise {
    // Transform or filter streaming chunks
    return part


```

To also receive custom `data-*` chunks emitted by tools via `writer.custom()`, set `processDataParts = true` on your processor. This lets you inspect, modify, or block tool-emitted data chunks before they reach the client.

### Validate each response

The `processOutputStep()` method runs after each LLM step, allowing you to validate the response and optionally request a retry:

```typescript
export class ResponseValidator implements Processor {
  id = 'response-validator'

  async processOutputStep({ text, abort, retryCount }) {
    const isValid = await validateResponse(text)

    if (!isValid && retryCount < 3) {
      abort('Response did not meet requirements. Try again.', { retry: true })

    return []


```

For more on retry behavior, see [Retry mechanism](#retry-mechanism) in Advanced patterns.

## Built-in utility processors

Mastra provides utility processors for common tasks:

**For security and validation processors**, see the [Guardrails](/docs/agents/guardrails) page for input/output guardrails and moderation processors.
**For memory-specific processors**, see the [Memory Processors](/docs/memory/memory-processors) page for processors that handle message history, semantic recall, and working memory.

### `TokenLimiter`

Prevents context window overflow by removing older messages when the total token count exceeds a specified limit. Prioritizes recent messages and preserves system messages.

```typescript
const agent = new Agent({
  name: 'my-agent',
  model: 'openai/gpt-5.4',
  inputProcessors: [new TokenLimiter(127000)],

```

See the [`TokenLimiterProcessor` reference](/reference/processors/token-limiter-processor) for custom encoding, strategy, and count mode options.

### `ToolCallFilter`

Removes tool calls and results from messages sent to the LLM, saving tokens on verbose tool interactions. Optionally exclude only specific tools. This filter only affects the LLM input, filtered messages are still saved to memory.

See the [`ToolCallFilter` reference](/reference/processors/tool-call-filter) for configuration options and the [Memory Processors](/docs/memory/memory-processors#manual-control-and-deduplication) page for pre-memory filtering.

### `ToolSearchProcessor`

Enables dynamic tool discovery for agents with large tool libraries. Instead of providing all tools upfront, the processor gives the agent `search_tools` and `load_tool` meta-tools to find and load tools by keyword on demand, reducing context token usage.

See the [`ToolSearchProcessor` reference](/reference/processors/tool-search-processor) for configuration options and usage examples.

## Advanced patterns

### Ensure a final response with `maxSteps`

When using `maxSteps` to limit agent execution, the agent may return an empty response if it attempts a tool call on the final step. Use `processInputStep()` to force a text response on the last step:

```typescript
  Processor,
  ProcessInputStepArgs,
  ProcessInputStepResult,
} from '@mastra/core/processors'

export class EnsureFinalResponseProcessor implements Processor {
  readonly id = 'ensure-final-response'

  private maxSteps: number

  constructor(maxSteps: number) {
    this.maxSteps = maxSteps

  async processInputStep({
    stepNumber,
    systemMessages,
  }: ProcessInputStepArgs): Promise {
    // On the last step, prevent tool calls and instruct the LLM to summarize
    if (stepNumber === this.maxSteps - 1) {
      return {
        tools: {},
        toolChoice: 'none',
        systemMessages: [
          ...systemMessages,

            role: 'system',
            content:
              'You have reached the maximum number of steps. Summarize your progress so far and provide a best-effort response. If the task is incomplete, clearly indicate what remains to be done.',
          },
        ],


    return {}


```

Add it to `inputProcessors` and pass the same `maxSteps` value to `generate()` or `stream()`:

```typescript
const MAX_STEPS = 5

const agent = new Agent({
  inputProcessors: [new EnsureFinalResponseProcessor(MAX_STEPS)],
  // ...

await agent.generate('Your prompt', { maxSteps: MAX_STEPS })
```

### Emit custom stream events

Output processors receive a `writer` object that lets you emit custom data chunks back to the client during streaming. This is useful for use cases like streaming moderation results or sending UI update signals without blocking the original stream.

```typescript title="src/mastra/processors/moderation-processor.ts" {6,18-25}


export class ModerationProcessor implements Processor {
  id = 'moderation'

  async processOutputResult({ messages, writer }) {
    // Run moderation on the final output
    const text = messages
      .filter(m => m.role === 'assistant')
      .flatMap(m => m.content.parts?.filter(p => p.type === 'text'))
      .map(p => p.text)
      .join(' ')

    const result = await runModeration(text)

    if (result.requiresChange) {
      // Emit a custom event to the client with the moderated text
      await writer?.custom({
        type: 'data-moderation-update',

          originalText: text,
          moderatedText: result.moderatedText,
          reason: result.reason,
        },

    return messages


```

On the client, listen for the custom chunk type in the stream:

```typescript
const stream = await agent.stream('Hello')

for await (const chunk of stream.fullStream) {
  if (chunk.type === 'data-moderation-update') {
    // Update the UI with moderated text
    updateDisplayedMessage(chunk.data.moderatedText)


```

Custom chunk types must use the `data-` prefix (e.g., `data-moderation-update`, `data-status`).

### Add metadata to messages

You can add custom metadata to messages in `processOutputResult`. This metadata is accessible via the response object:

```typescript
export class MetadataProcessor implements Processor {
  id = 'metadata-processor'

  async processOutputResult({
    messages,
  }: {
    messages: MastraDBMessage[]
  }): Promise<MastraDBMessage[]> {
    return messages.map(msg => {
      if (msg.role === 'assistant') {
        return {
          ...msg,
          content: {
            ...msg.content,
            metadata: {
              ...msg.content.metadata,
              processedAt: new Date().toISOString(),
              customData: 'your data here',
            },
          },


      return msg

```

Access the metadata with `generate()`:

```typescript
const result = await agent.generate('Hello')

// The response includes uiMessages with processor-added metadata
const assistantMessage = result.response?.uiMessages?.find(m => m.role === 'assistant')
console.log(assistantMessage?.metadata?.customData)
```

For streaming, access metadata from the `finish` chunk payload or the `stream.response` promise.

### Use workflows as processors

You can use Mastra workflows as processors to create complex processing pipelines with parallel execution, conditional branching, and error handling:

```typescript
  ProcessorStepSchema,
  PromptInjectionDetector,
  PIIDetector,
  ModerationProcessor,
} from '@mastra/core/processors'


// Create a workflow that runs multiple checks in parallel
const moderationWorkflow = createWorkflow({
  id: 'moderation-pipeline',
  inputSchema: ProcessorStepSchema,
  outputSchema: ProcessorStepSchema,

  .parallel([
    createStep(
      new PIIDetector({
        strategy: 'redact',
      }),
    ),
    createStep(
      new PromptInjectionDetector({
        strategy: 'block',
      }),
    ),
    createStep(
      new ModerationProcessor({
        strategy: 'block',
      }),
    ),
  ])
  .map(async ({ inputData }) => {
    return inputData['processor:pii-detector']

  .commit()

// Use the workflow as an input processor
const agent = new Agent({
  id: 'moderated-agent',
  name: 'Moderated Agent',
  model: 'openai/gpt-5.4',
  inputProcessors: [moderationWorkflow],

```

After a `.parallel()` step, each branch result is keyed by its processor ID (e.g. `processor:pii-detector`). Use `.map()` to select the branch whose output the next step should receive.

If a branch uses a mutating strategy like `redact`, map to that branch so its transformed messages carry forward. If all branches only `block`, any branch works. Pick any one since none of them modify the messages.

When an agent is registered with Mastra, processor workflows are automatically registered as workflows, allowing you to view and debug them in the [Studio](/docs/studio/overview).

### Retry mechanism

Processors can request that the LLM retry its response with feedback. This is useful for implementing quality checks, output validation, or iterative refinement:

```typescript
export class QualityChecker implements Processor {
  id = 'quality-checker'

  async processOutputStep({ text, abort, retryCount }) {
    const qualityScore = await evaluateQuality(text)

    if (qualityScore < 0.7 && retryCount < 3) {
      // Request a retry with feedback for the LLM
      abort('Response quality score too low. Please provide a more detailed answer.', {
        retry: true,
        metadata: { score: qualityScore },

    return []


const agent = new Agent({
  id: 'quality-agent',
  name: 'Quality Agent',
  model: 'openai/gpt-5.4',
  outputProcessors: [new QualityChecker()],
  maxProcessorRetries: 3, // Maximum retry attempts (default: 3)

```

The retry mechanism:

- Only works in `processOutputStep()` and `processInputStep()` methods
- Replays the step with the abort reason added as context for the LLM
- Tracks retry count via the `retryCount` parameter
- Respects `maxProcessorRetries` limit on the agent

## Related documentation

- [Guardrails](/docs/agents/guardrails): Security and validation processors
- [Memory Processors](/docs/memory/memory-processors): Memory-specific processors and automatic integration
- [Processor Interface](/reference/processors/processor-interface): Full API reference for processors
- [ToolSearchProcessor Reference](/reference/processors/tool-search-processor): API reference for dynamic tool search

---



# Workflows

# Workflows overview

Workflows let you define complex sequences of tasks using clear, structured steps rather than relying on the reasoning of a single agent. They give you full control over how tasks are broken down, how data moves between them, and what gets executed when. Workflows run using the built-in execution engine by default, or can be deployed to [workflow runners](/docs/deployment/workflow-runners) like Inngest for managed infrastructure.

![Workflows overview](/img/workflows/workflows-overview.jpg)

## When to use workflows

Use workflows for tasks that are clearly defined upfront and involve multiple steps with a specific execution order. They give you fine-grained control over how data flows and transforms between steps, and which primitives are called at each stage.

> **Tip:**
Watch an introduction to workflows, and how they compare to agents on [YouTube (7 minutes)](https://youtu.be/0jg2g3sNvgw).


## Core principles

Mastra workflows operate using these principles:

- Defining **steps** with `createStep`, specifying input/output schemas and business logic.
- Composing **steps** with `createWorkflow` to define the execution flow.
- Running **workflows** to execute the entire sequence, with built-in support for suspension, resumption, and streaming results.

## Creating a workflow step

Steps are the building blocks of workflows. Create a step using `createStep()` with `inputSchema` and `outputSchema` to define the data it accepts and returns.

The `execute` function defines what the step does. Use it to call functions in your codebase, external APIs, agents, or tools.

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    formatted: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { message } = inputData

    return {
      formatted: message.toUpperCase(),

  },

```

> **Info:**
Visit [`Step`](/reference/workflows/step) for a full list of configuration options.


### Using agents and tools

Workflow steps can also call registered agents or import and execute tools directly, visit the [Using Tools](/docs/agents/using-tools) page for more information.

## Creating a workflow

Create a workflow using `createWorkflow()` with `inputSchema` and `outputSchema` to define the data it accepts and returns. Add steps using `.then()` and complete the workflow with `.commit()`.

```typescript
const step1 = createStep({...});

export const testWorkflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    message: z.string()
  }),
  outputSchema: z.object({
    output: z.string()


  .then(step1)
  .commit();
```

> **Info:**
Visit [Workflow Class](/reference/workflows/workflow) for a full list of configuration options.


### Understanding control flow

Workflows can be composed using a number of different methods. The method you choose determines how each step's schema should be structured. Visit the [Control Flow](/docs/workflows/control-flow) page for more information.

## Studio

Open [Studio](/docs/studio/overview) and select a workflow from the **Workflows** tab.

- **Graph view**: The center panel visualizes the workflow's steps and execution flow.
- **Input form**: The right sidebar generates a form from the workflow's `inputSchema`. Fill it in and start the run.
- **Live status**: During execution, the graph updates each step's status in real time. The sidebar shows the workflow's input, output, state, and logs.
- [**Time travel**](/docs/workflows/time-travel): After a run completes, replay individual steps to inspect or retry them.

## Workflow state

Workflow state lets you share values across steps without passing them through every step's inputSchema and outputSchema. Use state for tracking progress, accumulating results, or sharing configuration across the entire workflow.

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ formatted: z.string() }),
  stateSchema: z.object({ counter: z.number() }),
  execute: async ({ inputData, state, setState }) => {
    // Read from state
    console.log(state.counter)

    // Update state for subsequent steps
    setState({ ...state, counter: state.counter + 1 })

    return { formatted: inputData.message.toUpperCase() }
  },

```

> **Info:**
Visit [Workflow State](/docs/workflows/workflow-state) for complete documentation on state schemas, initial state, persistence across suspend/resume, and nested workflows.


## Workflows as steps

Use a workflow as a step to reuse its logic within a larger composition. Input and output follow the same schema rules described in [Core principles](/docs/workflows/control-flow).

```typescript
const step1 = createStep({...});
const step2 = createStep({...});

const childWorkflow = createWorkflow({
  id: "child-workflow",
  inputSchema: z.object({
    message: z.string()
  }),
  outputSchema: z.object({
    emphasized: z.string()


  .then(step1)
  .then(step2)
  .commit();

export const testWorkflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    message: z.string()
  }),
  outputSchema: z.object({
    emphasized: z.string()


  .then(childWorkflow)
  .commit();
```

### Cloning a workflow

Clone a workflow using `cloneWorkflow()` when you want to reuse its logic but track it separately under a new ID. Each clone runs independently and shows up as a distinct workflow in logs and observability tools.

```typescript prettier:false {6} title="src/mastra/workflows/test-workflow.ts"


const step1 = createStep({...});

const parentWorkflow = createWorkflow({...})
const clonedWorkflow = cloneWorkflow(parentWorkflow, { id: "cloned-workflow" });

export const testWorkflow = createWorkflow({...})
  .then(step1)
  .then(clonedWorkflow)
  .commit();
```

## Registering a workflow

Register your workflow in the Mastra instance to make it available throughout your application. Once registered, it can be called from agents or tools and has access to shared resources such as logging and observability features:

```typescript
export const mastra = new Mastra({
  workflows: { testWorkflow },

```

## Referencing a workflow

You can run workflows from agents, tools, the Mastra Client, or the command line. Get a reference by calling `.getWorkflow()` on your `mastra` or `mastraClient` instance, depending on your setup:

```typescript
const testWorkflow = mastra.getWorkflow('testWorkflow')
```

> **Info:**
`mastra.getWorkflow()` is preferred over a direct import for two reasons:

1. It provides access to the Mastra instance configuration (logger, telemetry, storage, registered agents, and vector stores)
1. It provides full TypeScript type inference for workflow input and output schemas

**Note:** Use `getWorkflow()` with the workflow's **registration key** (the key used when adding it to Mastra). While `getWorkflowById()` is available for retrieving workflows by their `id` property, it doesn't provide the same level of type inference.


## Running workflows

Workflows can be run in two modes: start waits for all steps to complete before returning, and stream emits events during execution. Choose the approach that fits your use case: start when you only need the final result, and stream when you want to monitor progress or trigger actions as steps complete.


  Create a workflow run instance using `createRun()`, then call `.start()` with `inputData` matching the workflow's `inputSchema`. The workflow executes all steps and returns the final result.

    ```typescript
    const run = await testWorkflow.createRun()

    const result = await run.start({
      inputData: {
        message: 'Hello world',
      },

    if (result.status === 'success') {
      console.log(result.result)

    ```

Create a workflow run instance using `.createRun()`, then call `.stream()` with `inputData` matching the workflow's `inputSchema`. Iterate over `fullStream` to track progress, then await `result` to get the final workflow result.

    ```typescript
    const run = await testWorkflow.createRun()

    const stream = run.stream({
      inputData: {
        message: 'Hello world',
      },

    for await (const chunk of stream.fullStream) {
      console.log(chunk)

    // Get the final result (same type as run.start())
    const result = await stream.result

    if (result.status === 'success') {
      console.log(result.result)

    ```

### Workflow result type

Both `run.start()` and `stream.result` return a discriminated union based on the `status` property, which can be `success`, `failed`, `suspended`, `tripwire`, or `paused`. You can always safely access `result.status`, `result.input`, `result.steps`, and optionally `result.state` regardless of the status.

Additionally, depending on the status, different properties are available:

| Status | Unique properties | Description |
| - | - | - |
| `success` | `result` | The workflow's output data |
| `failed` | `error` | The error that caused the failure |
| `tripwire` | `tripwire` | Contains `reason`, `retry?`, `metadata?`, `processorId?` |
| `suspended` | `suspendPayload`, `suspended` | Suspension data and array of suspended step paths |
| `paused` | _(none)_ | Only common properties available |

To access status-specific properties, check the `status` first:

```typescript
const result = await run.start({ inputData: { message: 'Hello world' } })

if (result.status === 'success') {
  console.log(result.result) // Only available when status is "success"
} else if (result.status === 'failed') {
  console.log(result.error.message)
} else if (result.status === 'suspended') {
  console.log(result.suspendPayload)

```

### Workflow output

Here's an example of a successful workflow result, showing the `input`, `steps`, and `result` properties:

```json

  "status": "success",
  "steps": {
    "step-1": {
      "status": "success",
      "payload": {
        "message": "Hello world"
      },
      "output": {
        "formatted": "HELLO WORLD"

    },
    "step-2": {
      "status": "success",
      "payload": {
        "formatted": "HELLO WORLD"
      },
      "output": {
        "emphasized": "HELLO WORLD!!!"


  },
  "input": {
    "message": "Hello world"
  },
  "result": {
    "emphasized": "HELLO WORLD!!!"


```

## Restarting active workflow runs

When a workflow run loses connection to the server, it can be restarted from the last active step. This is useful for long-running workflows that might still be running when the server loses connection. Restarting a workflow run will resume execution from the last active step, and the workflow will continue from there.

### Restarting all active workflow runs of a workflow with `restartAllActiveWorkflowRuns()`

Use `restartAllActiveWorkflowRuns()` to restart all active workflow runs of a workflow. This helps restart all active workflow runs of a workflow, without having to manually loop through each run and restart.

```typescript
workflow.restartAllActiveWorkflowRuns()
```

### Restarting an active workflow run with `restart()`

Use `restart()` to restart an active workflow run from the last active step. This will resume execution from the last active step, and the workflow will continue from there.

```typescript
const run = await workflow.createRun()

const result = await run.start({ inputData: { value: 'initial data' } })

const restartedResult = await run.restart()
```

### Identifying active workflow runs

When a workflow run is active, it will have a `status` of `running` or `waiting`. You can check the workflow's `status` to confirm it's active, and use `active` to identify the active workflow run.

```typescript
const activeRuns = await workflow.listActiveWorkflowRuns()
if (activeRuns.runs.length > 0) {
  console.log(activeRuns.runs)

```

> **Note:**
When running the local mastra server, all active workflow runs will be restarted automatically when the server starts.


## Using `RequestContext`

Use [RequestContext](/docs/server/request-context) to access request-specific values. This lets you conditionally adjust behavior based on the context of the request.

```typescript
export type UserTier = {
  'user-tier': 'enterprise' | 'pro'

const step1 = createStep({
  execute: async ({ requestContext }) => {
    const userTier = requestContext.get('user-tier') as UserTier['user-tier']

    const maxResults = userTier === 'enterprise' ? 1000 : 50

    return { maxResults }
  },

```

> **Info:**
Visit [Request Context](/docs/server/request-context) for more information.


> **Tip:**
For type-safe request context schema validation, see [Schema Validation](/docs/server/request-context#schema-validation).


## Related

For a closer look at workflows, see our [Workflow Guide](/guides/guide/ai-recruiter), which walks through the core concepts with a practical example.

- [Workflow State](/docs/workflows/workflow-state)
- [Control Flow](/docs/workflows/control-flow)
- [Suspend & Resume](/docs/workflows/suspend-and-resume)
- [Error Handling](/docs/workflows/error-handling)

---

# Control flow

Workflows run a sequence of predefined tasks, and you can control how that flow is executed. Tasks are divided into **steps**, which can be executed in different ways depending on your requirements. They can run sequentially, in parallel, or follow different paths based on conditions.

Each step connects to the next in the workflow through defined schemas that keep data controlled and consistent.

## Core principles

- The first step’s `inputSchema` must match the workflow’s `inputSchema`.
- The final step’s `outputSchema` must match the workflow’s `outputSchema`.
- Each step’s `outputSchema` must match the next step’s `inputSchema`.
  - If it doesn’t, use [Input data mapping](#input-data-mapping) to transform the data into the required shape.

## Chaining steps with `.then()`

Use `.then()` to run steps in order, allowing each step to access the result of the step before it.

![Chaining steps with .then()](/img/workflows/workflows-control-flow-then.jpg)

```typescript
const step1 = createStep({
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    formatted: z.string(),
  }),

const step2 = createStep({
  inputSchema: z.object({
    formatted: z.string(),
  }),
  outputSchema: z.object({
    emphasized: z.string(),
  }),

export const testWorkflow = createWorkflow({
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    emphasized: z.string(),
  }),

  .then(step1)
  .then(step2)
  .commit()
```

## Simultaneous steps with `.parallel()`

Use `.parallel()` to run steps at the same time. All parallel steps must complete before the workflow continues to the next step. Each step's `id` is used when defining a following step's `inputSchema` and becomes the key on the `inputData` object used to access the previous step's values. The outputs of parallel steps can then be referenced or combined by a following step.

![Concurrent steps with .parallel()](/img/workflows/workflows-control-flow-parallel.jpg)

```typescript
const step1 = createStep({
  id: 'step-1',

const step2 = createStep({
  id: 'step-2',

const step3 = createStep({
  id: 'step-3',
  inputSchema: z.object({
    'step-1': z.object({
      formatted: z.string(),
    }),
    'step-2': z.object({
      emphasized: z.string(),
    }),
  }),
  outputSchema: z.object({
    combined: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { formatted } = inputData['step-1']
    const { emphasized } = inputData['step-2']
    return {
      combined: `${formatted} | ${emphasized}`,

  },

export const testWorkflow = createWorkflow({
  inputSchema: z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    combined: z.string(),
  }),

  .parallel([step1, step2])
  .then(step3)
  .commit()
```

:::tip[📹 Watch]

How to run steps in parallel and optimize your Mastra workflow → [YouTube (3 minutes)](https://youtu.be/GQJxve5Hki4)


### Output structure

When steps run in parallel, the output is an object where each key is the step's `id` and the value is that step's output. This allows you to access each parallel step's result independently.

```typescript
const step1 = createStep({
  id: 'format-step',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ formatted: z.string() }),
  execute: async ({ inputData }) => ({
    formatted: inputData.message.toUpperCase(),
  }),

const step2 = createStep({
  id: 'count-step',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ count: z.number() }),
  execute: async ({ inputData }) => ({
    count: inputData.message.length,
  }),

const step3 = createStep({
  id: 'combine-step',
  // The inputSchema must match the structure of parallel outputs
  inputSchema: z.object({
    'format-step': z.object({ formatted: z.string() }),
    'count-step': z.object({ count: z.number() }),
  }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => {
    // Access each parallel step's output by its id
    const formatted = inputData['format-step'].formatted
    const count = inputData['count-step'].count
    return {
      result: `${formatted} (${count} characters)`,

  },

export const testWorkflow = createWorkflow({
  id: 'parallel-output-example',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ result: z.string() }),

  .parallel([step1, step2])
  .then(step3)
  .commit()

// When executed with { message: "hello" }
// The parallel output structure will be:
// {
//   "format-step": { formatted: "HELLO" },
//   "count-step": { count: 5 }
// }
```

**Key points:**

- Each parallel step's output is keyed by its `id`
- All parallel steps execute simultaneously
- The next step receives an object containing all parallel step outputs
- You must define the `inputSchema` of the following step to match this structure

### Handling step failures

If any parallel step throws an error, the entire parallel block fails. To build resilient parallel workflows where some steps may fail — for example, multiple research agents where one might have an expired auth token — handle errors inside the step itself using try/catch:

```typescript
const resilientStep = createStep({
  id: 'researcher',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({
    brief: z.string().nullable(),
    failed: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    try {
      const result = await fetchExternalData(inputData.query)
      return { brief: result, failed: false }
    } catch {
      return { brief: null, failed: true }

  },

```

This way the step always succeeds with a typed result, and the downstream step can filter out failed results:

```typescript
const writerStep = createStep({
  id: 'writer',
  inputSchema: z.object({
    'researcher-a': z.object({ brief: z.string().nullable(), failed: z.boolean() }),
    'researcher-b': z.object({ brief: z.string().nullable(), failed: z.boolean() }),
  }),
  outputSchema: z.object({ synthesis: z.string() }),
  execute: async ({ inputData }) => {
    const briefs = Object.values(inputData)
      .filter(v => !v.failed && v.brief)
      .map(v => v.brief)
    return { synthesis: briefs.join('; ') }
  },

```

> **Info:**
Visit [Choosing the right pattern](#choosing-the-right-pattern) to understand when to use `.parallel()` vs `.foreach()`.


## Conditional logic with `.branch()`

Use `.branch()` to choose which step to run based on a condition. All steps in a branch need the same `inputSchema` and `outputSchema` because branching requires consistent schemas so workflows can follow different paths.

![Conditional branching with .branch()](/img/workflows/workflows-control-flow-branch.jpg)

```typescript
const step1 = createStep({...})

const stepA = createStep({
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    result: z.string()

});

const stepB = createStep({
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    result: z.string()

});

export const testWorkflow = createWorkflow({
  inputSchema: z.object({
    value: z.number()
  }),
  outputSchema: z.object({
    result: z.string()


  .then(step1)
  .branch([
    [async ({ inputData: { value } }) => value > 10, stepA],
    [async ({ inputData: { value } }) => value <= 10, stepB]
  ])
  .commit();
```

### Output structure

When using conditional branching, only one branch executes based on which condition evaluates to `true` first. The output structure is similar to `.parallel()`, where the result is keyed by the executed step's `id`.

```typescript
const step1 = createStep({
  id: 'initial-step',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ value: z.number() }),
  execute: async ({ inputData }) => inputData,

const highValueStep = createStep({
  id: 'high-value-step',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => ({
    result: `High value: ${inputData.value}`,
  }),

const lowValueStep = createStep({
  id: 'low-value-step',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => ({
    result: `Low value: ${inputData.value}`,
  }),

const finalStep = createStep({
  id: 'final-step',
  // The inputSchema must account for either branch's output
  inputSchema: z.object({
    'high-value-step': z.object({ result: z.string() }).optional(),
    'low-value-step': z.object({ result: z.string() }).optional(),
  }),
  outputSchema: z.object({ message: z.string() }),
  execute: async ({ inputData }) => {
    // Only one branch will have executed
    const result = inputData['high-value-step']?.result || inputData['low-value-step']?.result
    return { message: result }
  },

export const testWorkflow = createWorkflow({
  id: 'branch-output-example',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ message: z.string() }),

  .then(step1)
  .branch([
    [async ({ inputData }) => inputData.value > 10, highValueStep],
    [async ({ inputData }) => inputData.value <= 10, lowValueStep],
  ])
  .then(finalStep)
  .commit()

// When executed with { value: 15 }
// Only the high-value-step executes, output structure:
// {
//   "high-value-step": { result: "High value: 15" }
// }

// When executed with { value: 5 }
// Only the low-value-step executes, output structure:
// {
//   "low-value-step": { result: "Low value: 5" }
// }
```

**Key points:**

- Only one branch executes based on condition evaluation order
- The output is keyed by the executed step's `id`
- Subsequent steps should handle all possible branch outputs
- Use optional fields in the `inputSchema` when the next step needs to handle multiple possible branches
- Conditions are evaluated in the order they're defined

## Input data mapping

When using `.then()`, `.parallel()`, or `.branch()`, it's sometimes necessary to transform the output of a previous step to match the input of the next. In these cases you can use `.map()` to access the `inputData` and transform it to create a suitable data shape for the next step.

![Mapping with .map()](/img/workflows/workflows-data-mapping-map.jpg)

```typescript
const step1 = createStep({...});
const step2 = createStep({...});

export const testWorkflow = createWorkflow({...})
  .then(step1)
  .map(async ({ inputData }) => {
    const { foo } = inputData;
    return {
      bar: `new ${foo}`,
    };

  .then(step2)
  .commit();
```

The `.map()` method provides additional helper functions for more complex mapping scenarios.

**Available helper functions:**

- [`getStepResult()`](/reference/workflows/workflow-methods/map#using-getstepresult): Access a specific step's full output
- [`getInitData<any>()`](/reference/workflows/workflow-methods/map#using-getinitdata): Access the workflow's initial input data
- [`mapVariable()`](/reference/workflows/workflow-methods/map#using-mapvariable): Use declarative object syntax to extract and rename fields

### Parallel and Branch outputs

When working with `.parallel()` or `.branch()` outputs, you can use `.map()` to transform the data structure before passing it to the next step. This is especially useful when you need to flatten or restructure the output.

```typescript prettier:false title="src/mastra/workflows/test-workflow.ts"
export const testWorkflow = createWorkflow({...})
  .parallel([step1, step2])
  .map(async ({ inputData }) => {
    // Transform the parallel output structure
    return {
      combined: `${inputData["step1"].value} - ${inputData["step2"].value}`
    };

  .then(nextStep)
  .commit();
```

You can also use the helper functions provided by `.map()`:

```typescript prettier:false title="src/mastra/workflows/test-workflow.ts"
export const testWorkflow = createWorkflow({...})
  .branch([
    [condition1, stepA],
    [condition2, stepB]
  ])
  .map(async ({ inputData, getStepResult }) => {
    // Access specific step results
    const stepAResult = getStepResult("stepA");
    const stepBResult = getStepResult("stepB");
    
    // Return the result from whichever branch executed
    return stepAResult || stepBResult;

  .then(nextStep)
  .commit();
```

## Looping steps

Workflows support different looping methods that let you repeat steps until or while a condition is met, or iterate over arrays. Loops can be combined with other control methods like `.then()`.

### Looping with `.dountil()`

Use `.dountil()` to run a step repeatedly until a condition becomes true.

![Repeating with .dountil()](/img/workflows/workflows-control-flow-dountil.jpg)

```typescript prettier:false {14} title="src/mastra/workflows/test-workflow.ts"
const step1 = createStep({...});

const step2 = createStep({
  execute: async ({ inputData }) => {
    const { number } = inputData;
    return {
      number: number + 1
    };

});

export const testWorkflow = createWorkflow({})
  .then(step1)
  .dountil(step2, async ({ inputData: { number } }) => number > 10)
  .commit();
```

### Looping with `.dowhile()`

Use `.dowhile()` to run a step repeatedly while a condition remains true.

![Repeating with .dowhile()](/img/workflows/workflows-control-flow-dowhile.jpg)

```typescript prettier:false {14} title="src/mastra/workflows/test-workflow.ts"
const step1 = createStep({...});

const step2 = createStep({
  execute: async ({ inputData }) => {
    const { number } = inputData;
    return {
      number: number + 1
    };

});

export const testWorkflow = createWorkflow({})
  .then(step1)
  .dowhile(step2, async ({ inputData: { number } }) => number < 10)
  .commit();
```

### Looping with `.foreach()`

Use `.foreach()` to run the same step for each item in an array. The input must be of type `array` so the loop can iterate over its values, applying the step's logic to each one. See [Choosing the right pattern](#choosing-the-right-pattern) for guidance on when to use `.foreach()` vs other methods.

![Repeating with .foreach()](/img/workflows/workflows-control-flow-foreach.jpg)

```typescript prettier:false {15} title="src/mastra/workflows/test-workflow.ts"
const step1 = createStep({
  inputSchema: z.string(),
  outputSchema: z.string(),
  execute: async ({ inputData }) => {
    return inputData.toUpperCase();

});

const step2 = createStep({...});

export const testWorkflow = createWorkflow({
  inputSchema: z.array(z.string()),
  outputSchema: z.array(z.string())

  .foreach(step1)
  .then(step2)
  .commit();
```

#### Output structure

The `.foreach()` method always returns an array containing the output of each iteration. The order of outputs matches the order of inputs.

```typescript
const addTenStep = createStep({
  id: 'add-ten',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ value: z.number() }),
  execute: async ({ inputData }) => ({
    value: inputData.value + 10,
  }),

export const testWorkflow = createWorkflow({
  id: 'foreach-output-example',
  inputSchema: z.array(z.object({ value: z.number() })),
  outputSchema: z.array(z.object({ value: z.number() })),

  .foreach(addTenStep)
  .commit()

// When executed with [{ value: 1 }, { value: 22 }, { value: 333 }]
// Output: [{ value: 11 }, { value: 32 }, { value: 343 }]
```

#### Concurrency limits

Use `concurrency` to control the number of array items processed at the same time. The default is `1`, which runs steps sequentially. Increasing the value allows `.foreach()` to process multiple items simultaneously.

```typescript prettier:false title="src/mastra/workflows/test-workflow.ts"
const step1 = createStep({...})

export const testWorkflow = createWorkflow({...})
  .foreach(step1, { concurrency: 4 })
  .commit();
```

#### Aggregating results after `.foreach()`

Since `.foreach()` outputs an array, you can use `.then()` or `.map()` to aggregate or transform the results. The step following `.foreach()` receives the entire array as its input.

```typescript
const processItemStep = createStep({
  id: 'process-item',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ processed: z.number() }),
  execute: async ({ inputData }) => ({
    processed: inputData.value * 2,
  }),

const aggregateStep = createStep({
  id: 'aggregate',
  // Input is an array of outputs from foreach
  inputSchema: z.array(z.object({ processed: z.number() })),
  outputSchema: z.object({ total: z.number() }),
  execute: async ({ inputData }) => ({
    // Sum all processed values
    total: inputData.reduce((sum, item) => sum + item.processed, 0),
  }),

export const testWorkflow = createWorkflow({
  id: 'foreach-aggregate-example',
  inputSchema: z.array(z.object({ value: z.number() })),
  outputSchema: z.object({ total: z.number() }),

  .foreach(processItemStep)
  .then(aggregateStep) // Receives the full array from foreach
  .commit()

// When executed with [{ value: 1 }, { value: 2 }, { value: 3 }]
// After foreach: [{ processed: 2 }, { processed: 4 }, { processed: 6 }]
// After aggregate: { total: 12 }
```

You can also use `.map()` to transform the array output:

```typescript prettier:false title="src/mastra/workflows/test-workflow.ts"
export const testWorkflow = createWorkflow({...})
  .foreach(processItemStep)
  .map(async ({ inputData }) => ({
    // Transform the array into a different structure
    values: inputData.map(item => item.processed),
    count: inputData.length

  .then(nextStep)
  .commit();
```

#### Chaining multiple `.foreach()` calls

When you chain `.foreach()` calls, each operates on the array output of the previous step. This is useful when each item in your array needs to be transformed by multiple steps in sequence.

```typescript
const chunkStep = createStep({
  id: 'chunk',
  // Takes a document, returns an array of chunks
  inputSchema: z.object({ content: z.string() }),
  outputSchema: z.array(z.object({ chunk: z.string() })),
  execute: async ({ inputData }) => {
    // Split document into chunks
    const chunks = inputData.content.match(/.{1,100}/g) || []
    return chunks.map(chunk => ({ chunk }))
  },

const embedStep = createStep({
  id: 'embed',
  // Takes a single chunk, returns embedding
  inputSchema: z.object({ chunk: z.string() }),
  outputSchema: z.object({ embedding: z.array(z.number()) }),
  execute: async ({ inputData }) => ({
    embedding: [
      /* vector embedding */
    ],
  }),

// For a single document that produces multiple chunks:
export const singleDocWorkflow = createWorkflow({
  id: 'single-doc-rag',
  inputSchema: z.object({ content: z.string() }),
  outputSchema: z.array(z.object({ embedding: z.array(z.number()) })),

  .then(chunkStep) // Returns array of chunks
  .foreach(embedStep) // Process each chunk -> array of embeddings
  .commit()
```

For processing multiple documents where each produces multiple chunks, you have options:

**Option 1: Process all documents in a single step with batching control**

```typescript prettier:false title="src/mastra/workflows/test-workflow.ts"
const downloadAndChunkStep = createStep({
  id: "download-and-chunk",
  inputSchema: z.array(z.string()),  // Array of URLs
  outputSchema: z.array(z.object({ chunk: z.string(), source: z.string() })),
  execute: async ({ inputData: urls }) => {
    // Control batching/parallelization within the step
    const allChunks = [];
    for (const url of urls) {
      const content = await fetch(url).then(r => r.text());
      const chunks = content.match(/.{1,100}/g) || [];
      allChunks.push(...chunks.map(chunk => ({ chunk, source: url })));

    return allChunks;

});

export const multiDocWorkflow = createWorkflow({...})
  .then(downloadAndChunkStep)  // Returns flat array of all chunks
  .foreach(embedStep, { concurrency: 10 })  // Embed each chunk in parallel
  .commit();
```

**Option 2: Use foreach for documents, aggregate chunks, then foreach for embeddings**

```typescript
const downloadStep = createStep({
  id: 'download',
  inputSchema: z.string(), // Single URL
  outputSchema: z.object({ content: z.string(), source: z.string() }),
  execute: async ({ inputData: url }) => ({
    content: await fetch(url).then(r => r.text()),
    source: url,
  }),

const chunkDocStep = createStep({
  id: 'chunk-doc',
  inputSchema: z.object({ content: z.string(), source: z.string() }),
  outputSchema: z.array(z.object({ chunk: z.string(), source: z.string() })),
  execute: async ({ inputData }) => {
    const chunks = inputData.content.match(/.{1,100}/g) || []
    return chunks.map(chunk => ({ chunk, source: inputData.source }))
  },

export const multiDocWorkflow = createWorkflow({
  id: 'multi-doc-rag',
  inputSchema: z.array(z.string()), // Array of URLs
  outputSchema: z.array(z.object({ embedding: z.array(z.number()) })),

  .foreach(downloadStep, { concurrency: 5 }) // Download docs in parallel
  .foreach(chunkDocStep) // Chunk each doc -> array of chunk arrays
  .map(async ({ inputData }) => {
    // Flatten nested arrays: [[chunks], [chunks]] -> [chunks]
    return inputData.flat()

  .foreach(embedStep, { concurrency: 10 }) // Embed all chunks
  .commit()
```

**Key points about chaining `.foreach()`:**

- Each `.foreach()` operates on the array from the previous step
- If a step inside `.foreach()` returns an array, the output becomes an array of arrays
- Use `.map()` with `.flat()` to flatten nested arrays when needed
- For complex RAG pipelines, Option 1 (handling batching in a single step) often provides better control

#### Nested workflows inside foreach

The step after `.foreach()` only executes after all iterations complete. If you need to run multiple sequential operations per item, use a nested workflow instead of chaining multiple `.foreach()` calls. This keeps all operations for each item together and makes the data flow clearer.

```typescript
// Define a workflow that processes a single document
const processDocumentWorkflow = createWorkflow({
  id: 'process-document',
  inputSchema: z.object({ url: z.string() }),
  outputSchema: z.object({
    embeddings: z.array(z.array(z.number())),
    metadata: z.object({ url: z.string(), chunkCount: z.number() }),
  }),

  .then(downloadStep) // Download the document
  .then(chunkStep) // Split into chunks
  .then(embedChunksStep) // Embed all chunks for this document
  .then(formatResultStep) // Format the final output
  .commit()

// Use the nested workflow inside foreach
export const batchProcessWorkflow = createWorkflow({
  id: 'batch-process-documents',
  inputSchema: z.array(z.object({ url: z.string() })),
  outputSchema: z.array(
    z.object({
      embeddings: z.array(z.array(z.number())),
      metadata: z.object({ url: z.string(), chunkCount: z.number() }),
    }),
  ),

  .foreach(processDocumentWorkflow, { concurrency: 3 })
  .commit()

// Each document goes through all 4 steps before the next document starts (with concurrency: 1)
// With concurrency: 3, up to 3 documents process their full pipelines in parallel
```

**Why use nested workflows:**

- **Better parallelism**: With `concurrency: N`, multiple items run their full pipelines simultaneously. Chained `.foreach().foreach()` processes all items through step 1, waits, then all through step 2 - nested workflows let each item progress independently
- All steps for one item complete together before results are collected
- Cleaner than multiple `.foreach()` calls which create nested arrays
- Each nested workflow execution is independent with its own data flow
- Easier to test and reuse the per-item logic separately

**How it works:**

1. The parent workflow passes each array item to an instance of the nested workflow
1. Each nested workflow runs its full step sequence for that item
1. With `concurrency > 1`, multiple nested workflows execute in parallel
1. The nested workflow's final output becomes one element in the result array
1. After all nested workflows complete, the next step in the parent receives the full array

## Choosing the right pattern

Use this section as a reference for selecting the appropriate control flow method.

### Quick reference

| Method | Purpose | Input | Output | Concurrency |
| - | - | - | - | - |
| `.then(step)` | Sequential processing | `T` | `U` | N/A (one at a time) |
| `.parallel([a, b])` | Different operations on same input | `T` | `{ a: U, b: V }` | All run simultaneously |
| `.foreach(step)` | Same operation on each array item | `T[]` | `U[]` | Configurable (default: 1) |
| `.branch([...])` | Conditional path selection | `T` | `{ selectedStep: U }` | Only one branch runs |

### `.parallel()` vs `.foreach()`

**Use `.parallel()` when you have one input that needs different processing:**

```typescript
// Same user data processed differently in parallel
workflow.parallel([validateStep, enrichStep, scoreStep]).then(combineResultsStep)
```

**Use `.foreach()` when you have many inputs that need the same processing:**

```typescript
// Multiple URLs each processed the same way
workflow.foreach(downloadStep, { concurrency: 5 }).then(aggregateStep)
```

### When to use nested workflows

**Inside `.foreach()`** - when each array item needs multiple sequential steps:

```typescript
// Each document goes through a full pipeline
const processDocWorkflow = createWorkflow({...})
  .then(downloadStep)
  .then(parseStep)
  .then(embedStep)
  .commit();

workflow.foreach(processDocWorkflow, { concurrency: 3 })
```

This is cleaner than chaining `.foreach().foreach()`, which creates nested arrays.

**Inside `.parallel()`** - when a parallel branch needs its own multi-step pipeline:

```typescript
const pipelineA = createWorkflow({...}).then(step1).then(step2).commit();
const pipelineB = createWorkflow({...}).then(step3).then(step4).commit();

workflow.parallel([pipelineA, pipelineB])
```

### Chaining patterns

| Pattern | What happens | Common use case |
| - | - | - |
| `.then().then()` | Sequential steps | Simple pipelines |
| `.parallel().then()` | Run in parallel, then combine | Fan-out/fan-in |
| `.foreach().then()` | Process all items, then aggregate | Map-reduce |
| `.foreach().foreach()` | Creates array of arrays | Avoid - use nested workflow or `.map()` with `.flat()` |
| `.foreach(workflow)` | Full pipeline per item | Multi-step processing per array item |

### Synchronization: when does the next step run?

Both `.parallel()` and `.foreach()` are synchronization points. The next step in the workflow only executes after all parallel branches or all array iterations have completed.

```typescript
workflow
  .parallel([stepA, stepB, stepC]) // All 3 run simultaneously
  .then(combineStep) // Waits for ALL 3 to finish before running
  .commit()

workflow
  .foreach(processStep, { concurrency: 5 }) // Up to 5 items process at once
  .then(aggregateStep) // Waits for ALL items to finish before running
  .commit()
```

This means:

- `.parallel()` collects all branch outputs into an object, then passes it to the next step
- `.foreach()` collects all iteration outputs into an array, then passes it to the next step
- Results can't be "streamed" to the next step as they complete

### Concurrency behavior

| Method | Behavior |
| - | - |
| `.then()` | Sequential - one step at a time |
| `.parallel()` | All branches run simultaneously (no limit option) |
| `.foreach()` | Controlled via `{ concurrency: N }` - default is 1 (sequential) |
| Nested workflow in `.foreach()` | Respects parent's concurrency setting |

**Performance tip:** For I/O-bound operations in `.foreach()`, increase concurrency to process items in parallel:

```typescript
// Process up to 10 items simultaneously
workflow.foreach(fetchDataStep, { concurrency: 10 })
```

## Loop management

Loop conditions can be implemented in different ways depending on how you want the loop to end. Common patterns include checking values returned in `inputData`, setting a maximum number of iterations, or aborting execution when a limit is reached.

### Aborting loops

Use `iterationCount` to limit how many times a loop runs. If the count exceeds your threshold, throw an error to fail the step and stop the workflow.

```typescript prettier:false title="src/mastra/workflows/test-workflow.ts"
const step1 = createStep({...});

export const testWorkflow = createWorkflow({...})
  .dountil(step1, async ({ inputData: { userResponse, iterationCount } }) => {
    if (iterationCount >= 10) {
      throw new Error("Maximum iterations reached");

    return userResponse === "yes";

  .commit();
```

## Related

- [Suspend & Resume](/docs/workflows/suspend-and-resume)
- [Human-in-the-loop](/docs/workflows/human-in-the-loop)

---

# Suspend & resume

Workflows can be paused at any step to collect additional data, wait for API callbacks, throttle costly operations, or request [human-in-the-loop](/docs/workflows/human-in-the-loop) input. When a workflow is suspended, its current execution state is saved as a snapshot. You can later resume the workflow from a [specific step ID](/docs/workflows/snapshots#retrieving-snapshots), restoring the exact state captured in that snapshot. [Snapshots](/docs/workflows/snapshots) are stored in your configured storage provider and persist across deployments and application restarts.

## Pausing a workflow with `suspend()`

Use `suspend()` to pause workflow execution at a specific step. You can define a suspend condition in the step’s `execute` block using values from `resumeData`.

- If the condition isn’t met, the workflow pauses and returns `suspend()`.
- If the condition is met, the workflow continues with the remaining logic in the step.

![Pausing a workflow with suspend()](/img/workflows/workflows-suspend.jpg)

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({
    userEmail: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    const { userEmail } = inputData
    const { approved } = resumeData ?? {}

    if (!approved) {
      return await suspend({})

    return {
      output: `Email sent to ${userEmail}`,

  },

export const testWorkflow = createWorkflow({
  id: 'test-workflow',
  inputSchema: z.object({
    userEmail: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),

  .then(step1)
  .commit()
```

## Restarting a workflow with `resume()`

Use `resume()` to restart a suspended workflow from the step where it paused. Pass `resumeData` matching the step's `resumeSchema` to satisfy the suspend condition and continue execution.

![Restarting a workflow with resume()](/img/workflows/workflows-resume.jpg)

```typescript
const workflow = mastra.getWorkflow('testWorkflow')
const run = await workflow.createRun()

await run.start({
  inputData: {
    userEmail: 'alex@example.com',
  },

const handleResume = async () => {
  const result = await run.resume({
    step: step1,
    resumeData: { approved: true },

```

Passing the `step` object provides full type-safety for `resumeData`. Alternatively, you can pass a step ID for more flexibility when the ID comes from user input or a database.

```typescript
const result = await run.resume({
  step: 'step-1',
  resumeData: { approved: true },

```

If only one step is suspended, you can omit the step argument entirely and Mastra will resume the last suspended step in the workflow.

When resuming with only a `runId`, create a run instance first using `createRun()`.

```typescript
const workflow = mastra.getWorkflow('testWorkflow')
const run = await workflow.createRun({ runId: '123' })

const stream = run.resume({
  resumeData: { approved: true },

```

You can call `resume()` from anywhere in your application, including HTTP endpoints, event handlers, in response to [human input](/docs/workflows/human-in-the-loop), or timers.

```typescript
const midnight = new Date()
midnight.setUTCHours(24, 0, 0, 0)

setTimeout(async () => {
  await run.resume({
    step: 'step-1',
    resumeData: { approved: true },

}, midnight.getTime() - Date.now())
```

## Accessing suspend data with `suspendData`

When a step is suspended, you may want to access the data that was provided to `suspend()` when the step is later resumed. Use the `suspendData` parameter in your step's execute function to access this data.

```typescript
const approvalStep = createStep({
  id: 'user-approval',
  inputSchema: z.object({
    requestId: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean(),
  }),
  suspendSchema: z.object({
    reason: z.string(),
    requestDetails: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend, suspendData }) => {
    const { requestId } = inputData
    const { approved } = resumeData ?? {}

    // On first execution, suspend with context
    if (!approved) {
      return await suspend({
        reason: 'User approval required',
        requestDetails: `Request ${requestId} pending review`,

    // On resume, access the original suspend data
    const suspendReason = suspendData?.reason || 'Unknown'
    const details = suspendData?.requestDetails || 'No details'

    return {
      result: `${details} - ${suspendReason} - Decision: ${approved ? 'Approved' : 'Rejected'}`,

  },

```

The `suspendData` parameter is automatically populated when a step is resumed and contains the exact data that was passed to the `suspend()` function during the original suspension. This allows you to maintain context about why the workflow was suspended and use that information during the resume process.

## Identifying suspended executions

When a workflow is suspended, it restarts from the step where it paused. You can check the workflow's `status` to confirm it's suspended, and use `suspended` to identify the paused step or [nested workflow](/docs/workflows/overview#workflows-as-steps).

```typescript
const workflow = mastra.getWorkflow('testWorkflow')
const run = await workflow.createRun()

const result = await run.start({
  inputData: {
    userEmail: 'alex@example.com',
  },

if (result.status === 'suspended') {
  console.log(result.suspended[0])
  await run.resume({
    step: result.suspended[0],
    resumeData: { approved: true },

```

### Example output

The `suspended` array contains the IDs of any suspended workflows and steps from the run. These can be passed to the `step` parameter when calling `resume()` to target and resume the suspended execution path.

```typescript
['nested-workflow', 'step-1']
```

## Sleep

Sleep methods can be used to pause execution at the workflow level, which sets the status to `waiting`. By comparison, `suspend()` pauses execution within a specific step and sets the status to `suspended`.

**Available methods:**

- [`.sleep()`](/reference/workflows/workflow-methods/sleep): Pause for a specified number of milliseconds
- [`.sleepUntil()`](/reference/workflows/workflow-methods/sleepUntil): Pause until a specific date

## Related

- [Control Flow](/docs/workflows/control-flow)
- [Human-in-the-loop](/docs/workflows/human-in-the-loop)
- [Snapshots](/docs/workflows/snapshots)
- [Time Travel](/docs/workflows/time-travel)

---

# Human-in-the-loop (HITL)

Some workflows need to pause for human input before continuing. When a workflow is [suspended](/docs/workflows/suspend-and-resume#pausing-a-workflow-with-suspend), it can return a message explaining why it paused and what’s needed to proceed. The workflow can then either [resume](#resuming-workflows-with-human-input) or [bail](#handling-human-rejection-with-bail) based on the input received. This approach works well for manual approvals, rejections, gated decisions, or any step that requires human oversight.

## Pausing workflows for human input

Human-in-the-loop input works much like [pausing a workflow](/docs/workflows/suspend-and-resume) using `suspend()`. The key difference is that when human input is required, you can return `suspend()` with a payload that provides context or guidance to the user on how to continue.

![Pausing a workflow with suspend()](/img/workflows/workflows-suspend.jpg)

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({
    userEmail: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean(),
  }),
  suspendSchema: z.object({
    reason: z.string(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    const { userEmail } = inputData
    const { approved } = resumeData ?? {}

    if (!approved) {
      return await suspend({
        reason: 'Human approval required.',

    return {
      output: `Email sent to ${userEmail}`,

  },

export const testWorkflow = createWorkflow({
  id: 'test-workflow',
  inputSchema: z.object({
    userEmail: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),

  .then(step1)
  .commit()
```

## Providing user feedback

When a workflow is suspended, you can access the payload returned by `suspend()` by identifying the suspended step and reading its `suspendPayload`.

```typescript
const workflow = mastra.getWorkflow('testWorkflow')
const run = await workflow.createRun()

const result = await run.start({
  inputData: {
    userEmail: 'alex@example.com',
  },

if (result.status === 'suspended') {
  const suspendStep = result.suspended[0]
  const suspendedPayload = result.steps[suspendStep[0]].suspendPayload

  console.log(suspendedPayload)

```

### Example output

The data returned by the step can include a reason and help the user understand what's needed to resume the workflow.

```typescript
const workflow = mastra.getWorkflow('testWorkflow')
const run = await workflow.createRun()

await run.start({
  inputData: {
    userEmail: 'alex@example.com',
  },

const handleResume = async () => {
  const result = await run.resume({
    step: 'step-1',
    resumeData: { approved: true },

```

### Handling human rejection with `bail()`

Use `bail()` to stop workflow execution at a step without triggering an error. This can be useful when a human explicitly rejects an action. The workflow completes with a `success` status, and any logic after the call to `bail()` is skipped.

```typescript
const step1 = createStep({
  execute: async ({ inputData, resumeData, suspend, bail }) => {
    const { userEmail } = inputData
    const { approved } = resumeData ?? {}

    if (approved === false) {
      return bail({
        reason: 'User rejected the request.',

    if (!approved) {
      return await suspend({
        reason: 'Human approval required.',

    return {
      message: `Email sent to ${userEmail}`,

  },

```

## Multi-turn human input

For workflows that require input at multiple stages, the suspend pattern remains the same. Each step defines a `resumeSchema`, and `suspendSchema` typically with a reason that can be used to provide user feedback.

```typescript
const step1 = createStep({...});

const step2 = createStep({
  id: "step-2",
  inputSchema: z.object({
    message: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  }),
  resumeSchema: z.object({
    approved: z.boolean()
  }),
  suspendSchema: z.object({
    reason: z.string()
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    const { message } = inputData;
    const { approved } = resumeData ?? {};

    if (!approved) {
      return await suspend({
        reason: "Human approval required."
      });

    return {
      output: `${message} - Deleted`
    };

});

export const testWorkflow = createWorkflow({
  id: "test-workflow",
  inputSchema: z.object({
    userEmail: z.string()
  }),
  outputSchema: z.object({
    output: z.string()


  .then(step1)
  .then(step2)
  .commit();
```

Each step must be resumed in sequence, with a separate call to `resume()` for each suspended step. This approach helps manage multi-step approvals with consistent UI feedback and clear input handling at each stage.

```typescript
const handleResume = async () => {
  const result = await run.resume({
    step: 'step-1',
    resumeData: { approved: true },

const handleDelete = async () => {
  const result = await run.resume({
    step: 'step-2',
    resumeData: { approved: true },

```

## Related

- [Control Flow](/docs/workflows/control-flow)
- [Suspend & Resume](/docs/workflows/suspend-and-resume)

---

# Workflow state

Workflow state lets you share values across steps without passing them through every step's inputSchema and outputSchema. This is useful for tracking progress, accumulating results, or sharing configuration across the entire workflow.

## State vs step input/output

It's important to understand the difference between **state** and **step input/output**:

- **Step input/output**: Data flows sequentially between steps. Each step receives the previous step's output as its `inputData`, and returns an output for the next step.
- **State**: A shared store that all steps can read and update via `state` and `setState`. State persists across the entire workflow run, including suspend/resume cycles.

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({ workflowInput: z.string() }),
  outputSchema: z.object({ step1Output: z.string() }),
  stateSchema: z.object({ sharedCounter: z.number() }),
  execute: async ({ inputData, state, setState }) => {
    // inputData comes from workflow input or previous step's output
    console.log(inputData.workflowInput)

    // state is the shared workflow state
    console.log(state.sharedCounter)

    // Update state for subsequent steps
    await setState({ sharedCounter: state.sharedCounter + 1 })

    // Return output that flows to next step's inputData
    return { step1Output: 'processed' }
  },

```

## Defining state schemas

Define a `stateSchema` on both the workflow and individual steps. The workflow's stateSchema is the master schema containing all possible state values, while each step declares only the subset it needs:

```typescript
const step1 = createStep({
  stateSchema: z.object({
    processedItems: z.array(z.string()),
  }),
  execute: async ({ inputData, state, setState }) => {
    const { message } = inputData
    const { processedItems } = state

    await setState({
      processedItems: [...processedItems, 'item-1', 'item-2'],

    return {
      formatted: message.toUpperCase(),

  },

const step2 = createStep({
  stateSchema: z.object({
    metadata: z.object({
      processedBy: z.string(),
    }),
  }),
  execute: async ({ inputData, state }) => {
    const { formatted } = inputData
    const { metadata } = state

    return {
      emphasized: `${formatted}!! ${metadata.processedBy}`,

  },

export const testWorkflow = createWorkflow({
  stateSchema: z.object({
    processedItems: z.array(z.string()),
    metadata: z.object({
      processedBy: z.string(),
    }),
  }),

  .then(step1)
  .then(step2)
  .commit()
```

## Setting initial state

Pass `initialState` when starting a workflow run to set the starting values:

```typescript
const run = await workflow.createRun()

const result = await run.start({
  inputData: { message: 'Hello' },
  initialState: {
    processedItems: [],
    metadata: { processedBy: 'system' },
  },

```

The `initialState` object should match the structure defined in the workflow's `stateSchema`.

## State persistence across suspend/resume

State automatically persists across suspend and resume cycles. When a workflow suspends and later resumes, all state updates made before the suspension are preserved:

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema: z.object({ count: z.number(), items: z.array(z.string()) }),
  resumeSchema: z.object({ proceed: z.boolean() }),
  execute: async ({ state, setState, suspend, resumeData }) => {
    if (!resumeData) {
      // First run: update state and suspend
      await setState({ count: state.count + 1, items: [...state.items, 'item-1'] })
      await suspend({})
      return {}

    // After resume: state changes are preserved (count: 1, items: ["item-1"])
    return {}
  },

```

## State in nested workflows

When using nested workflows, state propagates from parent to child. Changes made by the parent workflow before calling a nested workflow are visible to steps inside the nested workflow:

```typescript
const nestedStep = createStep({
  id: 'nested-step',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  stateSchema: z.object({ sharedValue: z.string() }),
  execute: async ({ state }) => {
    // Receives state modified by parent workflow
    return { result: `Received: ${state.sharedValue}` }
  },

const nestedWorkflow = createWorkflow({
  id: 'nested-workflow',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  stateSchema: z.object({ sharedValue: z.string() }),

  .then(nestedStep)
  .commit()

const parentStep = createStep({
  id: 'parent-step',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema: z.object({ sharedValue: z.string() }),
  execute: async ({ state, setState }) => {
    // Modify state before nested workflow runs
    await setState({ sharedValue: 'modified-by-parent' })
    return {}
  },

const parentWorkflow = createWorkflow({
  id: 'parent-workflow',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  stateSchema: z.object({ sharedValue: z.string() }),

  .then(parentStep)
  .then(nestedWorkflow)
  .commit()
```

## Related

- [Workflows overview](/docs/workflows/overview)
- [Suspend & Resume](/docs/workflows/suspend-and-resume)
- [Step Class](/reference/workflows/step)
- [Workflow Class](/reference/workflows/workflow)

---

# Snapshots

In Mastra, a snapshot is a serializable representation of a workflow's complete execution state at a specific point in time. Snapshots capture all the information needed to resume a workflow from exactly where it left off, including:

- The current state of each step in the workflow
- The outputs of completed steps
- The execution path taken through the workflow
- Any suspended steps and their metadata
- The remaining retry attempts for each step
- Additional contextual data needed to resume execution

Snapshots are automatically created and managed by Mastra whenever a workflow is suspended, and are persisted to the configured storage system.

## The role of snapshots in suspend and resume

Snapshots are the key mechanism enabling Mastra's suspend and resume capabilities. When a workflow step calls `await suspend()`:

1. The workflow execution is paused at that exact point
1. The current state of the workflow is captured as a snapshot
1. The snapshot is persisted to storage
1. The workflow step is marked as "suspended" with a status of `'suspended'`
1. Later, when `resume()` is called on the suspended step, the snapshot is retrieved
1. The workflow execution resumes from exactly where it left off

This mechanism provides a powerful way to implement human-in-the-loop workflows, handle rate limiting, wait for external resources, and implement complex branching workflows that may need to pause for extended periods.

## Snapshot anatomy

Each snapshot includes the `runId`, input, step status (`success`, `suspended`, etc.), any suspend and resume payloads, and the final output. This ensures full context is available when resuming execution.

```json

  "runId": "34904c14-e79e-4a12-9804-9655d4616c50",
  "status": "success",
  "value": {},
  "context": {
    "input": {
      "value": 100,
      "user": "Michael",
      "requiredApprovers": ["manager", "finance"]
    },
    "approval-step": {
      "payload": {
        "value": 100,
        "user": "Michael",
        "requiredApprovers": ["manager", "finance"]
      },
      "startedAt": 1758027577955,
      "status": "success",
      "suspendPayload": {
        "message": "Workflow suspended",
        "requestedBy": "Michael",
        "approvers": ["manager", "finance"]
      },
      "suspendedAt": 1758027578065,
      "resumePayload": { "confirm": true, "approver": "manager" },
      "resumedAt": 1758027578517,
      "output": { "value": 100, "approved": true },
      "endedAt": 1758027578634

  },
  "activePaths": [],
  "serializedStepGraph": [

      "type": "step",
      "step": {
        "id": "approval-step",
        "description": "Accepts a value, waits for confirmation"


  ],
  "suspendedPaths": {},
  "waitingPaths": {},
  "result": { "value": 100, "approved": true },
  "requestContext": {},
  "timestamp": 1758027578740

```

## How snapshots are saved and retrieved

Snapshots are saved to the configured storage system. By default, they use libSQL, but you can configure Upstash or PostgreSQL instead. Each snapshot is saved in the `workflow_snapshots` table and identified by the workflow's `runId`.

Read more about:

- [libSQL Storage](/reference/storage/libsql)
- [Upstash Storage](/reference/storage/upstash)
- [PostgreSQL Storage](/reference/storage/postgresql)

### Saving snapshots

When a workflow is suspended, Mastra automatically persists the workflow snapshot with these steps:

1. The `suspend()` function in a step execution triggers the snapshot process
1. The `WorkflowInstance.suspend()` method records the suspended machine
1. `persistWorkflowSnapshot()` is called to save the current state
1. The snapshot is serialized and stored in the configured database in the `workflow_snapshots` table
1. The storage record includes the workflow name, run ID, and the serialized snapshot

### Retrieving snapshots

When a workflow is resumed, Mastra retrieves the persisted snapshot with these steps:

1. The `resume()` method is called with a specific step ID
1. The snapshot is loaded from storage using `loadWorkflowSnapshot()`
1. The snapshot is parsed and prepared for resumption
1. The workflow execution is recreated with the snapshot state
1. The suspended step is resumed, and execution continues

```typescript
const storage = mastra.getStorage()
const workflowStore = await storage?.getStore('workflows')

const snapshot = await workflowStore?.loadWorkflowSnapshot({
  runId: '<run-id>',
  workflowName: '<workflow-id>',

console.log(snapshot)
```

## Storage options for snapshots

Snapshots are persisted using a `storage` instance configured on the `Mastra` class. This storage layer is shared across all workflows registered to that instance. Mastra supports multiple storage options for flexibility in different environments.

```typescript
export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: ':memory:',
  }),
  workflows: { approvalWorkflow },

```

- [libSQL Storage](/reference/storage/libsql)
- [PostgreSQL Storage](/reference/storage/postgresql)
- [MongoDB Storage](/reference/storage/mongodb)
- [Upstash Storage](/reference/storage/upstash)
- [Cloudflare D1](/reference/storage/cloudflare-d1)
- [DynamoDB](/reference/storage/dynamodb)
- [More storage providers](/docs/memory/storage)

## Best practices

1. **Ensure Serializability**: Any data that needs to be included in the snapshot must be serializable (convertible to JSON).
1. **Minimize Snapshot Size**: Avoid storing large data objects directly in the workflow context. Instead, store references to them (like IDs) and retrieve the data when needed.
1. **Handle Resume Context Carefully**: When resuming a workflow, carefully consider what context to provide. This will be merged with the existing snapshot data.
1. **Set Up Proper Monitoring**: Implement monitoring for suspended workflows, especially long-running ones, to ensure they're properly resumed.
1. **Consider Storage Scaling**: For applications with many suspended workflows, ensure your storage solution is appropriately scaled.

## Custom snapshot metadata

You can attach custom metadata when suspending a workflow by defining a `suspendSchema`. This metadata is stored in the snapshot and made available when the workflow is resumed.

```typescript
const approvalStep = createStep({
  id: 'approval-step',
  description: 'Accepts a value, waits for confirmation',
  inputSchema: z.object({
    value: z.number(),
    user: z.string(),
    requiredApprovers: z.array(z.string()),
  }),
  suspendSchema: z.object({
    message: z.string(),
    requestedBy: z.string(),
    approvers: z.array(z.string()),
  }),
  resumeSchema: z.object({
    confirm: z.boolean(),
    approver: z.string(),
  }),
  outputSchema: z.object({
    value: z.number(),
    approved: z.boolean(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    const { value, user, requiredApprovers } = inputData
    const { confirm } = resumeData ?? {}

    if (!confirm) {
      return await suspend({
        message: 'Workflow suspended',
        requestedBy: user,
        approvers: [...requiredApprovers],

    return {
      value,
      approved: confirm,

  },

```

### Providing resume data

Use `resumeData` to pass structured input when resuming a suspended step. It must match the step’s `resumeSchema`.

```typescript
const workflow = mastra.getWorkflow('approvalWorkflow')

const run = await workflow.createRun()

const result = await run.start({
  inputData: {
    value: 100,
    user: 'Michael',
    requiredApprovers: ['manager', 'finance'],
  },

if (result.status === 'suspended') {
  const resumedResult = await run.resume({
    step: 'approval-step',
    resumeData: {
      confirm: true,
      approver: 'manager',
    },

```

## Related

- [Control Flow](/docs/workflows/control-flow)
- [Suspend & Resume](/docs/workflows/suspend-and-resume)
- [Time Travel](/docs/workflows/time-travel)
- [Human-in-the-loop](/docs/workflows/human-in-the-loop)

---

# Error handling

Mastra workflows support error handling through result status checks after execution, retry policies for transient failures, and lifecycle callbacks for centralized error logging or alerting.

## Handling workflow results

When you run a workflow, the result object contains the status and any errors that occurred.

### Checking the result status

```typescript
const workflow = mastra.getWorkflow('myWorkflow')
const run = await workflow.createRun()
const result = await run.start({ inputData: { value: 'test' } })

switch (result.status) {
  case 'success':
    console.log('Workflow completed:', result.result)
    break
  case 'failed':
    console.error('Workflow failed:', result.error)
    break
  case 'suspended':
    console.log('Workflow suspended, waiting for resume')
    break

```

### Result object structure

The result object contains:

- `status` - The workflow status: `'success'`, `'failed'`, `'suspended'`, or `'tripwire'`
- `result` - The workflow output (when status is `'success'`)
- `error` - Error details (when status is `'failed'`)
- `steps` - Individual step results with their status and output

### Accessing step results

You can inspect individual step results to understand where a failure occurred:

```typescript
const result = await run.start({ inputData: { value: 'test' } })

if (result.status === 'failed') {
  // Find which step failed
  for (const [stepId, stepResult] of Object.entries(result.steps)) {
    if (stepResult.status === 'failed') {
      console.error(`Step ${stepId} failed:`, stepResult.error)


```

## Lifecycle callbacks

For scenarios where you need to handle workflow completion without awaiting the result—such as background jobs, fire-and-forget workflows, or centralized logging—you can use lifecycle callbacks.

### `onFinish`

Called when a workflow completes with any status (success, failed, suspended, or tripwire):

```typescript
const orderWorkflow = createWorkflow({
  id: 'order-processing',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.object({ orderId: z.string(), status: z.string() }),
  options: {
    onFinish: async result => {
      if (result.status === 'success') {
        await db.updateOrderStatus(result.result.orderId, result.status)

      await analytics.track('workflow_completed', {
        workflowId: 'order-processing',
        status: result.status,

    },
  },

```

The `onFinish` callback receives:

- `status` - The workflow status
- `result` - The workflow output (on success)
- `error` - Error details (on failure)
- `steps` - Individual step results
- `tripwire` - Tripwire info (if status is `'tripwire'`)
- `runId` - The unique identifier for this workflow run
- `workflowId` - The workflow's identifier
- `resourceId` - Optional resource identifier (if provided when creating the run)
- `getInitData<any>()` - Function that returns the initial input data
- `mastra` - The Mastra instance (if workflow is registered with Mastra)
- `requestContext` - Request-scoped context data
- `logger` - The workflow's logger instance
- `state` - The workflow's current state object

### `onError`

Called only when a workflow fails (status is `'failed'` or `'tripwire'`):

```typescript
const paymentWorkflow = createWorkflow({
  id: 'payment-processing',
  inputSchema: z.object({ amount: z.number() }),
  outputSchema: z.object({ transactionId: z.string() }),
  options: {
    onError: async errorInfo => {
      await alertService.notify({
        channel: 'payments-alerts',
        message: `Payment workflow failed: ${errorInfo.error?.message}`,

      await errorTracker.capture(errorInfo.error)
    },
  },

```

The `onError` callback receives:

- `status` - Either `'failed'` or `'tripwire'`
- `error` - Error details
- `steps` - Individual step results
- `tripwire` - Tripwire info (if status is `'tripwire'`)
- `runId` - The unique identifier for this workflow run
- `workflowId` - The workflow's identifier
- `resourceId` - Optional resource identifier (if provided when creating the run)
- `getInitData<any>()` - Function that returns the initial input data
- `mastra` - The Mastra instance (if workflow is registered with Mastra)
- `requestContext` - Request-scoped context data
- `logger` - The workflow's logger instance
- `state` - The workflow's current state object

### Using both callbacks

You can use both callbacks together:

```typescript
const pipelineWorkflow = createWorkflow({
  id: 'data-pipeline',
  inputSchema: z.object({ source: z.string() }),
  outputSchema: z.object({ recordsProcessed: z.number() }),
  options: {
    onFinish: async result => {
      // Always log completion
      await logger.info('Pipeline completed', { status: result.status })
    },
    onError: async errorInfo => {
      // Alert on failures
      await pagerDuty.alert('Data pipeline failed', errorInfo.error)
    },
  },

```

### Error handling in callbacks

Errors thrown inside callbacks are caught and logged—they won't affect the workflow result or cause it to fail. This ensures that callback issues don't break your workflows in production.

```typescript
options: {
  onFinish: async (result) => {
    // If this throws, it's logged but the workflow result is unchanged
    await externalService.notify(result);
  },

```

## Retries

Mastra has a retry mechanism for workflows or steps that fail due to transient errors, for example when steps interact with external services or resources that may be temporarily unavailable.

## Workflow-level using `retryConfig`

You can configure retries at the workflow level, which applies to all steps in the workflow:

```typescript
const step1 = createStep({...});

export const testWorkflow = createWorkflow({
  retryConfig: {
    attempts: 5,

  .then(step1)
  .commit();
```

## Step-level using `retries`

You can configure retries for individual steps using the `retries` property. This overrides the workflow-level retry configuration for that specific step:

```typescript
const step1 = createStep({
  execute: async () => {
    const response = await fetch('example-url')

    if (!response.ok) {
      throw new Error('Error')

    return {
      value: '',

  },
  retries: 3,

```

## Conditional branching

You can create alternative workflow paths based on the success or failure of previous steps using conditional logic:

```typescript prettier:false {14,18,29-32} title="src/mastra/workflows/test-workflow.ts"


const step1 = createStep({
  execute: async () => {
    try {
      const response = await fetch('example-url');

      if (!response.ok) {
        throw new Error('error');

      return {
        status: "ok"
      };
    } catch (error) {
      return {
        status: "error"
      };


});

const step2 = createStep({...});
const fallback = createStep({...});

export const testWorkflow = createWorkflow({})
  .then(step1)
  .branch([
    [async ({ inputData: { status } }) => status === "ok", step2],
    [async ({ inputData: { status } }) => status === "error", fallback]
  ])
  .commit();
```

## Check previous step results

Use `getStepResult()` to inspect a previous step’s results.

```typescript prettier:false {8} title="src/mastra/workflows/test-workflow.ts"


const step1 = createStep({...});

const step2 = createStep({
  execute: async ({ getStepResult }) => {
    const step1Result = getStepResult(step1);

    return {
      value: ""
    };

});
```

## Exiting early with `bail()`

Use `bail()` in a step to exit early with a successful result. This returns the provided payload as the step output and ends workflow execution.

```typescript prettier:false {7} title="src/mastra/workflows/test-workflow.ts"


const step1 = createStep({
  id: 'step1',
  execute: async ({ bail }) => {
    return bail({ result: 'bailed' });
  },
  inputSchema: z.object({ value: z.string() }),
  outputSchema: z.object({ result: z.string() }),
});

export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
```

## Exiting early with `Error()`

Use `throw new Error()` in a step to exit with an error.

```typescript prettier:false {7} title="src/mastra/workflows/test-workflow.ts"


const step1 = createStep({
  id: 'step1',
  execute: async () => {
    throw new Error('error');
  },
  inputSchema: z.object({ value: z.string() }),
  outputSchema: z.object({ result: z.string() }),
});

export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
```

\## Monitor errors with `stream()`

You can monitor workflows for errors using `stream`:

```typescript
const workflow = mastra.getWorkflow('testWorkflow')

const run = await workflow.createRun()

const stream = await run.stream({
  inputData: {
    value: 'initial data',
  },

for await (const chunk of stream.stream) {
  console.log(chunk.payload.output.stats)

```

## Related

- [Control Flow](/docs/workflows/control-flow)
- [Suspend & Resume](/docs/workflows/suspend-and-resume)
- [Time Travel](/docs/workflows/time-travel)
- [Human-in-the-loop](/docs/workflows/human-in-the-loop)

---

# Agents and tools

Workflow steps can call agents to leverage LLM reasoning or call tools for type-safe logic. You can either invoke them from within a step's `execute()` function or compose them directly as steps using `createStep()`.

## Using agents in workflows

Use agents in workflow steps when you need reasoning, language generation, or other LLM-based tasks. Call from a step's `execute()` function for more control over the agent call (e.g., track message history or return structured output). Compose agents as steps when you don't need to modify how the agent is invoked.

### Calling agents

Call agents inside a step's `execute()` function using `.generate()` or `.stream()`. This lets you modify the agent call and handle the response before passing it to the next step.

```typescript
const step1 = createStep({
  execute: async ({ inputData, mastra }) => {
    const { message } = inputData

    const testAgent = mastra.getAgent('testAgent')
    const response = await testAgent.generate(
      `Convert this message into bullet points: ${message}`,

        memory: {
          thread: 'user-123',
          resource: 'test-123',
        },
      },

    return {
      list: response.text,

  },

```

### Agents as steps

Compose an agent as a step using `createStep()` when you don't need to modify the agent call. Use `.map()` to transform the previous step's output into a `prompt` the agent can use.

![Agent as step](/img/workflows/workflows-agent-tools-agent-step.jpg)

```typescript
const step1 = createStep(testAgent)

export const testWorkflow = createWorkflow({})
  .map(async ({ inputData }) => {
    const { message } = inputData
    return {
      prompt: `Convert this message into bullet points: ${message}`,

  .then(step1)
  .then(step2)
  .commit()
```

> **Info:**
Visit [Input Data Mapping](/docs/workflows/control-flow#input-data-mapping) for more information.


When no `structuredOutput` option is provided, Mastra agents use a default schema that expects a `prompt` string as input and returns a `text` string as output:

```typescript

  inputSchema: {
    prompt: string
  },
  outputSchema: {
    text: string


```

### Agents with structured output

When you need the agent to return structured data instead of plain text, pass the `structuredOutput` option to `createStep()`. The step's output schema will match your provided schema, enabling type-safe chaining to subsequent steps.

```typescript
const articleSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),

const agentStep = createStep(testAgent, {
  structuredOutput: { schema: articleSchema },

// Next step receives typed structured data
const processStep = createStep({
  id: 'process',
  inputSchema: articleSchema, // Matches agent's outputSchema
  outputSchema: z.object({ tagCount: z.number() }),
  execute: async ({ inputData }) => ({
    tagCount: inputData.tags.length, // Fully typed
  }),

export const testWorkflow = createWorkflow({})
  .map(async ({ inputData }) => ({
    prompt: `Generate an article about: ${inputData.topic}`,

  .then(agentStep)
  .then(processStep)
  .commit()
```

The `structuredOutput.schema` option accepts any Zod schema. The agent will generate output conforming to this schema, and the step's `outputSchema` will be automatically set to match.

> **Info:**
Visit [Structured Output](/docs/agents/structured-output) for more options like error handling strategies and streaming with structured output.


## Using tools in workflows

Use tools in workflow steps to leverage existing tool logic. Call from a step's `.execute()` function when you need to prepare context or process responses. Compose tools as steps when you don't need to modify how the tool is used.

### Calling tools

Call tools inside a step's `.execute()` function. This gives you more control over the tool's input context, or process its response before passing it to the next step.

```typescript
const step2 = createStep({
  execute: async ({ inputData, requestContext }) => {
    const { text } = inputData

    const response = await testTool.execute({ text }, { requestContext })

    return {
      emphasized: response.emphasized,

  },

```

### Tools as steps

Compose a tool as a step using `createStep()` when the previous step's output matches the tool's input context. You can use `.map()` to transform the previous step's output if they don't.

![Tool as step](/img/workflows/workflows-agent-tools-tool-step.jpg)

```typescript
const step2 = createStep(testTool)

export const testWorkflow = createWorkflow({})
  .then(step1)
  .map(async ({ inputData }) => {
    const { formatted } = inputData
    return {
      text: formatted,

  .then(step2)
  .commit()
```

> **Info:**
Visit [Input Data Mapping](/docs/workflows/control-flow#input-data-mapping) for more information.


## Related

- [Using Agents](/docs/agents/overview)
- [MCP Overview](/docs/mcp/overview)

---

# Time travel

Time travel allows you to re-execute a workflow starting from any specific step, using either stored snapshot data or custom context you provide. This is useful for debugging failed workflows, testing individual steps with different inputs, or recovering from errors without re-running the entire workflow.
You can also use time travel to execute a workflow that hasn't been run yet, starting from any specific step.

## How time travel works

When you call `timeTravel()` on a workflow run:

1. The workflow loads the existing snapshot from storage (if available)
1. Step results before the target step are reconstructed from the snapshot or provided context
1. Execution begins from the specified step with the provided or reconstructed input data
1. The workflow continues to completion from that point forward

Time travel requires storage to be configured since it relies on persisted workflow snapshots.

## Basic usage

Use `run.timeTravel()` to re-execute a workflow from a specific step:

```typescript
const workflow = mastra.getWorkflow('myWorkflow')
const run = await workflow.createRun()

const result = await run.timeTravel({
  step: 'step2',
  inputData: { previousStepResult: 'custom value' },

```

## Specifying the target step

You can specify the target step using either a step reference or a step ID:

### Using step reference

```typescript
const result = await run.timeTravel({
  step: step2,
  inputData: { value: 10 },

```

### Using step ID

```typescript
const result = await run.timeTravel({
  step: 'step2',
  inputData: { value: 10 },

```

### Nested workflow steps

For steps inside nested workflows, use dot notation, an array of step IDS or an array of step references:

```typescript
// Using dot notation
const result = await run.timeTravel({
  step: 'nestedWorkflow.step3',
  inputData: { value: 10 },

// Using array of step IDs
const result = await run.timeTravel({
  step: ['nestedWorkflow', 'step3'],
  inputData: { value: 10 },

// Using array of step references
const result = await run.timeTravel({
  step: [nestedWorkflow, step3],
  inputData: { value: 10 },

```

## Providing execution context

You can provide context to specify the state of previous steps when time traveling:

```typescript
const result = await run.timeTravel({
  step: 'step2',
  context: {
    step1: {
      status: 'success',
      payload: { value: 0 },
      output: { step1Result: 2 },
      startedAt: Date.now(),
      endedAt: Date.now(),
    },
  },

```

The context object contains step results keyed by step ID. Each step result includes:

- `status`: The step's execution status (`success`, `failed`, `suspended`)
- `payload`: The input data passed to the step
- `output`: The step's output data (for successful steps)
- `startedAt`: Timestamp when the step started
- `endedAt`: Timestamp when the step ended (for completed steps)
- `suspendPayload`: Data passed to `suspend()` (for suspended steps)
- `resumePayload`: Data passed to `resume()` (for resumed steps)

## Re-running failed workflows

Time travel is particularly useful for debugging and recovering from failed workflow executions:

```typescript
const workflow = mastra.getWorkflow('myWorkflow')
const run = await workflow.createRun()

// Initial run fails at step2
const failedResult = await run.start({
  inputData: { value: 1 },

if (failedResult.status === 'failed') {
  // Re-run from step2 with corrected input
  const recoveredResult = await run.timeTravel({
    step: 'step2',
    inputData: { step1Result: 5 }, // Provide corrected input

```

## Time travel with suspended workflows

You can time travel to resume a suspended workflow from an earlier step:

```typescript
const run = await workflow.createRun()

// Start workflow - suspends at promptAgent step
const initialResult = await run.start({
  inputData: { input: 'test' },

if (initialResult.status === 'suspended') {
  // Time travel back to an earlier step with resume data
  const result = await run.timeTravel({
    step: 'getUserInput',
    resumeData: {
      userInput: 'corrected input',
    },

```

## Streaming time travel results

Use `timeTravelStream()` to receive streaming events during time travel execution:

```typescript
const run = await workflow.createRun()

const stream = run.timeTravelStream({
  step: 'step2',
  inputData: { value: 10 },

for await (const event of stream.fullStream) {
  console.log(event.type, event.payload)

const result = await stream.result

if (result.status === 'success') {
  console.log(result.result)

```

## Time travel with initial state

You can provide initial state when time traveling to set workflow-level state:

```typescript
const result = await run.timeTravel({
  step: 'step2',
  inputData: { value: 10 },
  initialState: {
    counter: 5,
    metadata: { source: 'time-travel' },
  },

```

## Error handling

Time travel throws errors in specific situations:

### Running workflow

You can't time travel to a workflow that's currently running:

```typescript
try {
  await run.timeTravel({ step: 'step2' })
} catch (error) {
  // "This workflow run is still running, cannot time travel"

```

### Invalid step ID

Time travel throws if the target step doesn't exist in the workflow:

```typescript
try {
  await run.timeTravel({ step: 'nonExistentStep' })
} catch (error) {
  // "Time travel target step not found in execution graph: 'nonExistentStep'. Verify the step id/path."

```

### Invalid input data

When `validateInputs` is enabled, time travel validates the input data against the step's schema:

```typescript
try {
  await run.timeTravel({
    step: 'step2',
    inputData: { invalidField: 'value' },

} catch (error) {
  // "Invalid inputData: \n- step1Result: Required"

```

## Nested workflows context

When time traveling into a nested workflow, you can provide context for both the parent and nested workflow steps:

```typescript
const result = await run.timeTravel({
  step: 'nestedWorkflow.step3',
  context: {
    step1: {
      status: 'success',
      payload: { value: 0 },
      output: { step1Result: 2 },
      startedAt: Date.now(),
      endedAt: Date.now(),
    },
    nestedWorkflow: {
      status: 'running',
      payload: { step1Result: 2 },
      startedAt: Date.now(),
    },
  },
  nestedStepsContext: {
    nestedWorkflow: {
      step2: {
        status: 'success',
        payload: { step1Result: 2 },
        output: { step2Result: 3 },
        startedAt: Date.now(),
        endedAt: Date.now(),
      },
    },
  },

```

## Use cases

### Debugging failed steps

Re-run a failed step with the same or modified input to diagnose issues:

```typescript
const result = await run.timeTravel({
  step: failedStepId,
  context: originalContext, // Use context from the failed run

```

### Testing step logic on new workflow run

Test individual steps with specific inputs on a new workflow run, useful for testing a step logic without starting workflow execution from the beginning.

```typescript
const result = await run.timeTravel({
  step: 'processData',
  inputData: { testData: 'specific test case' },

```

### Recovering from transient failures

Re-run steps that failed due to temporary issues (network errors, rate limits):

```typescript
// After fixing the external service issue
const result = await run.timeTravel({
  step: 'callExternalApi',
  inputData: savedInputData,

```

## Related

- [Snapshots](/docs/workflows/snapshots)
- [Suspend & Resume](/docs/workflows/suspend-and-resume)
- [Error Handling](/docs/workflows/error-handling)
- [Control Flow](/docs/workflows/control-flow)

---



# Memory

# Memory

Memory enables your agent to remember user messages, agent replies, and tool results across interactions, giving it the context it needs to stay consistent, maintain conversation flow, and produce better answers over time.

Mastra agents can be configured to store [message history](/docs/memory/message-history). Additionally, you can enable:

- [Observational Memory](../memory/observational-memory) (Recommended): Uses background agents to maintain a dense observation log that replaces raw message history as it grows. This keeps the context window small while preserving long-term memory.
- [Working memory](../memory/working-memory): Stores persistent, structured user data such as names, preferences, and goals.
- [Semantic recall](../memory/semantic-recall): Retrieves relevant past messages based on semantic meaning rather than exact keywords.

If the combined memory exceeds the model's context limit, [memory processors](/docs/memory/memory-processors) can filter, trim, or prioritize content so the most relevant information is preserved.

Memory results will be stored in one or more of your configured [storage providers](/docs/memory/storage).

## When to use memory

Use memory when your agent needs to maintain multi-turn conversations that reference prior exchanges, recall user preferences or facts from earlier in a session, or build context over time within a conversation thread. Skip memory for single-turn requests where each interaction is independent.

## Quickstart

Install the `@mastra/memory` package.

    ```bash npm2yarn
    npm install @mastra/memory@latest
    ```

Memory **requires** a storage provider to persist message history, including user messages and agent responses.

    For the purposes of this quickstart, use `@mastra/libsql`.

    ```bash npm2yarn
    npm install @mastra/libsql@latest
    ```

    :::note

    For more details on available providers and how storage works in Mastra, visit the [storage](/docs/memory/storage) documentation.

    :::

Add the storage provider to your main Mastra instance to enable memory across all configured agents.

    ```typescript {2,5-8} title="src/mastra/index.ts"
    import { Mastra } from '@mastra/core'
    import { LibSQLStore } from '@mastra/libsql'

    export const mastra = new Mastra({
      storage: new LibSQLStore({
        id: 'mastra-storage',
        url: ':memory:',
      }),

    ```

Create a `Memory` instance and pass it to the agent's `memory` option.

    ```typescript {2,7-11} title="src/mastra/agents/memory-agent.ts"
    import { Agent } from '@mastra/core/agent'
    import { Memory } from '@mastra/memory'

    export const memoryAgent = new Agent({
      id: 'memory-agent',
      name: 'Memory Agent',
      memory: new Memory({
        options: {
          lastMessages: 20,
        },
      }),

    ```

    :::note

    Visit [Memory Class](/reference/memory/memory-class) for a full list of configuration options.

    :::

Call your agent, for example in [Studio](/docs/studio/overview). Inside Studio, start a new chat with your agent and take a look at the right sidebar. It'll now display various memory-related information.

## Message history

Pass a `memory` object with `resource` and `thread` to track message history.

- `resource`: A stable identifier for the user or entity.
- `thread`: An ID that isolates a specific conversation or session.

```typescript
const response = await memoryAgent.generate('Remember my favorite color is blue.', {
  memory: {
    resource: 'user-123',
    thread: 'conversation-123',
  },

```

To recall information stored in memory, call the agent with the same `resource` and `thread` values used in the original conversation.

```typescript
const response = await memoryAgent.generate("What's my favorite color?", {
  memory: {
    resource: 'user-123',
    thread: 'conversation-123',
  },

// Response: "Your favorite color is blue."
```

> **Warning:**
Each thread has an owner (`resourceId`) that can't be changed after creation. Avoid reusing the same thread ID for threads with different owners, as this will cause errors when querying.


To list all threads for a resource, or retrieve a specific thread, [use the memory API directly](/docs/memory/message-history#querying).

## Observational Memory

For long-running conversations, raw message history grows until it fills the context window, degrading agent performance. [Observational Memory](../memory/observational-memory) solves this by running background agents that compress old messages into dense observations, keeping the context window small while preserving long-term memory.

```typescript
export const memoryAgent = new Agent({
  id: 'memory-agent',
  name: 'Memory Agent',
  memory: new Memory({
    options: {
      // highlight-next-line
      observationalMemory: true,
    },
  }),

```

> **Note:**
See [Observational Memory](../memory/observational-memory) for details on how observations and reflections work, and [the reference](/reference/memory/observational-memory) for all configuration options.


## Memory in multi-agent systems

When a [supervisor agent](/docs/agents/supervisor-agents) delegates to a subagent, Mastra isolates subagent memory automatically. No flag enables this as it happens on every delegation. Understanding how this scoping works lets you decide what stays private and what to share intentionally.

### How delegation scopes memory

Each delegation creates a fresh `threadId` and a deterministic `resourceId` for the subagent:

- **Thread ID**: Unique per delegation. The subagent starts with a clean message history every time it's called.
- **Resource ID**: Derived as `{parentResourceId}-{agentName}`. Because the resource ID is stable across delegations, resource-scoped memory persists between calls. A subagent remembers facts from previous delegations by the same user.
- **Memory instance**: If a subagent has no memory configured, it inherits the supervisor's `Memory` instance. If the subagent defines its own, that takes precedence.

The supervisor forwards its conversation context to the subagent so it has enough background to complete the task. Only the delegation prompt and the subagent's response are saved — the full parent conversation isn't stored. You can control which messages reach the subagent with the [`messageFilter`](/docs/agents/supervisor-agents#message-filtering) callback.

> **Note:**
Subagent resource IDs are always suffixed with the agent name (`{parentResourceId}-{agentName}`). Two different subagents under the same supervisor never share a resource ID through delegation.


To go beyond this default isolation, you can share memory between agents by passing matching identifiers when you call them directly.

### Share memory between agents

When you call agents directly (outside the delegation flow), memory sharing is controlled by two identifiers: `resourceId` and `threadId`. Agents that use the same values read and write to the same data. This is useful when agents collaborate on a shared context — for example, a researcher that saves notes and a writer that reads them.

**Resource-scoped sharing** is the most common pattern. [Working memory](../memory/working-memory) and [semantic recall](../memory/semantic-recall) default to `scope: 'resource'`. If two agents share a `resourceId`, they share observations, working memory, and embeddings — even across different threads:

```typescript
// Both agents share the same resource-scoped memory
await researcher.generate('Find information about quantum computing.', {
  memory: { resource: 'project-42', thread: 'research-session' },

await writer.generate('Write a summary from the research notes.', {
  memory: { resource: 'project-42', thread: 'writing-session' },

```

Because both calls use `resource: 'project-42'`, the writer can access the researcher's observations, working memory, and semantic embeddings. Each agent still has its own thread, so message histories stay separate.

**Thread-scoped sharing** gives tighter coupling. [Observational Memory](../memory/observational-memory) uses `scope: 'thread'` by default. If two agents use the same `resource` _and_ `thread`, they share the full message history. Each agent sees every message the other has written. This is useful when agents need to build on each other's exact outputs.

## Observability

Enable [Tracing](/docs/observability/tracing/overview) to monitor and debug memory in action. Traces show you exactly which messages and observations the agent included in its context for each request, helping you understand agent behavior and verify that memory retrieval is working as expected.

Open [Studio](/docs/studio/overview) and select the **Observability** tab in the sidebar. Open the trace of a recent agent request, then look for spans of LLMs calls.

## Switch memory per request

Use [`RequestContext`](/docs/server/request-context) to access request-specific values. This lets you conditionally select different memory or storage configurations based on the context of the request.

```typescript
export type UserTier = {
  'user-tier': 'enterprise' | 'pro'

const premiumMemory = new Memory()
const standardMemory = new Memory()

export const memoryAgent = new Agent({
  id: 'memory-agent',
  name: 'Memory Agent',
  memory: ({ requestContext }) => {
    const userTier = requestContext.get('user-tier') as UserTier['user-tier']

    return userTier === 'enterprise' ? premiumMemory : standardMemory
  },

```

> **Note:**
Visit [Request Context](/docs/server/request-context) for more information.


## Related

- [`Memory` reference](/reference/memory/memory-class)
- [Tracing](/docs/observability/tracing/overview)
- [Request Context](/docs/server/request-context)

---

# Working Memory

While [message history](/docs/memory/message-history) and [semantic recall](./semantic-recall) help agents remember conversations, working memory allows them to maintain persistent information about users across interactions.

Think of it as the agent's active thoughts or scratchpad – the key information they keep available about the user or task. It's similar to how a person would naturally remember someone's name, preferences, or important details during a conversation.

This is useful for maintaining ongoing state that's always relevant and should always be available to the agent.

Working memory can persist at two different scopes:

- **Resource-scoped** (default): Memory persists across all conversation threads for the same user
- **Thread-scoped**: Memory is isolated per conversation thread

**Important:** Switching between scopes means the agent won't see memory from the other scope - thread-scoped memory is completely separate from resource-scoped memory.

## Quickstart

Here's a minimal example of setting up an agent with working memory:

```typescript
// Create agent with working memory enabled
const agent = new Agent({
  id: 'personal-assistant',
  name: 'PersonalAssistant',
  instructions: 'You are a helpful personal assistant.',
  model: 'openai/gpt-5.4',
  memory: new Memory({
    options: {
      workingMemory: {
        enabled: true,
      },
    },
  }),

```

## How it works

Working memory is a block of Markdown text that the agent is able to update over time to store continuously relevant information:

## Memory persistence scopes

Working memory can operate in two different scopes, allowing you to choose how memory persists across conversations:

### Resource-Scoped Memory (Default)

By default, working memory persists across all conversation threads for the same user (resourceId), enabling persistent user memory:

```typescript
const memory = new Memory({
  storage,
  options: {
    workingMemory: {
      enabled: true,
      scope: 'resource', // Memory persists across all user threads
      template: `# User Profile
- **Name**:
- **Location**:
- **Interests**:
- **Preferences**:
- **Long-term Goals**:
`,
    },
  },

```

**Use cases:**

- Personal assistants that remember user preferences
- Customer service bots that maintain customer context
- Educational applications that track student progress

### Usage with Agents

When using resource-scoped memory, make sure to pass the `resource` parameter in the memory options:

```typescript
// Resource-scoped memory requires resource
const response = await agent.generate('Hello!', {
  memory: {
    thread: 'conversation-123',
    resource: 'user-alice-456', // Same user across different threads
  },

```

### Thread-Scoped Memory

Thread-scoped memory isolates working memory to individual conversation threads. Each thread maintains its own isolated memory:

```typescript
const memory = new Memory({
  storage,
  options: {
    workingMemory: {
      enabled: true,
      scope: 'thread', // Memory is isolated per thread
      template: `# User Profile
- **Name**:
- **Interests**:
- **Current Goal**:
`,
    },
  },

```

**Use cases:**

- Different conversations about separate topics
- Temporary or session-specific information
- Workflows where each thread needs working memory but threads are ephemeral and not related to each other

## Storage adapter support

Resource-scoped working memory requires specific storage adapters that support the `mastra_resources` table:

### Supported Storage Adapters

- **libSQL** (`@mastra/libsql`)
- **PostgreSQL** (`@mastra/pg`)
- **Upstash** (`@mastra/upstash`)
- **MongoDB** (`@mastra/mongodb`)

## Custom templates

Templates guide the agent on what information to track and update in working memory. While a default template is used if none is provided, you'll typically want to define a custom template tailored to your agent's specific use case to ensure it remembers the most relevant information.

Here's an example of a custom template. In this example the agent will store the users name, location, timezone, etc as soon as the user sends a message containing any of the info:

```typescript
const memory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: `
# User Profile

## Personal info

- Name:
- Location:
- Timezone:

## Preferences

- Communication Style: [e.g., Formal, Casual]
- Project Goal:
- Key Deadlines:
  - [Deadline 1]: [Date]
  - [Deadline 2]: [Date]

## Session state

- Last Task Discussed:
- Open Questions:
  - [Question 1]
  - [Question 2]
`,
    },
  },

```

## Designing effective templates

A well-structured template keeps the information straightforward for the agent to parse and update. Treat the
template as a short form that you want the assistant to keep up to date.

- **Short, focused labels.** Avoid paragraphs or very long headings. Keep labels brief (for example
  `## Personal Info` or `- Name:`) so updates are readable and less likely to be truncated.
- **Use consistent casing.** Inconsistent capitalization (`Timezone:` vs `timezone:`) can cause messy
  updates. Stick to Title Case or lower case for headings and bullet labels.
- **Keep placeholder text minimal.** Use hints such as `[e.g., Formal]` or `[Date]` to help the LLM

- **Abbreviate very long values.** If you only need a short form, include guidance like
  `- Name: [First name or nickname]` or `- Address (short):` rather than the full legal text.
- **Mention update rules in `instructions`.** You can instruct how and when to fill or clear parts of
  the template directly in the agent's `instructions` field.

### Alternative Template Styles

Use a shorter single block if you only need a few items:

```typescript
const basicMemory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: `User Facts:\n- Name:\n- Favorite Color:\n- Current Topic:`,
    },
  },

```

You can also store the key facts in a short paragraph format if you prefer a more narrative style:

```typescript
const paragraphMemory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      template: `Important Details:\n\nKeep a short paragraph capturing the user's important facts (name, main goal, current task).`,
    },
  },

```

## Structured working memory

Working memory can also be defined using a structured schema instead of a Markdown template. This allows you to specify the exact fields and types that should be tracked, using a [Zod](https://zod.dev/) schema. When using a schema, the agent will see and update working memory as a JSON object matching your schema.

**Important:** You must specify either `template` or `schema`, but not both.

### Example: Schema-Based Working Memory

```typescript
const userProfileSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z
    .object({
      communicationStyle: z.string().optional(),
      projectGoal: z.string().optional(),

    .optional(),

const memory = new Memory({
  options: {
    workingMemory: {
      enabled: true,
      schema: userProfileSchema,
      // template: ... (do not set)
    },
  },

```

When a schema is provided, the agent receives the working memory as a JSON object. For example:

```json

  "name": "Sam",
  "location": "Berlin",
  "timezone": "CET",
  "preferences": {
    "communicationStyle": "Formal",
    "projectGoal": "Launch MVP",
    "deadlines": ["2025-07-01"]


```

### Merge Semantics for Schema-Based Memory

Schema-based working memory uses **merge semantics**, meaning the agent only needs to include fields it wants to add or update. Existing fields are preserved automatically.

- **Object fields are deep merged:** Only provided fields are updated; others remain unchanged
- **Set a field to `null` to delete it:** This explicitly removes the field from memory
- **Arrays are replaced entirely:** When an array field is provided, it replaces the existing array (arrays aren't merged element-by-element)

## Choosing between template and schema

- Use a **template** (Markdown) if you want the agent to maintain memory as a free-form text block, such as a user profile or scratchpad. Templates use **replace semantics** — the agent must provide the complete memory content on each update.
- Use a **schema** if you need structured, type-safe data that can be validated and programmatically accessed as JSON. The `workingMemory.schema` field accepts any `PublicSchema`-compatible schema (including Zod v3, Zod v4, JSON Schema, or already-standard schemas). Schemas use **merge semantics** — the agent only provides fields to update, and existing fields are preserved.
- Only one mode can be active at a time: setting both `template` and `schema` isn't supported.

## Example: Multi-step retention

Below is a simplified view of how the `User Profile` template updates across a short user
conversation:

```nohighlight
# User Profile

## Personal info

- Name:
- Location:
- Timezone:

--- After user says "My name is **Sam** and I'm from **Berlin**" ---

# User Profile
- Name: Sam
- Location: Berlin
- Timezone:

--- After user adds "By the way I'm normally in **CET**" ---

# User Profile
- Name: Sam
- Location: Berlin
- Timezone: CET
```

The agent can now refer to `Sam` or `Berlin` in later responses without requesting the information
again because it has been stored in working memory.

If your agent isn't properly updating working memory when you expect it to, you can add system
instructions on _how_ and _when_ to use this template in your agent's `instructions` setting.

## Setting initial working memory

While agents typically update working memory through the `updateWorkingMemory` tool, you can also set initial working memory programmatically when creating or updating threads. This is useful for injecting user data (like their name, preferences, or other info) that you want available to the agent without passing it in every request.

### Setting Working Memory via Thread Metadata

When creating a thread, you can provide initial working memory through the metadata's `workingMemory` key:

```typescript
// Create a thread with initial working memory
const thread = await memory.createThread({
  threadId: 'thread-123',
  resourceId: 'user-456',
  title: 'Medical Consultation',
  metadata: {
    workingMemory: `# Patient Profile
- Name: John Doe
- Blood Type: O+
- Allergies: Penicillin
- Current Medications: None
- Medical History: Hypertension (controlled)
`,
  },

// The agent will now have access to this information in all messages
await agent.generate("What's my blood type?", {
  memory: {
    thread: thread.id,
    resource: 'user-456',
  },

// Response: "Your blood type is O+."
```

### Updating Working Memory Programmatically

You can also update an existing thread's working memory:

```typescript
// Update thread metadata to add/modify working memory
await memory.updateThread({
  id: 'thread-123',
  title: thread.title,
  metadata: {
    ...thread.metadata,
    workingMemory: `# Patient Profile
- Name: John Doe
- Blood Type: O+
- Allergies: Penicillin, Ibuprofen  // Updated
- Current Medications: Lisinopril 10mg daily  // Added
- Medical History: Hypertension (controlled)
`,
  },

```

### Direct Memory Update

Alternatively, use the `updateWorkingMemory` method directly:

```typescript
await memory.updateWorkingMemory({
  threadId: 'thread-123',
  resourceId: 'user-456', // Required for resource-scoped memory
  workingMemory: 'Updated memory content...',

```

## Read-only working memory

In some scenarios, you may want an agent to have access to working memory data without the ability to modify it. This is useful for:

- **Routing agents** that need context but shouldn't update user profiles
- **Sub agents** in a multi-agent system that should reference but not own the memory

To enable read-only mode, set `readOnly: true` in the memory options:

```typescript
const response = await agent.generate('What do you know about me?', {
  memory: {
    thread: 'conversation-123',
    resource: 'user-alice-456',
    options: {
      readOnly: true, // Working memory is provided but cannot be updated
    },
  },

```

## Examples

- [Working memory with template](https://github.com/mastra-ai/mastra/tree/main/examples/memory-with-template)
- [Working memory with schema](https://github.com/mastra-ai/mastra/tree/main/examples/memory-with-schema)
- [Per-resource working memory](https://github.com/mastra-ai/mastra/tree/main/examples/memory-per-resource-example) - Complete example showing resource-scoped memory persistence

---

# Semantic recall

If you ask your friend what they did last weekend, they will search in their memory for events associated with "last weekend" and then tell you what they did. That's sort of like how semantic recall works in Mastra.

:::tip[Watch 📹]

What semantic recall is, how it works, and how to configure it in Mastra → [YouTube (5 minutes)](https://youtu.be/UVZtK8cK8xQ)


## How semantic recall works

Semantic recall is RAG-based search that helps agents maintain context across longer interactions when messages are no longer within [recent message history](./message-history).

It uses vector embeddings of messages for similarity search, integrates with various vector stores, and has configurable context windows around retrieved messages.

![Diagram showing Mastra Memory semantic recall](/img/semantic-recall.png)

When it's enabled, new messages are used to query a vector DB for semantically similar messages.

After getting a response from the LLM, all new messages (user, assistant, and tool calls/results) are inserted into the vector DB to be recalled in later interactions.

## Quickstart

Semantic recall is disabled by default. To enable it, set `semanticRecall: true` in `options` and provide a `vector` store and `embedder`:

```typescript
const agent = new Agent({
  id: 'support-agent',
  name: 'SupportAgent',
  instructions: 'You are a helpful support agent.',
  model: 'openai/gpt-5.4',
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'agent-storage',
      url: 'file:./local.db',
    }),
    vector: new LibSQLVector({
      id: 'agent-vector',
      url: 'file:./local.db',
    }),
    embedder: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
    options: {
      semanticRecall: true,
    },
  }),

```

## Using the `recall()` method

While `listMessages` retrieves messages by thread ID with basic pagination, [`recall()`](/reference/memory/recall) adds support for **semantic search**. When you need to find messages by meaning rather than recency, use `recall()` with a `vectorSearchString`:

```typescript
const memory = await agent.getMemory()

// Basic recall - similar to listMessages
const { messages } = await memory!.recall({
  threadId: 'thread-123',
  perPage: 50,

// Semantic recall - find messages by meaning
const { messages: relevantMessages } = await memory!.recall({
  threadId: 'thread-123',
  vectorSearchString: 'What did we discuss about the project deadline?',
  threadConfig: {
    semanticRecall: true,
  },

```

## Storage configuration

Semantic recall relies on a [storage and vector db](/reference/memory/memory-class) to store messages and their embeddings.

```ts
const agent = new Agent({
  memory: new Memory({
    // this is the default storage db if omitted
    storage: new LibSQLStore({
      id: 'agent-storage',
      url: 'file:./local.db',
    }),
    // this is the default vector db if omitted
    vector: new LibSQLVector({
      id: 'agent-vector',
      url: 'file:./local.db',
    }),
    options: {
      semanticRecall: true,
    },
  }),

```

Each vector store page below includes installation instructions, configuration parameters, and usage examples:

- [Astra](/reference/vectors/astra)
- [Chroma](/reference/vectors/chroma)
- [Cloudflare Vectorize](/reference/vectors/vectorize)
- [Convex](/reference/vectors/convex)
- [Couchbase](/reference/vectors/couchbase)
- [DuckDB](/reference/vectors/duckdb)
- [Elasticsearch](/reference/vectors/elasticsearch)
- [LanceDB](/reference/vectors/lance)
- [libSQL](/reference/vectors/libsql)
- [MongoDB](/reference/vectors/mongodb)
- [OpenSearch](/reference/vectors/opensearch)
- [Pinecone](/reference/vectors/pinecone)
- [PostgreSQL](/reference/vectors/pg)
- [Qdrant](/reference/vectors/qdrant)
- [S3 Vectors](/reference/vectors/s3vectors)
- [Turbopuffer](/reference/vectors/turbopuffer)
- [Upstash](/reference/vectors/upstash)

## Recall configuration

The three main parameters that control semantic recall behavior are:

1. **topK**: How many semantically similar messages to retrieve
1. **messageRange**: How much surrounding context to include with each match
1. **scope**: Whether to search within the current thread or across all threads owned by a resource (the default is resource scope).

```typescript
const agent = new Agent({
  memory: new Memory({
    options: {
      semanticRecall: {
        topK: 3, // Retrieve 3 most similar messages
        messageRange: 2, // Include 2 messages before and after each match
        scope: 'resource', // Search across all threads for this user (default setting if omitted)
      },
    },
  }),

```

## Embedder configuration

Semantic recall relies on an [embedding model](/reference/memory/memory-class) to convert messages into embeddings. Mastra supports embedding models through the model router using `provider/model` strings, or you can use any [embedding model](https://sdk.vercel.ai/docs/ai-sdk-core/embeddings) compatible with the AI SDK.

### Using the Model Router (Recommended)

The simplest way is to use a `provider/model` string with autocomplete support:

```ts
const agent = new Agent({
  memory: new Memory({
    embedder: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
    options: {
      semanticRecall: true,
    },
  }),

```

Supported embedding models:

- **OpenAI**: `text-embedding-3-small`, `text-embedding-3-large`, `text-embedding-ada-002`
- **Google**: `gemini-embedding-001`
- **OpenRouter**: Access embedding models from various providers

```ts
const agent = new Agent({
  memory: new Memory({
    embedder: new ModelRouterEmbeddingModel({
      providerId: 'openrouter',
      modelId: 'openai/text-embedding-3-small',
    }),
  }),

```

The model router automatically handles API key detection from environment variables (`OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`).

### Using AI SDK Packages

You can also use AI SDK embedding models directly:

```ts
const agent = new Agent({
  memory: new Memory({
    embedder: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  }),

```

### Using FastEmbed (local)

To use FastEmbed (a local embedding model), install `@mastra/fastembed`:

```bash npm2yarn
npm install @mastra/fastembed@latest
```

Then configure it in your memory:

```ts
const agent = new Agent({
  memory: new Memory({
    embedder: fastembed,
  }),

```

## PostgreSQL index optimization

When using PostgreSQL as your vector store, you can optimize semantic recall performance by configuring the vector index. This is particularly important for large-scale deployments with thousands of messages.

PostgreSQL supports both IVFFlat and HNSW indexes. By default, Mastra creates an IVFFlat index, but HNSW indexes typically provide better performance, especially with OpenAI embeddings which use inner product distance.

```typescript
const agent = new Agent({
  memory: new Memory({
    storage: new PgStore({
      id: 'agent-storage',
      connectionString: process.env.DATABASE_URL,
    }),
    vector: new PgVector({
      id: 'agent-vector',
      connectionString: process.env.DATABASE_URL,
    }),
    options: {
      semanticRecall: {
        topK: 5,
        messageRange: 2,
        indexConfig: {
          type: 'hnsw', // Use HNSW for better performance
          metric: 'dotproduct', // Best for OpenAI embeddings
          m: 16, // Number of bi-directional links (default: 16)
          efConstruction: 64, // Size of candidate list during construction (default: 64)
        },
      },
    },
  }),

```

For detailed information about index configuration options and performance tuning, see the [PgVector configuration guide](/reference/vectors/pg#index-configuration-guide).

## Disable semantic recall

Semantic recall is disabled by default (`semanticRecall: false`). Each call adds latency because new messages are converted into embeddings and used to query a vector database before the LLM receives them.

Keep semantic recall disabled when:

- Message history provides sufficient context for the current conversation.
- You're building performance-sensitive applications, like realtime two-way audio, where embedding and vector query latency is noticeable.

## Viewing recalled messages

When tracing is enabled, any messages retrieved via semantic recall will appear in the agent's trace output, alongside recent message history (if configured).

---

# Observational Memory

**Added in:** `@mastra/memory@1.1.0`

Observational Memory (OM) is Mastra's memory system for long-context agentic memory. Two background agents — an **Observer** and a **Reflector** — watch your agent's conversations and maintain a dense observation log that replaces raw message history as it grows.

## Quickstart

Enable `observationalMemory` in the memory options when creating your agent:

```typescript
export const agent = new Agent({
  name: 'my-agent',
  instructions: 'You are a helpful assistant.',
  model: 'openai/gpt-5-mini',
  memory: new Memory({
    options: {
      // highlight-next-line
      observationalMemory: true,
    },
  }),

```

That's it. The agent now has humanlike long-term memory that persists across conversations. Setting `observationalMemory: true` uses `google/gemini-2.5-flash` by default. To use a different model or customize thresholds, pass a config object instead:

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'deepseek/deepseek-reasoner',
    },
  },

```

See [configuration options](/reference/memory/observational-memory) for full API details.

> **Note:**
OM currently only supports `@mastra/pg`, `@mastra/libsql`, and `@mastra/mongodb` storage adapters.
It uses background agents for managing memory. When using `observationalMemory: true`, the default model is `google/gemini-2.5-flash`. When passing a config object, a `model` must be explicitly set.


## Benefits

- **Prompt caching**: OM's context is stable and observations append over time rather than being dynamically retrieved each turn. This keeps the prompt prefix cacheable, which reduces costs.
- **Compression**: Raw message history and tool results get compressed into a dense observation log. Smaller context means faster responses and longer coherent conversations.
- **Zero context rot**: The agent sees relevant information instead of noisy tool calls and irrelevant tokens, so the agent stays on task over long sessions.

## How it works

You don't remember every word of every conversation you've ever had. You observe what happened subconsciously, then your brain reflects — reorganizing, combining, and condensing into long-term memory. OM works the same way.

Every time an agent responds, it sees a context window containing its system prompt, recent message history, and any injected context. The context window is finite; even models with large token limits perform worse when the window is full. This causes two problems:

- **Context rot**: the more raw message history an agent carries, the worse it performs.
- **Context waste**: most of that history contains tokens no longer needed to keep the agent on task.

OM solves both problems by compressing old context into dense observations.

### Observations

When message history tokens exceed a threshold (default: 30,000), the Observer creates observations which are concise notes about what happened:

OM uses fast local token estimation for this thresholding work. Text is estimated with `tokenx`, while image parts use provider-aware heuristics so multimodal conversations still trigger observation at the right time. The same applies to image-like `file` parts when a transport normalizes an uploaded image as a file instead of an image part. For example, OpenAI image detail settings can materially change when OM decides to observe.

The Observer can also see attachments in the history it reviews. OM keeps readable placeholders like `[Image #1: reference-board.png]` or `[File #1: floorplan.pdf]` in the transcript for readability, and forwards the actual attachment parts alongside the text. Image-like `file` parts are upgraded to image inputs for the Observer when possible, while non-image attachments are forwarded as file parts with normalized token counting. This applies to both normal thread observation and batched resource-scope observation.

```md
Date: 2026-01-15

- 🔴 12:10 User is building a Next.js app with Supabase auth, due in 1 week (meaning January 22nd 2026)
  - 🔴 12:10 App uses server components with client-side hydration
  - 🟡 12:12 User asked about middleware configuration for protected routes
  - 🔴 12:15 User stated the app name is "Acme Dashboard"
```

The compression is typically 5–40×. The Observer also tracks a **current task** and **suggested response** so the agent picks up where it left off.

If you enable `observation.threadTitle`, the Observer can also suggest a short thread title when the conversation topic meaningfully changes. Thread title generation is opt-in and updates the thread metadata, so apps like Mastra Code can show the latest title in thread lists and status UI.

Example: An agent using Playwright MCP might see 50,000+ tokens per page snapshot. With OM, the Observer watches the interaction and creates a few hundred tokens of observations about what was on the page and what actions were taken. The agent stays on task without carrying every raw snapshot.

### Reflections

When observations exceed their threshold (default: 40,000 tokens), the Reflector condenses them, combines related items, and reflects on patterns.

The result is a three-tier system:

1. **Recent messages**: Exact conversation history for the current task
1. **Observations**: A log of what the Observer has seen
1. **Reflections**: Condensed observations when memory becomes too long

### Retrieval mode (experimental)

> **Note:**
Retrieval mode is experimental. The API may change in future releases.


Normal OM compresses messages into observations, which is great for staying on task, but the original wording is gone. Retrieval mode fixes this by keeping each observation group linked to the raw messages that produced it. When the agent needs exact wording, tool output, or chronology that the summary compressed away, it can call a `recall` tool to page through the source messages.

#### Browsing only

Set `retrieval: true` to enable the recall tool for browsing raw messages. No vector store needed. By default, the recall tool can browse across all threads for the current resource.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      retrieval: true,
    },
  },

```

#### With semantic search

Set `retrieval: { vector: true }` to also enable semantic search. This reuses the vector store and embedder already configured on your Memory instance:

```typescript
const memory = new Memory({
  storage,
  vector: myVectorStore,
  embedder: myEmbedder,
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      retrieval: { vector: true },
    },
  },

```

When vector search is configured, new observation groups are automatically indexed at buffer time and during synchronous observation (fire-and-forget, non-blocking). Semantic search returns observation-group matches with their raw source message ID ranges, so the recall tool can show the summarized memory alongside where it came from.

#### Restricting to the current thread

By default, the recall tool scope is `'resource'` — the agent can list threads, browse other threads, and search across all conversations. Set `scope: 'thread'` to restrict the agent to only the current thread:

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      retrieval: { vector: true, scope: 'thread' },
    },
  },

```

#### What retrieval enables

With retrieval mode enabled, OM:

- Stores a `range` (e.g. `startId:endId`) on each observation group pointing to the messages it was derived from
- Keeps range metadata visible in the agent's context so the agent knows which observations map to which messages
- Registers a `recall` tool the agent can call to:
  - Page through the raw messages behind any observation group range
  - Search by semantic similarity (`mode: "search"` with a `query` string) — requires `vector: true`
  - List all threads (`mode: "threads"`), browse other threads (`threadId`), and search across all threads (default `scope: 'resource'`)
  - When `scope: 'thread'`: restrict browsing and search to the current thread only

See the [recall tool reference](/reference/memory/observational-memory#recall-tool) for the full API (detail levels, part indexing, pagination, cross-thread browsing, and token limiting).

## Studio

To see how it works in practice, open [Studio](/docs/studio/overview) and navigate to an agent with OM enabled. The **Memory** tab displays:

- **Token progress bars**: Current token counts for messages and observations, showing how close each is to its threshold. Hover over the info icon to see the model and threshold for the Observer and Reflector.
- **Active observations**: The current observation log, rendered inline. When previous observation or reflection records exist, expand "Previous observations" to browse them.
- **Background processing**: During a conversation, buffered observation chunks and reflection status appear as the agent processes in the background.

The progress bars update live while the agent is observing or reflecting, showing elapsed time and a status badge.

## Models

The Observer and Reflector run in the background. Any model that works with Mastra's [model routing](/models) (`provider/model`) can be used. When using `observationalMemory: true`, the default model is `google/gemini-2.5-flash`. When passing a config object, a `model` must be explicitly set.

Generally speaking, we recommend using a model that has a large context window (128K+ tokens) and is fast enough to run in the background without slowing down your actions.

If you're unsure which model to use, start with the default `google/gemini-2.5-flash`. We've also successfully tested `openai/gpt-5-mini`, `anthropic/claude-haiku-4-5`, `deepseek/deepseek-reasoner`, `qwen3`, and `glm-4.7`.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'deepseek/deepseek-reasoner',
    },
  },

```

See [model configuration](/reference/memory/observational-memory#custom-model) for using different models per agent.

### Token-tiered model selection

**Added in:** `@mastra/memory@1.10.0`

You can use `ModelByInputTokens` to specify different Observer or Reflector models based on input token count. OM selects the matching model tier at runtime from the configured `upTo` thresholds.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      observation: {
        model: new ModelByInputTokens({
          upTo: {
            // Faster, cheaper models for smaller inputs; stronger models for larger contexts
            5_000: 'openrouter/mistralai/ministral-8b-2512',
            20_000: 'openrouter/mistralai/mistral-small-2603',
            40_000: 'openai/gpt-5.4-mini',
            1_000_000: 'google/gemini-3.1-flash-lite-preview',
          },
        }),
      },
      reflection: {
        model: new ModelByInputTokens({
          upTo: {
            20_000: 'openai/gpt-5.4-mini',
            100_000: 'google/gemini-2.5-flash',
          },
        }),
      },
    },
  },

```

The `upTo` keys are inclusive upper bounds. OM computes the actual input token count for the Observer or Reflector call, resolves the matching tier directly, and uses that concrete model for the run.

If the input exceeds the largest configured threshold, an error is thrown — ensure your thresholds cover the full range of possible input sizes, or use a model with a sufficiently large context window at the highest tier.

## Scopes

### Thread scope (default)

Each thread has its own observations. This scope is well tested and works well as a general purpose memory system, especially for long horizon agentic use-cases.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      scope: 'thread',
    },
  },

```

Thread scope requires a valid `threadId` to be provided when calling the agent. If `threadId` is missing, Observational Memory throws an error. This prevents multiple threads from silently sharing a single observation record, which can cause database deadlocks.

### Resource scope (experimental)

Observations are shared across all threads for a resource (typically a user). Enables cross-conversation memory.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      scope: 'resource',
    },
  },

```

Resource scope works, however it's marked as experimental for now until we prove task adherence/continuity across multiple ongoing simultaneous threads.
As of today, you may need to tweak your system prompt to prevent one thread from continuing the work that another had already started (but hadn't finished).

This is because in resource scope, each thread is a perspective on _all_ threads for the resource.

For your use-case this may not be a problem, so your mileage may vary.

> **Warning:**
In resource scope, unobserved messages across _all_ threads are processed together. For users with many existing threads, this can be slow. Use thread scope for existing apps.


## Token budgets

OM uses token thresholds to decide when to observe and reflect. See [token budget configuration](/reference/memory/observational-memory#shared-token-budget) for details.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      observation: {
        // when to run the Observer (default: 30,000)
        messageTokens: 30_000,
      },
      reflection: {
        // when to run the Reflector (default: 40,000)
        observationTokens: 40_000,
      },
      // let message history borrow from observation budget
      // requires bufferTokens: false (temporary limitation)
      shareTokenBudget: false,
    },
  },

```

### Token counting cache

OM caches token estimates in message metadata to reduce repeat counting work during threshold checks and buffering decisions.

- Per-part estimates are stored on `part.providerMetadata.mastra` and reused on subsequent passes when the cache version/tokenizer source matches.
- For string-only message content (without parts), OM uses a message-level metadata fallback cache.
- Message and conversation overhead are still recalculated on every pass. The cache only stores payload estimates, so counting semantics stay the same.
- `data-*` and `reasoning` parts are still skipped and aren't cached.

## Async buffering

Without async buffering, the Observer runs synchronously when the message threshold is reached — the agent pauses mid-conversation while the Observer LLM call completes. With async buffering (enabled by default), observations are pre-computed in the background as the conversation grows. When the threshold is hit, buffered observations activate instantly with no pause.

### How it works

As the agent converses, message tokens accumulate. At regular intervals (`bufferTokens`), a background Observer call runs without blocking the agent. Each call produces a "chunk" of observations that's stored in a buffer.

When message tokens reach the `messageTokens` threshold, buffered chunks activate: their observations move into the active observation log, and the corresponding raw messages are removed from the context window. The agent never pauses.

Buffered observations also include continuation hints — a suggested next response and the current task — so the main agent maintains conversational continuity after activation shrinks the context window.

If the agent produces messages faster than the Observer can process them, a `blockAfter` safety threshold forces a synchronous observation as a last resort. Buffered activation still preserves a minimum remaining context (the smaller of \~1k tokens or the configured retention floor).

Reflection works similarly — the Reflector runs in the background when observations reach a fraction of the reflection threshold.

### Settings

| Setting | Default | What it controls |
| - | - | - |
| `observation.bufferTokens` | `0.2` | How often to buffer. `0.2` means every 20% of `messageTokens` — with the default 30k threshold, that's roughly every 6k tokens. Can also be an absolute token count (e.g. `5000`). |
| `observation.bufferActivation` | `0.8` | How aggressively to clear the message window on activation. `0.8` means remove enough messages to keep only 20% of `messageTokens` remaining. Lower values keep more message history. |
| `observation.blockAfter` | `1.2` | Safety threshold as a multiplier of `messageTokens`. At `1.2`, synchronous observation is forced at 36k tokens (1.2 × 30k). Only matters if buffering can't keep up. |
| `reflection.bufferActivation` | `0.5` | When to start background reflection. `0.5` means reflection begins when observations reach 50% of the `observationTokens` threshold. |
| `reflection.blockAfter` | `1.2` | Safety threshold for reflection, same logic as observation. |

### Disabling

To disable async buffering and use synchronous observation/reflection instead:

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      observation: {
        bufferTokens: false,
      },
    },
  },

```

Setting `bufferTokens: false` disables both observation and reflection async buffering. See [async buffering configuration](/reference/memory/observational-memory#async-buffering) for the full API.

> **Note:**
Async buffering isn't supported with `scope: 'resource'`. It's automatically disabled in resource scope.


## Observer Context Optimization

By default, the Observer receives the full observation history as context when processing new messages. The Observer also receives prior `current-task` and `suggested-response` metadata (when available), so it can stay oriented even when observation context is truncated. For long-running conversations where observations grow large, you can opt into context optimization to reduce Observer input costs.

Set `observation.previousObserverTokens` to limit how many tokens of previous observations are sent to the Observer. Observations are tail-truncated, keeping the most recent entries. When a buffered reflection is pending, the already-reflected lines are automatically replaced with the reflection summary before truncation is applied.

```typescript
const memory = new Memory({
  options: {
    observationalMemory: {
      model: 'google/gemini-2.5-flash',
      observation: {
        previousObserverTokens: 10_000, // keep only ~10k tokens of recent observations
      },
    },
  },

```

- `previousObserverTokens: 2000` → default; keeps \~2k tokens of recent observations.
- `previousObserverTokens: 0` → omit previous observations completely.
- `previousObserverTokens: false` → disable truncation and keep full previous observations.

## Migrating existing threads

No manual migration needed. OM reads existing messages and observes them lazily when thresholds are exceeded.

- **Thread scope**: The first time a thread exceeds `observation.messageTokens`, the Observer processes the backlog.
- **Resource scope**: All unobserved messages across all threads for a resource are processed together. For users with many existing threads, this could take significant time.

## Comparing OM with other memory features

- **[Message history](/docs/memory/message-history)**: High-fidelity record of the current conversation
- **[Working memory](/docs/memory/working-memory)**: Small, structured state (JSON or markdown) for user preferences, names, goals
- **[Semantic Recall](/docs/memory/semantic-recall)**: RAG-based retrieval of relevant past messages

If you're using working memory to store conversation summaries or ongoing state that grows over time, OM is a better fit. Working memory is for small, structured data; OM is for long-running event logs. OM also manages message history automatically—the `messageTokens` setting controls how much raw history remains before observation runs.

In practical terms, OM replaces both working memory and message history, and has greater accuracy (and lower cost) than Semantic Recall.

## Related

- [Observational Memory Reference](/reference/memory/observational-memory)
- [Memory Overview](/docs/memory/overview)
- [Message History](/docs/memory/message-history)
- [Memory Processors](/docs/memory/memory-processors)

---

# Message history

Message history is the most basic and important form of memory. It gives the LLM a view of recent messages in the context window, enabling your agent to reference earlier exchanges and respond coherently.

You can also retrieve message history to display past conversations in your UI.

> **Info:**
Each message belongs to a thread (the conversation) and a resource (the user or entity it's associated with). See [Threads and resources](/docs/memory/storage#threads-and-resources) for more detail.


## Getting started

Install the Mastra memory module along with a [storage adapter](/docs/memory/storage#supported-providers) for your database. The examples below use `@mastra/libsql`, which stores data locally in a `mastra.db` file.

```bash npm2yarn
npm install @mastra/memory@latest @mastra/libsql@latest
```

Message history requires a storage adapter to persist conversations. Configure storage on your Mastra instance if you haven't already:

```typescript
export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),

```

Instantiate a [`Memory`](/reference/memory/memory-class) instance in your agent:

```typescript
export const agent = new Agent({
  id: 'test-agent',
  memory: new Memory({
    options: {
      lastMessages: 10,
    },
  }),

```

When you call the agent, messages are automatically saved to the database. You can specify a `threadId`, `resourceId`, and optional `metadata`:


  ```typescript
    await agent.generate('Hello', {
      memory: {
        thread: {
          id: 'thread-123',
          title: 'Support conversation',
          metadata: { category: 'billing' },
        },
        resource: 'user-456',
      },

    ```

```typescript
    await agent.stream('Hello', {
      memory: {
        thread: {
          id: 'thread-123',
          title: 'Support conversation',
          metadata: { category: 'billing' },
        },
        resource: 'user-456',
      },

    ```

> **Info:**
Threads and messages are created automatically when you call `agent.generate()` or `agent.stream()`, but you can also create them manually with [`createThread()`](/reference/memory/createThread) and [`saveMessages()`](/reference/memory/memory-class).


You can use this history in two ways:

- **Automatic inclusion** - Mastra automatically fetches and includes recent messages in the context window. By default, it includes the last 10 messages, keeping agents grounded in the conversation. You can adjust this number with `lastMessages`, but in most cases you don't need to think about it.
- [**Manual querying**](#querying) - For more control, use the `recall()` function to query threads and messages directly. This lets you choose exactly which memories are included in the context window, or fetch messages to render conversation history in your UI.

> **Tip:**
When memory is enabled, [Studio](/docs/studio/overview) uses message history to display past conversations in the chat sidebar.


## Accessing memory

To access memory functions for querying, cloning, or deleting threads and messages, call `getMemory()` on an agent:

```typescript
const agent = mastra.getAgentById('test-agent')
const memory = await agent.getMemory()
```

The `Memory` instance gives you access to functions for listing threads, recalling messages, cloning conversations, and more.

## Querying

Use these methods to fetch threads and messages for displaying conversation history in your UI or for custom memory retrieval logic.

> **Warning:**
The memory system doesn't enforce access control. Before running any query, verify in your application logic that the current user is authorized to access the `resourceId` being queried.


### Threads

Use [`listThreads()`](/reference/memory/listThreads) to retrieve threads for a resource:

```typescript
const result = await memory.listThreads({
  filter: { resourceId: 'user-123' },
  perPage: false,

```

Paginate through threads:

```typescript
const result = await memory.listThreads({
  filter: { resourceId: 'user-123' },
  page: 0,
  perPage: 10,

console.log(result.threads) // thread objects
console.log(result.hasMore) // more pages available?
```

You can also filter by metadata and control sort order:

```typescript
const result = await memory.listThreads({
  filter: {
    resourceId: 'user-123',
    metadata: { status: 'active' },
  },
  orderBy: { field: 'createdAt', direction: 'DESC' },

```

To fetch a single thread by ID, use [`getThreadById()`](/reference/memory/getThreadById):

```typescript
const thread = await memory.getThreadById({ threadId: 'thread-123' })
```

### Messages

Once you have a thread, use [`recall()`](/reference/memory/recall) to retrieve its messages. It supports pagination, date filtering, and [semantic search](/docs/memory/semantic-recall).

Basic recall returns all messages from a thread:

```typescript
const { messages } = await memory.recall({
  threadId: 'thread-123',
  perPage: false,

```

Paginate through messages:

```typescript
const { messages } = await memory.recall({
  threadId: 'thread-123',
  page: 0,
  perPage: 50,

```

Filter by date range:

```typescript
const { messages } = await memory.recall({
  threadId: 'thread-123',
  filter: {

      start: new Date('2025-01-01'),
      end: new Date('2025-06-01'),
    },
  },

```

Fetch a single message by ID:

```typescript
const { messages } = await memory.recall({
  threadId: 'thread-123',
  include: [{ id: 'msg-123' }],

```

Fetch multiple messages by ID with surrounding context:

```typescript
const { messages } = await memory.recall({
  threadId: 'thread-123',
  include: [
    { id: 'msg-123' },

      id: 'msg-456',
      withPreviousMessages: 3,
      withNextMessages: 1,
    },
  ],

```

Search by meaning (see [Semantic recall](/docs/memory/semantic-recall) for setup):

```typescript
const { messages } = await memory.recall({
  threadId: 'thread-123',
  vectorSearchString: 'project deadline discussion',
  threadConfig: {
    semanticRecall: true,
  },

```

### UI format

Message queries return `MastraDBMessage[]` format. To display messages in a frontend, you may need to convert them to a format your UI library expects. For example, [`toAISdkV5Messages`](/reference/ai-sdk/to-ai-sdk-v5-messages) converts messages to AI SDK UI format.

## Thread cloning

Thread cloning creates a copy of an existing thread with its messages. This is useful for branching conversations, creating checkpoints before a potentially destructive operation, or testing variations of a conversation.

```typescript
const { thread, clonedMessages } = await memory.cloneThread({
  sourceThreadId: 'thread-123',
  title: 'Branched conversation',

```

You can filter which messages get cloned (by count or date range), specify custom thread IDs, and use utility methods to inspect clone relationships.

See [`cloneThread()`](/reference/memory/cloneThread) and [clone utilities](/reference/memory/clone-utilities) for the full API.

## Deleting messages

To remove messages from a thread, use [`deleteMessages()`](/reference/memory/deleteMessages). You can delete by message ID or clear all messages from a thread.

---

# Memory processors

Memory processors transform and filter messages as they pass through an agent with memory enabled. They manage context window limits, remove unnecessary content, and optimize the information sent to the language model.

When memory is enabled on an agent, Mastra adds memory processors to the agent's processor pipeline. These processors retrieve message history, working memory, and semantically relevant messages, then persist new messages after the model responds.

Memory processors are [processors](/docs/agents/processors) that operate specifically on memory-related messages and state.

## Built-in memory processors

Mastra automatically adds these processors when memory is enabled:

### `MessageHistory`

Retrieves message history and persists new messages.

**When you configure:**

```typescript
memory: new Memory({
  lastMessages: 10,

```

**Mastra internally:**

1. Creates a `MessageHistory` processor with `limit: 10`
1. Adds it to the agent's input processors (runs before the LLM)
1. Adds it to the agent's output processors (runs after the LLM)

**What it does:**

- **Input**: Fetches the last 10 messages from storage and prepends them to the conversation
- **Output**: Persists new messages to storage after the model responds

**Example:**

```typescript
const agent = new Agent({
  id: 'test-agent',
  name: 'Test Agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5.4',
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'memory-store',
      url: 'file:memory.db',
    }),
    lastMessages: 10, // MessageHistory processor automatically added
  }),

```

### `SemanticRecall`

Retrieves semantically relevant messages based on the current input and creates embeddings for new messages.

**When you configure:**

```typescript
memory: new Memory({
  semanticRecall: { enabled: true },
  vector: myVectorStore,
  embedder: myEmbedder,

```

**Mastra internally:**

1. Creates a `SemanticRecall` processor
1. Adds it to the agent's input processors (runs before the LLM)
1. Adds it to the agent's output processors (runs after the LLM)
1. Requires both a vector store and embedder to be configured

**What it does:**

- **Input**: Performs vector similarity search to find relevant past messages and prepends them to the conversation
- **Output**: Creates embeddings for new messages and stores them in the vector store for future retrieval

**Example:**

```typescript
const agent = new Agent({
  name: 'semantic-agent',
  instructions: 'You are a helpful assistant with semantic memory',
  model: 'openai/gpt-5.4',
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'memory-store',
      url: 'file:memory.db',
    }),
    vector: new PineconeVector({
      id: 'memory-vector',
      apiKey: process.env.PINECONE_API_KEY!,
    }),
    embedder: new OpenAIEmbedder({
      model: 'text-embedding-3-small',
      apiKey: process.env.OPENAI_API_KEY!,
    }),
    semanticRecall: { enabled: true }, // SemanticRecall processor automatically added
  }),

```

### `WorkingMemory`

Manages working memory state across conversations.

**When you configure:**

```typescript
memory: new Memory({
  workingMemory: { enabled: true },

```

**Mastra internally:**

1. Creates a `WorkingMemory` processor
1. Adds it to the agent's input processors (runs before the LLM)
1. Requires a storage adapter to be configured

**What it does:**

- **Input**: Retrieves working memory state for the current thread and prepends it to the conversation
- **Output**: No output processing

**Example:**

```typescript
const agent = new Agent({
  name: 'working-memory-agent',
  instructions: 'You are an assistant with working memory',
  model: 'openai/gpt-5.4',
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'memory-store',
      url: 'file:memory.db',
    }),
    workingMemory: { enabled: true }, // WorkingMemory processor automatically added
  }),

```

## Manual control and deduplication

If you manually add a memory processor to `inputProcessors` or `outputProcessors`, Mastra **won't** automatically add it. This gives you full control over processor ordering:

```typescript
// Custom MessageHistory with different configuration
const customMessageHistory = new MessageHistory({
  storage: new LibSQLStore({ id: 'memory-store', url: 'file:memory.db' }),
  lastMessages: 20,

const agent = new Agent({
  name: 'custom-memory-agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5.4',
  memory: new Memory({
    storage: new LibSQLStore({ id: 'memory-store', url: 'file:memory.db' }),
    lastMessages: 10, // This would normally add MessageHistory(10)
  }),
  inputProcessors: [
    customMessageHistory, // Your custom one is used instead
    new TokenLimiter({ limit: 4000 }), // Runs after your custom MessageHistory
  ],

```

## Processor execution order

Understanding the execution order is important when combining guardrails with memory:

### Input Processors

```
[Memory Processors] → [Your inputProcessors]
```

1. **Memory processors run FIRST**: `WorkingMemory`, `MessageHistory`, `SemanticRecall`
1. **Your input processors run AFTER**: guardrails, filters, validators

This means memory loads message history before your processors can validate or filter the input.

### Output Processors

```
[Your outputProcessors] → [Memory Processors]
```

1. **Your output processors run FIRST**: guardrails, filters, validators
1. **Memory processors run AFTER**: `SemanticRecall` (embeddings), `MessageHistory` (persistence)

This ordering is designed to be **safe by default**: if your output guardrail calls `abort()`, the memory processors never run and **no messages are saved**.

## Guardrails and memory

The default execution order provides safe guardrail behavior:

### Output guardrails (recommended)

Output guardrails run **before** memory processors save messages. If a guardrail aborts:

- The tripwire is triggered
- Memory processors are skipped
- **No messages are persisted to storage**

```typescript
// Output guardrail that blocks inappropriate content
const contentBlocker = {
  id: 'content-blocker',
  processOutputResult: async ({ messages, abort }) => {
    const hasInappropriateContent = messages.some(msg => containsBadContent(msg))
    if (hasInappropriateContent) {
      abort('Content blocked by guardrail')

    return messages
  },

const agent = new Agent({
  name: 'safe-agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5.4',
  memory: new Memory({ lastMessages: 10 }),
  // Your guardrail runs BEFORE memory saves
  outputProcessors: [contentBlocker],

// If the guardrail aborts, nothing is saved to memory
const result = await agent.generate('Hello')
if (result.tripwire) {
  console.log('Blocked:', result.tripwire.reason)
  // Memory is empty - no messages were persisted

```

### Input guardrails

Input guardrails run **after** memory processors load history. If a guardrail aborts:

- The tripwire is triggered
- The LLM is never called
- Output processors (including memory persistence) are skipped
- **No messages are persisted to storage**

```typescript
// Input guardrail that validates user input
const inputValidator = {
  id: 'input-validator',
  processInput: async ({ messages, abort }) => {
    const lastUserMessage = messages.findLast(m => m.role === 'user')
    if (isInvalidInput(lastUserMessage)) {
      abort('Invalid input detected')

    return messages
  },

const agent = new Agent({
  name: 'validated-agent',
  instructions: 'You are a helpful assistant',
  model: 'openai/gpt-5.4',
  memory: new Memory({ lastMessages: 10 }),
  // Your guardrail runs AFTER memory loads history
  inputProcessors: [inputValidator],

```

### Summary

| Guardrail Type | When it runs | If it aborts |
| - | - | - |
| Input | After memory loads history | LLM not called, nothing saved |
| Output | Before memory saves | Nothing saved to storage |

Both scenarios are safe - guardrails prevent inappropriate content from being persisted to memory

## Related documentation

- [Processors](/docs/agents/processors) - General processor concepts and custom processor creation
- [Guardrails](/docs/agents/guardrails) - Security and validation processors
- [Memory Overview](/docs/memory/overview) - Memory types and configuration

When creating custom processors avoid mutating the input `messages` array or its objects directly.

---

# Storage

For agents to remember previous interactions, Mastra needs a storage adapter. Use one of the [supported providers](#supported-providers) and pass it to your Mastra instance.

```typescript
export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),

```

:::tip[Sharing the database with Studio]
When running `mastra dev` alongside your application (e.g., Next.js), use an absolute path to ensure both processes access the same database:

```typescript
url: 'file:/absolute/path/to/your/project/mastra.db'
```

Relative paths like `file:./mastra.db` resolve based on each process's working directory, which may differ.


This configures instance-level storage, which all agents share by default. You can also configure [agent-level storage](#agent-level-storage) for isolated data boundaries.

Mastra automatically initializes the necessary storage structures on first interaction. See [Storage Overview](/reference/storage/overview) for domain coverage and the schema used by the built-in database-backed domains.

## Supported providers

Each provider page includes installation instructions, configuration parameters, and usage examples:

- [libSQL](/reference/storage/libsql)
- [PostgreSQL](/reference/storage/postgresql)
- [MongoDB](/reference/storage/mongodb)
- [Upstash](/reference/storage/upstash)
- [Cloudflare D1](/reference/storage/cloudflare-d1)
- [Cloudflare KV & Durable Objects](/reference/storage/cloudflare)
- [Convex](/reference/storage/convex)
- [DynamoDB](/reference/storage/dynamodb)
- [LanceDB](/reference/storage/lance)
- [Microsoft SQL Server](/reference/storage/mssql)

> **Tip:**
libSQL is the easiest way to get started because it doesn’t require running a separate database server.


## Configuration scope

Storage can be configured at the instance level (shared by all agents) or at the agent level (isolated to a specific agent).

### Instance-level storage

Add storage to your Mastra instance so all agents, workflows, observability traces, and scores share the same storage backend:

```typescript
export const mastra = new Mastra({
  storage: new PostgresStore({
    id: 'mastra-storage',
    connectionString: process.env.DATABASE_URL,
  }),

// Both agents inherit storage from the Mastra instance above
const agent1 = new Agent({ id: 'agent-1', memory: new Memory() })
const agent2 = new Agent({ id: 'agent-2', memory: new Memory() })
```

This is useful when all primitives share the same storage backend and have similar performance, scaling, and operational requirements.

#### Composite storage

[Composite storage](/reference/storage/composite) is an alternative way to configure instance-level storage. Use `MastraCompositeStore` to route `memory` and any other [supported domains](/reference/storage/composite#storage-domains) to different storage providers.

```typescript
export const mastra = new Mastra({
  storage: new MastraCompositeStore({
    id: 'composite',

      // highlight-next-line
      memory: new MemoryLibSQL({ url: 'file:./memory.db' }),
      workflows: new WorkflowsPG({ connectionString: process.env.DATABASE_URL }),
      observability: new ObservabilityStorageClickhouse({
        url: process.env.CLICKHOUSE_URL,
        username: process.env.CLICKHOUSE_USERNAME,
        password: process.env.CLICKHOUSE_PASSWORD,
      }),
    },
  }),

```

This is useful when different types of data have different performance or operational requirements, such as low-latency storage for memory, durable storage for workflows, and high-throughput storage for observability.

### Agent-level storage

Agent-level storage overrides storage configured at the instance level. Add storage to a specific agent when you need to keep data separate or use different providers per agent.

```typescript
export const agent = new Agent({
  id: 'agent',
  memory: new Memory({
    storage: new PostgresStore({
      id: 'agent-storage',
      connectionString: process.env.AGENT_DATABASE_URL,
    }),
  }),

```

> **Warning:**
Agent-level storage isn't supported when using [Mastra Cloud Store](/docs/mastra-cloud/deployment#using-mastra-cloud-store). If you use Mastra Cloud Store, configure storage on the Mastra instance instead. This limitation doesn't apply if you bring your own database.


## Threads and resources

Mastra organizes conversations using two identifiers:

- **Thread**: A conversation session containing a sequence of messages.
- **Resource**: The entity that owns the thread, such as a user, organization, project, or any other domain entity in your application.

Both identifiers are required for agents to store information:


  ```typescript
    const response = await agent.generate('hello', {
      memory: {
        thread: 'conversation-abc-123',
        resource: 'user_123',
      },

    ```

```typescript
    const stream = await agent.stream('hello', {
      memory: {
        thread: 'conversation-abc-123',
        resource: 'user_123',
      },

    ```

> **Note:**
[Studio](/docs/studio/overview) automatically generates a thread and resource ID for you. When calling `stream()` or `generate()` yourself, remember to provide these identifiers explicitly.


### Thread title generation

Mastra can automatically generate descriptive thread titles based on the user's first message when `generateTitle` is enabled.

Use this option when implementing a ChatGPT-style chat interface to render a title alongside each thread in the conversation list (for example, in a sidebar) derived from the thread’s initial user message.

```typescript
export const agent = new Agent({
  id: 'agent',
  memory: new Memory({
    options: {
      generateTitle: true,
    },
  }),

```

Title generation runs asynchronously after the agent responds and doesn't affect response time.

To optimize cost or behavior, provide a smaller [`model`](/models) and custom `instructions`:

```typescript
export const agent = new Agent({
  id: 'agent',
  memory: new Memory({
    options: {
      generateTitle: {
        model: 'openai/gpt-5-mini',
        instructions: 'Generate a 1 word title',
      },
    },
  }),

```

## Semantic recall

Semantic recall has different storage requirements - it needs a vector database in addition to the standard storage adapter. See [Semantic recall](/docs/memory/semantic-recall) for setup and supported vector providers.

## Handling large attachments

Some storage providers enforce record size limits that base64-encoded file attachments (such as images) can exceed:

| Provider | Record size limit |
| - | - |
| [DynamoDB](/reference/storage/dynamodb) | 400 KB |
| [Convex](/reference/storage/convex) | 1 MiB |
| [Cloudflare D1](/reference/storage/cloudflare-d1) | 1 MiB |

PostgreSQL, MongoDB, and libSQL have higher limits and are generally unaffected.

To avoid this, use an input processor to upload attachments to external storage (S3, R2, GCS, [Convex file storage](https://docs.convex.dev/file-storage), etc.) and replace them with URL references before persistence.

```typescript
export class AttachmentUploader implements Processor {
  id = 'attachment-uploader'

  async processInput({ messages }: { messages: MastraDBMessage[] }) {
    return Promise.all(messages.map(msg => this.processMessage(msg)))

  async processMessage(msg: MastraDBMessage) {
    const attachments = msg.content.experimental_attachments
    if (!attachments?.length) return msg

    const uploaded = await Promise.all(
      attachments.map(async att => {
        // Skip if already a URL
        if (!att.url?.startsWith('data:')) return att

        // Upload base64 data and replace with URL
        const url = await this.upload(att.url, att.contentType)
        return { ...att, url }
      }),

    return { ...msg, content: { ...msg.content, experimental_attachments: uploaded } }

  async upload(dataUri: string, contentType?: string): Promise<string> {
    const base64 = dataUri.split(',')[1]
    const buffer = Buffer.from(base64, 'base64')

    // Replace with your storage provider (S3, R2, GCS, Convex, etc.)
    // return await s3.upload(buffer, contentType);
    throw new Error('Implement upload() with your storage provider')


```

Use the processor with your agent:

```typescript
const agent = new Agent({
  id: 'my-agent',
  memory: new Memory({ storage: yourStorage }),
  inputProcessors: [new AttachmentUploader()],

```

---



# RAG (Retrieval-Augmented Generation)

# RAG (Retrieval-Augmented Generation) in Mastra

RAG in Mastra helps you enhance LLM outputs by incorporating relevant context from your own data sources, improving accuracy and grounding responses in real information.

Mastra's RAG system provides:

- Standardized APIs to process and embed documents
- Support for multiple vector stores
- Chunking and embedding strategies for optimal retrieval
- Observability for tracking embedding and retrieval performance

## Example

To implement RAG, you process your documents into chunks, create embeddings, store them in a vector database, and then retrieve relevant context at query time.

```ts
// 1. Initialize document
const doc = MDocument.fromText(`Your document text here...`)

// 2. Create chunks
const chunks = await doc.chunk({
  strategy: 'recursive',
  size: 512,
  overlap: 50,

// 3. Generate embeddings; we need to pass the text of each chunk


const { embeddings } = await embedMany({
  values: chunks.map(chunk => chunk.text),
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

// 4. Store in vector database
const pgVector = new PgVector({
  id: 'pg-vector',
  connectionString: process.env.POSTGRES_CONNECTION_STRING,

await pgVector.upsert({
  indexName: 'embeddings',
  vectors: embeddings,
}) // using an index name of 'embeddings'

// 5. Query similar chunks
const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: queryVector,
  topK: 3,
}) // queryVector is the embedding of the query

console.log('Similar chunks:', results)
```

This example shows the essentials: initialize a document, create chunks, generate embeddings, store them, and query for similar content.

## Document processing

The basic building block of RAG is document processing. Documents can be chunked using various strategies (recursive, sliding window, etc.) and enriched with metadata. See the [chunking and embedding doc](./chunking-and-embedding).

## Vector storage

Mastra supports multiple vector stores for embedding persistence and similarity search, including pgvector, Pinecone, Qdrant, and MongoDB. See the [vector database doc](./vector-databases).

## More resources

- [Chain of Thought RAG Example](https://github.com/mastra-ai/mastra/tree/main/examples/basics/rag/cot-rag)

---

# Chunking and embedding documents

Before processing, create a MDocument instance from your content. You can initialize it from various formats:

```ts
const docFromText = MDocument.fromText('Your plain text content...')
const docFromHTML = MDocument.fromHTML('<html>Your HTML content...</html>')
const docFromMarkdown = MDocument.fromMarkdown('# Your Markdown content...')
const docFromJSON = MDocument.fromJSON(`{ "key": "value" }`)
```

## Document processing

Use `chunk` to split documents into manageable pieces. Mastra supports multiple chunking strategies optimized for different document types:

- `recursive`: Smart splitting based on content structure
- `character`: Simple character-based splits
- `token`: Token-aware splitting
- `markdown`: Markdown-aware splitting
- `semantic-markdown`: Markdown splitting based on related header families
- `html`: HTML structure-aware splitting
- `json`: JSON structure-aware splitting
- `latex`: LaTeX structure-aware splitting
- `sentence`: Sentence-aware splitting

> **Note:**
Each strategy accepts different parameters optimized for its chunking approach.


Here's an example of how to use the `recursive` strategy:

```ts
const chunks = await doc.chunk({
  strategy: 'recursive',
  maxSize: 512,
  overlap: 50,
  separators: ['\n'],
  extract: {
    metadata: true, // Optionally extract metadata
  },

```

For text where preserving sentence structure is important, here's an example of how to use the `sentence` strategy:

```ts
const chunks = await doc.chunk({
  strategy: 'sentence',
  maxSize: 450,
  minSize: 50,
  overlap: 0,
  sentenceEnders: ['.'],

```

For markdown documents where preserving the semantic relationships between sections is important, here's an example of how to use the `semantic-markdown` strategy:

```ts
const chunks = await doc.chunk({
  strategy: 'semantic-markdown',
  joinThreshold: 500,
  modelName: 'gpt-3.5-turbo',

```

> **Note:**
Metadata extraction may use LLM calls, so ensure your API key is set.


We go deeper into chunking strategies in our [`chunk()` reference documentation](/reference/rag/chunk).

## Embedding generation

Transform chunks into embeddings using your preferred provider. Mastra supports embedding models through the model router.

### Using the Model Router

The simplest way is to use Mastra's model router with `provider/model` strings:

```ts
const { embeddings } = await embedMany({
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  values: chunks.map(chunk => chunk.text),

```

Mastra supports OpenAI and Google embedding models. For a complete list of supported embedding models, see the [embeddings reference](/reference/rag/embeddings).

The model router automatically handles API key detection from environment variables.

The embedding functions return vectors, arrays of numbers representing the semantic meaning of your text, ready for similarity searches in your vector database.

### Configuring Embedding Dimensions

Embedding models typically output vectors with a fixed number of dimensions (e.g., 1536 for OpenAI's `text-embedding-3-small`).
Some models support reducing this dimensionality, which can help:

- Decrease storage requirements in vector databases
- Reduce computational costs for similarity searches

Here are some supported models:

OpenAI (text-embedding-3 models):

```ts
const { embeddings } = await embedMany({
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  options: {

  },
  values: chunks.map(chunk => chunk.text),

```

Google (text-embedding-001):

```ts
const { embeddings } = await embedMany({
  model: google('gemini-embedding-001', {
    outputDimensionality: 256, // Truncates excessive values from the end
  }),
  values: chunks.map(chunk => chunk.text),

```

:::important[Vector Database Compatibility]
When storing embeddings, the vector database index must be configured to match the output size of your embedding model. If the dimensions don't match, you may get errors or data corruption.


## Example: Complete pipeline

Here's an example showing document processing and embedding generation with both providers:

```ts
// Initialize document
const doc = MDocument.fromText(`
  Climate change poses significant challenges to global agriculture.
  Rising temperatures and changing precipitation patterns affect crop yields.
`)

// Create chunks
const chunks = await doc.chunk({
  strategy: 'recursive',
  maxSize: 256,
  overlap: 50,

// Generate embeddings with OpenAI


const { embeddings } = await embedMany({
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  values: chunks.map(chunk => chunk.text),

// OR

// Generate embeddings with Cohere
const { embeddings } = await embedMany({
  model: 'cohere/embed-english-v3.0',
  values: chunks.map(chunk => chunk.text),

// Store embeddings in your vector database
await vectorStore.upsert({
  indexName: 'embeddings',
  vectors: embeddings,

```

##

For more examples of different chunking strategies and embedding configurations, see:

- [Chunk Reference](/reference/rag/chunk)
- [Embeddings Reference](/reference/rag/embeddings)

For more details on vector databases and embeddings, see:

- [Vector Databases](./vector-databases)
- [Embedding API Reference](/reference/rag/embeddings)

---

# Retrieval in RAG systems

After storing embeddings, you need to retrieve relevant chunks to answer user queries.

Mastra provides flexible retrieval options with support for semantic search, filtering, and re-ranking.

## How retrieval works

1. The user's query is converted to an embedding using the same model used for document embeddings
1. This embedding is compared to stored embeddings using vector similarity
1. The most similar chunks are retrieved and can be optionally:

- Filtered by metadata
- Re-ranked for better relevance
- Processed through a knowledge graph

## Basic retrieval

The simplest approach is direct semantic search. This method uses vector similarity to find chunks that are semantically similar to the query:

```ts
// Convert query to embedding
const { embedding } = await embed({
  value: 'What are the main points in the article?',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

// Query vector store
const pgVector = new PgVector({
  id: 'pg-vector',
  connectionString: process.env.POSTGRES_CONNECTION_STRING,

const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: embedding,
  topK: 10,

// Display results
console.log(results)
```

The `topK` parameter specifies the maximum number of most similar results to return from the vector search.

Results include both the text content and a similarity score:

```ts
[

    text: 'Climate change poses significant challenges...',
    score: 0.89,
    metadata: { source: 'article1.txt' },
  },

    text: 'Rising temperatures affect crop yields...',
    score: 0.82,
    metadata: { source: 'article1.txt' },
  },
]
```

## Advanced retrieval options

### Metadata Filtering

Filter results based on metadata fields to narrow down the search space. This approach - combining vector similarity search with metadata filters - is sometimes called hybrid vector search, as it merges semantic search with structured filtering criteria.

This is useful when you have documents from different sources, time periods, or with specific attributes. Mastra provides a unified MongoDB-style query syntax that works across all supported vector stores.

For detailed information about available operators and syntax, see the [Metadata Filters Reference](/reference/rag/metadata-filters).

Basic filtering examples:

```ts
// Simple equality filter
const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: embedding,
  topK: 10,
  filter: {
    source: 'article1.txt',
  },

// Numeric comparison
const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: embedding,
  topK: 10,
  filter: {
    price: { $gt: 100 },
  },

// Multiple conditions
const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: embedding,
  topK: 10,
  filter: {
    category: 'electronics',
    price: { $lt: 1000 },
    inStock: true,
  },

// Array operations
const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: embedding,
  topK: 10,
  filter: {
    tags: { $in: ['sale', 'new'] },
  },

// Logical operators
const results = await pgVector.query({
  indexName: 'embeddings',
  queryVector: embedding,
  topK: 10,
  filter: {
    $or: [{ category: 'electronics' }, { category: 'accessories' }],
    $and: [{ price: { $gt: 50 } }, { price: { $lt: 200 } }],
  },

```

Common use cases for metadata filtering:

- Filter by document source or type
- Filter by date ranges
- Filter by specific categories or tags
- Filter by numerical ranges (e.g., price, rating)
- Combine multiple conditions for precise querying
- Filter by document attributes (e.g., language, author)

### Vector Query Tool

Sometimes you want to give your agent the ability to query a vector database directly. The Vector Query Tool allows your agent to be in charge of retrieval decisions, combining semantic search with optional filtering and reranking based on the agent's understanding of the user's needs.

```ts
const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

```

When creating the tool, pay special attention to the tool's name and description - these help the agent understand when and how to use the retrieval capabilities. For example, you might name it "SearchKnowledgeBase" and describe it as "Search through our documentation to find relevant information about X topic."

This is particularly useful when:

- Your agent needs to dynamically decide what information to retrieve
- The retrieval process requires complex decision-making
- You want the agent to combine multiple retrieval strategies based on context

#### Database-Specific Configurations

The Vector Query Tool supports database-specific configurations that enable you to leverage unique features and optimizations of different vector stores.

> **Note:**
These configurations are for **query-time options** like namespaces, performance tuning, and filtering—not for database connection setup.

Connection credentials (URLs, auth tokens) are configured when you instantiate the vector store class (e.g., `new LibSQLVector({ url: '...' })`).


```ts
// Pinecone with namespace
const pineconeQueryTool = createVectorQueryTool({
  vectorStoreName: 'pinecone',
  indexName: 'docs',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

    pinecone: {
      namespace: 'production', // Isolate data by environment
    },
  },

// pgVector with performance tuning
const pgVectorQueryTool = createVectorQueryTool({
  vectorStoreName: 'postgres',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

    pgvector: {
      minScore: 0.7, // Filter low-quality results
      ef: 200, // HNSW search parameter
      probes: 10, // IVFFlat probe parameter
    },
  },

// Chroma with advanced filtering
const chromaQueryTool = createVectorQueryTool({
  vectorStoreName: 'chroma',
  indexName: 'documents',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

    chroma: {
      where: { category: 'technical' },
      whereDocument: { $contains: 'API' },
    },
  },

// LanceDB with table specificity
const lanceQueryTool = createVectorQueryTool({
  vectorStoreName: 'lance',
  indexName: 'documents',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

    lance: {
      tableName: 'myVectors', // Specify which table to query
      includeAllColumns: true, // Include all metadata columns in results
    },
  },

```

**Key Benefits:**

- **Pinecone namespaces**: Organize vectors by tenant, environment, or data type
- **pgVector optimization**: Control search accuracy and speed with ef/probes parameters
- **Quality filtering**: Set minimum similarity thresholds to improve result relevance
- **LanceDB tables**: Separate data into tables for better organization and performance
- **Runtime flexibility**: Override configurations dynamically based on context

**Common Use Cases:**

- Multi-tenant applications using Pinecone namespaces
- Performance optimization in high-load scenarios
- Environment-specific configurations (dev/staging/prod)
- Quality-gated search results
- Embedded, file-based vector storage with LanceDB for edge deployment scenarios

You can also override these configurations at runtime using the request context:

```ts
const requestContext = new RequestContext()
requestContext.set('databaseConfig', {
  pinecone: {
    namespace: 'runtime-namespace',
  },

await pineconeQueryTool.execute({ queryText: 'search query' }, { mastra, requestContext })
```

For detailed configuration options and advanced usage, see the [Vector Query Tool Reference](/reference/tools/vector-query-tool).

### Vector Store Prompts

Vector store prompts define query patterns and filtering capabilities for each vector database implementation.
When implementing filtering, these prompts are required in the agent's instructions to specify valid operators and syntax for each vector store implementation.


  ```ts
    import { PGVECTOR_PROMPT } from '@mastra/pg'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${PGVECTOR_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { PINECONE_PROMPT } from '@mastra/pinecone'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${PINECONE_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { QDRANT_PROMPT } from '@mastra/qdrant'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${QDRANT_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { CHROMA_PROMPT } from '@mastra/chroma'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${CHROMA_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { ASTRA_PROMPT } from '@mastra/astra'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${ASTRA_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { LIBSQL_PROMPT } from '@mastra/libsql'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${LIBSQL_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { UPSTASH_PROMPT } from '@mastra/upstash'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${UPSTASH_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { VECTORIZE_PROMPT } from '@mastra/vectorize'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${VECTORIZE_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { MONGODB_PROMPT } from '@mastra/mongodb'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${MONGODB_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { OPENSEARCH_PROMPT } from '@mastra/opensearch'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${OPENSEARCH_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

```ts
    import { S3VECTORS_PROMPT } from '@mastra/s3vectors'

    export const ragAgent = new Agent({
      id: 'rag-agent',
      name: 'RAG Agent',
      model: 'openai/gpt-5.4',
      instructions: `
      Process queries using the provided context. Structure responses to be concise and relevant.
      ${S3VECTORS_PROMPT}
      `,
      tools: { vectorQueryTool },

    ```

### Re-ranking

Initial vector similarity search can sometimes miss nuanced relevance. Re-ranking is a more computationally expensive process, but more accurate algorithm that improves results by:

- Considering word order and exact matches
- Applying more sophisticated relevance scoring
- Using a method called cross-attention between query and documents

Here's how to use re-ranking:

```ts
// Get initial results from vector search
const initialResults = await pgVector.query({
  indexName: 'embeddings',
  queryVector: queryEmbedding,
  topK: 10,

// Create a relevance scorer
const relevanceProvider = new MastraAgentRelevanceScorer('relevance-scorer', 'openai/gpt-5.4')

// Re-rank the results
const rerankedResults = await rerank({
  results: initialResults,
  query,
  scorer: relevanceProvider,
  options: {
    weights: {
      semantic: 0.5, // How well the content matches the query semantically
      vector: 0.3, // Original vector similarity score
      position: 0.2, // Preserves original result ordering
    },
    topK: 10,
  },

```

The weights control how different factors influence the final ranking:

- `semantic`: Higher values prioritize semantic understanding and relevance to the query
- `vector`: Higher values favor the original vector similarity scores
- `position`: Higher values help maintain the original ordering of results

> **Note:**
For semantic scoring to work properly during re-ranking, each result must include the text content in its `metadata.text` field.


You can also use other relevance score providers like Cohere or ZeroEntropy:

```ts
const relevanceProvider = new CohereRelevanceScorer('rerank-v3.5')
```

```ts
const relevanceProvider = new ZeroEntropyRelevanceScorer('zerank-1')
```

The re-ranked results combine vector similarity with semantic understanding to improve retrieval quality.

For more details about re-ranking, see the [rerank()](/reference/rag/rerankWithScorer) method.

For graph-based retrieval that follows connections between chunks, see the [GraphRAG](/docs/rag/graph-rag) documentation.

---

# GraphRAG

Graph-based retrieval enhances traditional vector search by following relationships between chunks of information. This approach is useful when information is spread across multiple documents or when documents reference each other.

## When to use GraphRAG

GraphRAG is particularly effective when:

- Information is spread across multiple documents
- Documents reference each other
- You need to traverse relationships to find complete answers
- Understanding connections between concepts is important
- Simple vector similarity misses important contextual relationships

For straightforward semantic search without relationship traversal, use [standard retrieval methods](/docs/rag/retrieval).

## How GraphRAG works

GraphRAG combines vector similarity with knowledge graph traversal:

1. Initial vector search retrieves relevant chunks based on semantic similarity
1. A knowledge graph is constructed from the retrieved chunks
1. The graph is traversed to find connected information
1. Results include both directly relevant chunks and related content

This process helps surface information that might not be semantically similar to the query but is contextually relevant through connections.

## Creating a graph query tool

The Graph Query Tool provides agents with the ability to perform graph-based retrieval:

```ts
const graphQueryTool = createGraphRAGTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  graphOptions: {
    threshold: 0.7,
  },

```

### Configuration options

The `graphOptions` parameter controls how the knowledge graph is built and traversed:

- `threshold`: Similarity threshold (0-1) for determining which chunks are related. Higher values create sparser graphs with stronger connections; lower values create denser graphs with more potential relationships.
- `dimension`: Vector embedding dimension. Must match the embedding model's output dimension (e.g., 1536 for OpenAI's text-embedding-3-small).

```ts
const graphQueryTool = createGraphRAGTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  graphOptions: {

    threshold: 0.7,
  },

```

## Using GraphRAG with agents

Integrate the graph query tool with an agent to enable graph-based retrieval:

```ts
const ragAgent = new Agent({
  id: 'rag-agent',
  name: 'GraphRAG Agent',
  instructions: `You are a helpful assistant that answers questions based on the provided context.
When answering questions, use the graph query tool to find relevant information and relationships.
Base your answers on the context provided by the tool, and clearly state if the context doesn't contain enough information.`,
  model: 'openai/gpt-5.4',
  tools: {
    graphQueryTool,
  },

```

## Document processing and storage

Before using graph-based retrieval, process documents into chunks and store their embeddings:

```ts
// Create and chunk document
const doc = MDocument.fromText('Your document content here...')

const chunks = await doc.chunk({
  strategy: 'recursive',
  size: 512,
  overlap: 50,
  separator: '\n',

// Generate embeddings
const { embeddings } = await embedMany({
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  values: chunks.map(chunk => chunk.text),

// Store in vector database
const vectorStore = mastra.getVector('pgVector')
await vectorStore.createIndex({
  indexName: 'embeddings',

await vectorStore.upsert({
  indexName: 'embeddings',
  vectors: embeddings,
  metadata: chunks?.map(chunk => ({ text: chunk.text })),

```

## Querying with GraphRAG

Once configured, the agent can perform graph-based queries:

```ts
const query = 'What are the effects of infrastructure changes on local businesses?'
const response = await ragAgent.generate(query)
console.log(response.text)
```

The agent uses the graph query tool to:

1. Convert the query to an embedding
1. Find semantically similar chunks in the vector store
1. Build a knowledge graph from related chunks
1. Traverse the graph to find connected information
1. Return comprehensive context for generating the response

## Choosing the right threshold

The threshold parameter significantly impacts retrieval quality:

- **High threshold (0.8-0.9)**: Strict connections, fewer relationships, more precise but potentially incomplete results
- **Medium threshold (0.6-0.8)**: Balanced approach, good for most use cases
- **Low threshold (0.4-0.6)**: More connections, broader context, risk of including less relevant information

Start with 0.7 and adjust based on your specific use case:

```ts
// Strict connections for precise answers
const strictGraphTool = createGraphRAGTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  graphOptions: {
    threshold: 0.85,
  },

// Broader connections for exploratory queries
const broadGraphTool = createGraphRAGTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  graphOptions: {
    threshold: 0.5,
  },

```

## Combining with other retrieval methods

GraphRAG can be used alongside other retrieval approaches:

```ts
const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),

const graphQueryTool = createGraphRAGTool({
  vectorStoreName: 'pgVector',
  indexName: 'embeddings',
  model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  graphOptions: {
    threshold: 0.7,
  },

const agent = new Agent({
  id: 'rag-agent',
  name: 'RAG Agent',
  instructions: `Use vector search for simple fact-finding queries.
Use graph search when you need to understand relationships or find connected information.`,
  model: 'openai/gpt-5.4',
  tools: {
    vectorQueryTool,
    graphQueryTool,
  },

```

This gives the agent flexibility to choose the appropriate retrieval method based on the query.

## Reference

For detailed API documentation, see:

- [GraphRAG Class](/reference/rag/graph-rag)
- [createGraphRAGTool()](/reference/tools/graph-rag-tool)

---

# Storing embeddings in a vector database

After generating embeddings, you need to store them in a database that supports vector similarity search. Mastra provides a consistent interface for storing and querying embeddings across various vector databases.

## Supported databases


  ```ts title="vector-store.ts"
    import { MongoDBVector } from '@mastra/mongodb'

    const store = new MongoDBVector({
      id: 'mongodb-vector',
      uri: process.env.MONGODB_URI,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

    <h3>Using MongoDB Atlas Vector search</h3>

    For detailed setup instructions and best practices, see the [official MongoDB Atlas Vector Search documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/?utm_campaign=devrel\&utm_source=third-party-content\&utm_medium=cta\&utm_content=mastra-docs).

```ts
    import { PgVector } from '@mastra/pg'

    const store = new PgVector({
      id: 'pg-vector',
      connectionString: process.env.POSTGRES_CONNECTION_STRING,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

    <h3>Using PostgreSQL with pgvector</h3>

    PostgreSQL with the pgvector extension is a good solution for teams already using PostgreSQL who want to minimize infrastructure complexity.
    For detailed setup instructions and best practices, see the [official pgvector repository](https://github.com/pgvector/pgvector).

```ts
    import { PineconeVector } from '@mastra/pinecone'

    const store = new PineconeVector({
      id: 'pinecone-vector',
      apiKey: process.env.PINECONE_API_KEY,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { QdrantVector } from '@mastra/qdrant'

    const store = new QdrantVector({
      id: 'qdrant-vector',
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { ChromaVector } from '@mastra/chroma'

    // Running Chroma locally
    // const store = new ChromaVector()

    // Running on Chroma Cloud
    const store = new ChromaVector({
      id: 'chroma-vector',
      apiKey: process.env.CHROMA_API_KEY,
      tenant: process.env.CHROMA_TENANT,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { AstraVector } from '@mastra/astra'

    const store = new AstraVector({
      id: 'astra-vector',
      token: process.env.ASTRA_DB_TOKEN,
      endpoint: process.env.ASTRA_DB_ENDPOINT,
      keyspace: process.env.ASTRA_DB_KEYSPACE,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { LibSQLVector } from '@mastra/core/vector/libsql'

    const store = new LibSQLVector({
      id: 'libsql-vector',
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN, // Optional: for Turso cloud databases

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { UpstashVector } from '@mastra/upstash'

    // In upstash they refer to the store as an index
    const store = new UpstashVector({
      id: 'upstash-vector',
      url: process.env.UPSTASH_URL,
      token: process.env.UPSTASH_TOKEN,

    // There is no store.createIndex call here, Upstash creates indexes (known as namespaces in Upstash) automatically
    // when you upsert if that namespace does not exist yet.
    await store.upsert({
      indexName: 'myCollection', // the namespace name in Upstash
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { CloudflareVector } from '@mastra/vectorize'

    const store = new CloudflareVector({
      id: 'cloudflare-vector',
      accountId: process.env.CF_ACCOUNT_ID,
      apiToken: process.env.CF_API_TOKEN,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { OpenSearchVector } from '@mastra/opensearch'

    const store = new OpenSearchVector({ id: 'opensearch', node: process.env.OPENSEARCH_URL })

    await store.createIndex({
      indexName: 'my-collection',

    await store.upsert({
      indexName: 'my-collection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { ElasticSearchVector } from '@mastra/elasticsearch'

    const store = new ElasticSearchVector({
      id: 'elasticsearch-vector',
      url: process.env.ELASTICSEARCH_URL,
      auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY,
      },

    await store.createIndex({
      indexName: 'my-collection',

    await store.upsert({
      indexName: 'my-collection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

    <h3>Using Elasticsearch</h3>

    For detailed setup instructions and best practices, see the [official Elasticsearch documentation](https://www.elastic.co/docs/solutions/search/get-started).

```ts
    import { CouchbaseVector } from '@mastra/couchbase'

    const store = new CouchbaseVector({
      id: 'couchbase-vector',
      connectionString: process.env.COUCHBASE_CONNECTION_STRING,
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
      bucketName: process.env.COUCHBASE_BUCKET,
      scopeName: process.env.COUCHBASE_SCOPE,
      collectionName: process.env.COUCHBASE_COLLECTION,

    await store.createIndex({
      indexName: 'myCollection',

    await store.upsert({
      indexName: 'myCollection',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

```ts
    import { LanceVectorStore } from '@mastra/lance'

    const store = await LanceVectorStore.create('/path/to/db')

    await store.createIndex({
      tableName: 'myVectors',
      indexName: 'myCollection',

    await store.upsert({
      tableName: 'myVectors',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

    <h3>Using LanceDB</h3>

    LanceDB is an embedded vector database built on the Lance columnar format, suitable for local development or cloud deployment.
    For detailed setup instructions and best practices, see the [official LanceDB documentation](https://lancedb.github.io/lancedb/).

```ts
    import { S3Vectors } from '@mastra/s3vectors'

    const store = new S3Vectors({
      id: 's3-vectors',
      vectorBucketName: 'my-vector-bucket',
      clientConfig: {
        region: 'us-east-1',
      },
      nonFilterableMetadataKeys: ['content'],

    await store.createIndex({
      indexName: 'my-index',

    await store.upsert({
      indexName: 'my-index',
      vectors: embeddings,
      metadata: chunks.map(chunk => ({ text: chunk.text })),

    ```

## Using vector storage

Once initialized, all vector stores share the same interface for creating indexes, upserting embeddings, and querying.

### Creating Indexes

Before storing embeddings, you need to create an index with the appropriate dimension size for your embedding model:

```ts
// Create an index with dimension 1536 (for text-embedding-3-small)
await store.createIndex({
  indexName: 'myCollection',

```

The dimension size must match the output dimension of your chosen embedding model. Common dimension sizes are:

- `OpenAI text-embedding-3-small`: 1536 dimensions (or custom, e.g., 256)
- `Cohere embed-multilingual-v3`: 1024 dimensions
- `Google gemini-embedding-001`: 768 dimensions (or custom)

> **Warning:**
Index dimensions can't be changed after creation. To use a different model, delete and recreate the index with the new dimension size.


### Naming Rules for Databases

Each vector database enforces specific naming conventions for indexes and collections to ensure compatibility and prevent conflicts.


  Collection (index) names must:

    - Start with a letter or underscore
    - Be up to 120 bytes long
    - Contain only letters, numbers, underscores, or dots
    - Cannot contain `$` or the null character
    - Example: `my_collection.123` is valid
    - Example: `my-index` is not valid (contains hyphen)
    - Example: `My$Collection` is not valid (contains `$`)

Index names must:

    - Start with a letter or underscore
    - Contain only letters, numbers, and underscores
    - Example: `my_index_123` is valid
    - Example: `my-index` is not valid (contains hyphen)

Index names must:

    - Use only lowercase letters, numbers, and dashes
    - Not contain dots (used for DNS routing)
    - Not use non-Latin characters or emojis
    - Have a combined length (with project ID) under 52 characters
      - Example: `my-index-123` is valid
      - Example: `my.index` is not valid (contains dot)

Collection names must:

    - Be 1-255 characters long
    - Not contain any of these special characters:
      - `< > : " / \ | ? *`
      - Null character (`\0`)
      - Unit separator (`\u{1F}`)
    - Example: `my_collection_123` is valid
    - Example: `my/collection` is not valid (contains slash)

Collection names must:

    - Be 3-63 characters long
    - Start and end with a letter or number
    - Contain only letters, numbers, underscores, or hyphens
    - Not contain consecutive periods (..)
    - Not be a valid IPv4 address
    - Example: `my-collection-123` is valid
    - Example: `my..collection` is not valid (consecutive periods)

Collection names must:

    - Not be empty
    - Be 48 characters or less
    - Contain only letters, numbers, and underscores
    - Example: `my_collection_123` is valid
    - Example: `my-collection` is not valid (contains hyphen)

Index names must:

    - Start with a letter or underscore
    - Contain only letters, numbers, and underscores
    - Example: `my_index_123` is valid
    - Example: `my-index` is not valid (contains hyphen)

Namespace names must:

    - Be 2-100 characters long
    - Contain only:
      - Alphanumeric characters (a-z, A-Z, 0-9)
      - Underscores, hyphens, dots
    - Not start or end with special characters (\_, -, .)
    - Can be case-sensitive
    - Example: `MyNamespace123` is valid
    - Example: `_namespace` is not valid (starts with underscore)

Index names must:

    - Start with a letter
    - Be shorter than 32 characters
    - Contain only lowercase ASCII letters, numbers, and dashes
    - Use dashes instead of spaces
    - Example: `my-index-123` is valid
    - Example: `My_Index` is not valid (uppercase and underscore)

Index names must:

    - Use only lowercase letters
    - Not begin with underscores or hyphens
    - Not contain spaces, commas
    - Not contain special characters (e.g. `:`, `"`, `*`, `+`, `/`, `\`, `|`, `?`, `#`, `>`, `<`)
    - Example: `my-index-123` is valid
    - Example: `My_Index` is not valid (contains uppercase letters)
    - Example: `_myindex` is not valid (begins with underscore)

Index names must:

    - Use only lowercase letters
    - Not exceed 255 bytes (counting multi-byte characters)
    - Not begin with underscores, hyphens, or plus signs
    - Not contain spaces, commas
    - Not contain special characters (e.g. `:`, `"`, `*`, `+`, `/`, `\`, `|`, `?`, `#`, `>`, `<`)
    - Not be "." or ".."
    - Not start with "." (deprecated except for system/hidden indices)
    - Example: `my-index-123` is valid
    - Example: `My_Index` is not valid (contains uppercase letters)
    - Example: `_myindex` is not valid (begins with underscore)
    - Example: `.myindex` is not valid (begins with dot, deprecated)

Index names must:

    - Be unique within the same vector bucket
    - Be 3–63 characters long
    - Use only lowercase letters (`a–z`), numbers (`0–9`), hyphens (`-`), and dots (`.`)
    - Begin and end with a letter or number
    - Example: `my-index.123` is valid
    - Example: `my_index` is not valid (contains underscore)
    - Example: `-myindex` is not valid (begins with hyphen)
    - Example: `myindex-` is not valid (ends with hyphen)
    - Example: `MyIndex` is not valid (contains uppercase letters)

### Upserting Embeddings

After creating an index, you can store embeddings along with their basic metadata:

```ts
// Store embeddings with their corresponding metadata
await store.upsert({
  indexName: 'myCollection', // index name
  vectors: embeddings, // array of embedding vectors
  metadata: chunks.map(chunk => ({
    text: chunk.text, // The original text content
    id: chunk.id, // Optional unique identifier
  })),

```

The upsert operation:

- Takes an array of embedding vectors and their corresponding metadata
- Updates existing vectors if they share the same ID
- Creates new vectors if they don't exist
- Automatically handles batching for large datasets

## Adding metadata

Vector stores support rich metadata (any JSON-serializable fields) for filtering and organization. Since metadata is stored with no fixed schema, use consistent field naming to avoid unexpected query results.

> **Warning:**
Metadata is crucial for vector storage - without it, you'd only have numerical embeddings with no way to return the original text or filter results. Always store at least the source text as metadata.


```ts
// Store embeddings with rich metadata for better organization and filtering
await store.upsert({
  indexName: 'myCollection',
  vectors: embeddings,
  metadata: chunks.map(chunk => ({
    // Basic content
    text: chunk.text,
    id: chunk.id,

    // Document organization
    source: chunk.source,
    category: chunk.category,

    // Temporal metadata
    createdAt: new Date().toISOString(),
    version: '1.0',

    // Custom fields
    language: chunk.language,
    author: chunk.author,
    confidenceScore: chunk.score,
  })),

```

Key metadata considerations:

- Be strict with field naming - inconsistencies like 'category' vs 'Category' will affect queries
- Only include fields you plan to filter or sort by - extra fields add overhead
- Add timestamps (e.g., 'createdAt', 'lastUpdated') to track content freshness

## Deleting vectors

When building RAG applications, you often need to clean up stale vectors when documents are deleted or updated. Mastra provides the `deleteVectors` method that supports deleting vectors by metadata filters, making it straightforward to remove all embeddings associated with a specific document.

### Delete by Metadata Filter

The most common use case is deleting all vectors for a specific document when a user deletes it:

```ts
// Delete all vectors for a specific document
await store.deleteVectors({
  indexName: 'myCollection',
  filter: { docId: 'document-123' },

```

This is particularly useful when:

- A user deletes a document and you need to remove all its chunks
- You're re-indexing a document and want to remove old vectors first
- You need to clean up vectors for a specific user or tenant

### Delete Multiple Documents

You can also use complex filters to delete vectors matching multiple conditions:

```ts
// Delete all vectors for multiple documents
await store.deleteVectors({
  indexName: 'myCollection',
  filter: {
    docId: { $in: ['doc-1', 'doc-2', 'doc-3'] },
  },

// Delete vectors for a specific user's documents
await store.deleteVectors({
  indexName: 'myCollection',
  filter: {
    $and: [{ userId: 'user-123' }, { status: 'archived' }],
  },

```

### Delete by Vector IDs

If you have specific vector IDs to delete, you can pass them directly:

```ts
// Delete specific vectors by their IDs
await store.deleteVectors({
  indexName: 'myCollection',
  ids: ['vec-1', 'vec-2', 'vec-3'],

```

## Best practices

- Create indexes before bulk insertions
- Use batch operations for large insertions (the upsert method handles batching automatically)
- Only store metadata you'll query against
- Match embedding dimensions to your model (e.g., 1536 for `text-embedding-3-small`)

---



# Voice

# Voice in Mastra

Mastra's Voice system provides a unified interface for voice interactions, enabling text-to-speech (TTS), speech-to-text (STT), and real-time speech-to-speech (STS) capabilities in your applications.

## Adding voice to agents

To learn how to integrate voice capabilities into your agents, check out the [Adding Voice to Agents](/docs/agents/adding-voice) documentation. This section covers how to use both single and multiple voice providers, as well as real-time interactions.

```typescript
// Initialize OpenAI voice for TTS

const voiceAgent = new Agent({
  id: 'voice-agent',
  name: 'Voice Agent',
  instructions: 'You are a voice assistant that can help users with their tasks.',
  model: 'openai/gpt-5.4',
  voice: new OpenAIVoice(),

```

You can then use the following voice capabilities:

### Text to Speech (TTS)

Turn your agent's responses into natural-sounding speech using Mastra's TTS capabilities.
Choose from multiple providers like OpenAI, ElevenLabs, and more.

For detailed configuration options and advanced features, check out our [Text-to-Speech guide](./text-to-speech).


  ```typescript
    import { Agent } from '@mastra/core/agent'
    import { OpenAIVoice } from '@mastra/voice-openai'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new OpenAIVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'default', // Optional: specify a speaker
      responseFormat: 'wav', // Optional: specify a response format

    playAudio(audioStream)
    ```

    Visit the [OpenAI Voice Reference](/reference/voice/openai) for more information on the OpenAI voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { AzureVoice } from '@mastra/voice-azure'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new AzureVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'en-US-JennyNeural', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Azure Voice Reference](/reference/voice/azure) for more information on the Azure voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { ElevenLabsVoice } from '@mastra/voice-elevenlabs'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new ElevenLabsVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'default', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [ElevenLabs Voice Reference](/reference/voice/elevenlabs) for more information on the ElevenLabs voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { PlayAIVoice } from '@mastra/voice-playai'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new PlayAIVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'default', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [PlayAI Voice Reference](/reference/voice/playai) for more information on the PlayAI voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { GoogleVoice } from '@mastra/voice-google'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new GoogleVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'en-US-Studio-O', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Google Voice Reference](/reference/voice/google) for more information on the Google voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { CloudflareVoice } from '@mastra/voice-cloudflare'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new CloudflareVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'default', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Cloudflare Voice Reference](/reference/voice/cloudflare) for more information on the Cloudflare voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { DeepgramVoice } from '@mastra/voice-deepgram'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new DeepgramVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'aura-english-us', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Deepgram Voice Reference](/reference/voice/deepgram) for more information on the Deepgram voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { SpeechifyVoice } from '@mastra/voice-speechify'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new SpeechifyVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'matthew', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Speechify Voice Reference](/reference/voice/speechify) for more information on the Speechify voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { SarvamVoice } from '@mastra/voice-sarvam'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new SarvamVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'default', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Sarvam Voice Reference](/reference/voice/sarvam) for more information on the Sarvam voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { MurfVoice } from '@mastra/voice-murf'
    import { playAudio } from '@mastra/node-audio'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new MurfVoice(),

    const { text } = await voiceAgent.generate('What color is the sky?')

    // Convert text to speech to an Audio Stream
    const audioStream = await voiceAgent.voice.speak(text, {
      speaker: 'default', // Optional: specify a speaker

    playAudio(audioStream)
    ```

    Visit the [Murf Voice Reference](/reference/voice/murf) for more information on the Murf voice provider.

### Speech to Text (STT)

Transcribe spoken content using various providers like OpenAI, ElevenLabs, and more. For detailed configuration options and more, check out [Speech to Text](./speech-to-text).

You can download a sample audio file from [here](https://github.com/mastra-ai/realtime-voice-demo/raw/refs/heads/main/how_can_i_help_you.mp3).


  ```typescript
    import { Agent } from '@mastra/core/agent'
    import { OpenAIVoice } from '@mastra/voice-openai'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new OpenAIVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [OpenAI Voice Reference](/reference/voice/openai) for more information on the OpenAI voice provider.

```typescript
    import { createReadStream } from 'fs'
    import { Agent } from '@mastra/core/agent'
    import { AzureVoice } from '@mastra/voice-azure'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new AzureVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [Azure Voice Reference](/reference/voice/azure) for more information on the Azure voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { ElevenLabsVoice } from '@mastra/voice-elevenlabs'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new ElevenLabsVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [ElevenLabs Voice Reference](/reference/voice/elevenlabs) for more information on the ElevenLabs voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { GoogleVoice } from '@mastra/voice-google'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new GoogleVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [Google Voice Reference](/reference/voice/google) for more information on the Google voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { CloudflareVoice } from '@mastra/voice-cloudflare'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new CloudflareVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [Cloudflare Voice Reference](/reference/voice/cloudflare) for more information on the Cloudflare voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { DeepgramVoice } from '@mastra/voice-deepgram'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new DeepgramVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [Deepgram Voice Reference](/reference/voice/deepgram) for more information on the Deepgram voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { SarvamVoice } from '@mastra/voice-sarvam'
    import { createReadStream } from 'fs'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new SarvamVoice(),

    // Use an audio file from a URL
    const audioStream = await createReadStream('./how_can_i_help_you.mp3')

    // Convert audio to text
    const transcript = await voiceAgent.voice.listen(audioStream)
    console.log(`User said: ${transcript}`)

    // Generate a response based on the transcript
    const { text } = await voiceAgent.generate(transcript)
    ```

    Visit the [Sarvam Voice Reference](/reference/voice/sarvam) for more information on the Sarvam voice provider.

### Speech to Speech (STS)

Create conversational experiences with speech-to-speech capabilities. The unified API enables real-time voice interactions between users and AI agents.
For detailed configuration options and advanced features, check out [Speech to Speech](./speech-to-speech).


  ```typescript
    import { Agent } from '@mastra/core/agent'
    import { playAudio, getMicrophoneStream } from '@mastra/node-audio'
    import { OpenAIRealtimeVoice } from '@mastra/voice-openai-realtime'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new OpenAIRealtimeVoice(),

    // Listen for agent audio responses
    voiceAgent.voice.on('speaker', ({ audio }) => {
      playAudio(audio)

    // Initiate the conversation
    await voiceAgent.voice.speak('How can I help you today?')

    // Send continuous audio from the microphone
    const micStream = getMicrophoneStream()
    await voiceAgent.voice.send(micStream)
    ```

    Visit the [OpenAI Voice Reference](/reference/voice/openai-realtime) for more information on the OpenAI voice provider.

```typescript
    import { Agent } from '@mastra/core/agent'
    import { playAudio, getMicrophoneStream } from '@mastra/node-audio'
    import { GeminiLiveVoice } from '@mastra/voice-google-gemini-live'

    const voiceAgent = new Agent({
      id: 'voice-agent',
      name: 'Voice Agent',
      instructions: 'You are a voice assistant that can help users with their tasks.',
      model: 'openai/gpt-5.4',
      voice: new GeminiLiveVoice({
        // Live API mode
        apiKey: process.env.GOOGLE_API_KEY,
        model: 'gemini-2.0-flash-exp',
        speaker: 'Puck',

        // Vertex AI alternative:
        // vertexAI: true,
        // project: 'your-gcp-project',
        // location: 'us-central1',
        // serviceAccountKeyFile: '/path/to/service-account.json',
      }),

    // Connect before using speak/send
    await voiceAgent.voice.connect()

    // Listen for agent audio responses
    voiceAgent.voice.on('speaker', ({ audio }) => {
      playAudio(audio)

    // Listen for text responses and transcriptions
    voiceAgent.voice.on('writing', ({ text, role }) => {
      console.log(`${role}: ${text}`)

    // Initiate the conversation
    await voiceAgent.voice.speak('How can I help you today?')

    // Send continuous audio from the microphone
    const micStream = getMicrophoneStream()
    await voiceAgent.voice.send(micStream)
    ```

    Visit the [Google Gemini Live Reference](/reference/voice/google-gemini-live) for more information on the Google Gemini Live voice provider.

## Voice configuration

Each voice provider can be configured with different models and options. Below are the detailed configuration options for all supported providers:


  ```typescript
    // OpenAI Voice Configuration
    const voice = new OpenAIVoice({
      speechModel: {
        name: 'gpt-3.5-turbo', // Example model name
        apiKey: process.env.OPENAI_API_KEY,
        language: 'en-US', // Language code
        voiceType: 'neural', // Type of voice model
      },
      listeningModel: {
        name: 'whisper-1', // Example model name
        apiKey: process.env.OPENAI_API_KEY,
        language: 'en-US', // Language code
        format: 'wav', // Audio format
      },
      speaker: 'alloy', // Example speaker name

    ```

    Visit the [OpenAI Voice Reference](/reference/voice/openai) for more information on the OpenAI voice provider.

```typescript
    // Azure Voice Configuration
    const voice = new AzureVoice({
      speechModel: {
        name: 'en-US-JennyNeural', // Example model name
        apiKey: process.env.AZURE_SPEECH_KEY,
        region: process.env.AZURE_SPEECH_REGION,
        language: 'en-US', // Language code
        style: 'cheerful', // Voice style
        pitch: '+0Hz', // Pitch adjustment
        rate: '1.0', // Speech rate
      },
      listeningModel: {
        name: 'en-US', // Example model name
        apiKey: process.env.AZURE_SPEECH_KEY,
        region: process.env.AZURE_SPEECH_REGION,
        format: 'simple', // Output format
      },

    ```

    Visit the [Azure Voice Reference](/reference/voice/azure) for more information on the Azure voice provider.

```typescript
    // ElevenLabs Voice Configuration
    const voice = new ElevenLabsVoice({
      speechModel: {
        voiceId: 'your-voice-id', // Example voice ID
        model: 'eleven_multilingual_v2', // Example model name
        apiKey: process.env.ELEVENLABS_API_KEY,
        language: 'en', // Language code
        emotion: 'neutral', // Emotion setting
      },
      // ElevenLabs may not have a separate listening model

    ```

    Visit the [ElevenLabs Voice Reference](/reference/voice/elevenlabs) for more information on the ElevenLabs voice provider.

```typescript
    // PlayAI Voice Configuration
    const voice = new PlayAIVoice({
      speechModel: {
        name: 'playai-voice', // Example model name
        speaker: 'emma', // Example speaker name
        apiKey: process.env.PLAYAI_API_KEY,
        language: 'en-US', // Language code
        speed: 1.0, // Speech speed
      },
      // PlayAI may not have a separate listening model

    ```

    Visit the [PlayAI Voice Reference](/reference/voice/playai) for more information on the PlayAI voice provider.

```typescript
    // Google Voice Configuration
    const voice = new GoogleVoice({
      speechModel: {
        name: 'en-US-Studio-O', // Example model name
        apiKey: process.env.GOOGLE_API_KEY,
        languageCode: 'en-US', // Language code
        gender: 'FEMALE', // Voice gender
        speakingRate: 1.0, // Speaking rate
      },
      listeningModel: {
        name: 'en-US', // Example model name
        sampleRateHertz: 16000, // Sample rate
      },

    ```

    Visit the [Google Voice Reference](/reference/voice/google) for more information on the Google voice provider.

```typescript
    // Cloudflare Voice Configuration
    const voice = new CloudflareVoice({
      speechModel: {
        name: 'cloudflare-voice', // Example model name
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
        apiToken: process.env.CLOUDFLARE_API_TOKEN,
        language: 'en-US', // Language code
        format: 'mp3', // Audio format
      },
      // Cloudflare may not have a separate listening model

    ```

    Visit the [Cloudflare Voice Reference](/reference/voice/cloudflare) for more information on the Cloudflare voice provider.

```typescript
    // Deepgram Voice Configuration
    const voice = new DeepgramVoice({
      speechModel: {
        name: 'nova-2', // Example model name
        speaker: 'aura-english-us', // Example speaker name
        apiKey: process.env.DEEPGRAM_API_KEY,
        language: 'en-US', // Language code
        tone: 'formal', // Tone setting
      },
      listeningModel: {
        name: 'nova-2', // Example model name
        format: 'flac', // Audio format
      },

    ```

    Visit the [Deepgram Voice Reference](/reference/voice/deepgram) for more information on the Deepgram voice provider.

```typescript
    // Speechify Voice Configuration
    const voice = new SpeechifyVoice({
      speechModel: {
        name: 'speechify-voice', // Example model name
        speaker: 'matthew', // Example speaker name
        apiKey: process.env.SPEECHIFY_API_KEY,
        language: 'en-US', // Language code
        speed: 1.0, // Speech speed
      },
      // Speechify may not have a separate listening model

    ```

    Visit the [Speechify Voice Reference](/reference/voice/speechify) for more information on the Speechify voice provider.

```typescript
    // Sarvam Voice Configuration
    const voice = new SarvamVoice({
      speechModel: {
        name: 'sarvam-voice', // Example model name
        apiKey: process.env.SARVAM_API_KEY,
        language: 'en-IN', // Language code
        style: 'conversational', // Style setting
      },
      // Sarvam may not have a separate listening model

    ```

    Visit the [Sarvam Voice Reference](/reference/voice/sarvam) for more information on the Sarvam voice provider.

```typescript
    // Murf Voice Configuration
    const voice = new MurfVoice({
      speechModel: {
        name: 'murf-voice', // Example model name
        apiKey: process.env.MURF_API_KEY,
        language: 'en-US', // Language code
        emotion: 'happy', // Emotion setting
      },
      // Murf may not have a separate listening model

    ```

    Visit the [Murf Voice Reference](/reference/voice/murf) for more information on the Murf voice provider.

```typescript
    // OpenAI Realtime Voice Configuration
    const voice = new OpenAIRealtimeVoice({
      speechModel: {
        name: 'gpt-3.5-turbo', // Example model name
        apiKey: process.env.OPENAI_API_KEY,
        language: 'en-US', // Language code
      },
      listeningModel: {
        name: 'whisper-1', // Example model name
        apiKey: process.env.OPENAI_API_KEY,
        format: 'ogg', // Audio format
      },
      speaker: 'alloy', // Example speaker name

    ```

    For more information on the OpenAI Realtime voice provider, refer to the [OpenAI Realtime Voice Reference](/reference/voice/openai-realtime).

```typescript
    // Google Gemini Live Voice Configuration
    const voice = new GeminiLiveVoice({
      speechModel: {
        name: 'gemini-2.0-flash-exp', // Example model name
        apiKey: process.env.GOOGLE_API_KEY,
      },
      speaker: 'Puck', // Example speaker name
      // Google Gemini Live is a realtime bidirectional API without separate speech and listening models

    ```

    Visit the [Google Gemini Live Reference](/reference/voice/google-gemini-live) for more information on the Google Gemini Live voice provider.

```typescript
    // AI SDK Voice Configuration
    import { CompositeVoice } from '@mastra/core/voice'
    import { openai } from '@ai-sdk/openai'
    import { elevenlabs } from '@ai-sdk/elevenlabs'

    // Use AI SDK models directly - no need to install separate packages
    const voice = new CompositeVoice({
      input: openai.transcription('whisper-1'), // AI SDK transcription
      output: elevenlabs.speech('eleven_turbo_v2'), // AI SDK speech

    // Works seamlessly with your agent
    const voiceAgent = new Agent({
      id: 'aisdk-voice-agent',
      name: 'AI SDK Voice Agent',
      instructions: 'You are a helpful assistant with voice capabilities.',
      model: 'openai/gpt-5.4',
      voice,

    ```

### Using Multiple Voice Providers

This example demonstrates how to create and use two different voice providers in Mastra: OpenAI for speech-to-text (STT) and PlayAI for text-to-speech (TTS).

Start by creating instances of the voice providers with any necessary configuration.

```typescript
// Initialize OpenAI voice for STT
const input = new OpenAIVoice({
  listeningModel: {
    name: 'whisper-1',
    apiKey: process.env.OPENAI_API_KEY,
  },

// Initialize PlayAI voice for TTS
const output = new PlayAIVoice({
  speechModel: {
    name: 'playai-voice',
    apiKey: process.env.PLAYAI_API_KEY,
  },

// Combine the providers using CompositeVoice
const voice = new CompositeVoice({
  input,
  output,

// Implement voice interactions using the combined voice provider
const audioStream = getMicrophoneStream() // Assume this function gets audio input
const transcript = await voice.listen(audioStream)

// Log the transcribed text
console.log('Transcribed text:', transcript)

// Convert text to speech
const responseAudio = await voice.speak(`You said: ${transcript}`, {
  speaker: 'default', // Optional: specify a speaker,
  responseFormat: 'wav', // Optional: specify a response format

// Play the audio response
playAudio(responseAudio)
```

### Using AI SDK Model Providers

You can also use AI SDK models directly with `CompositeVoice`:

```typescript
// Use AI SDK models directly - no provider setup needed
const voice = new CompositeVoice({
  input: openai.transcription('whisper-1'), // AI SDK transcription
  output: elevenlabs.speech('eleven_turbo_v2'), // AI SDK speech

// Works the same way as Mastra providers
const audioStream = getMicrophoneStream()
const transcript = await voice.listen(audioStream)

console.log('Transcribed text:', transcript)

// Convert text to speech
const responseAudio = await voice.speak(`You said: ${transcript}`, {
  speaker: 'Rachel', // ElevenLabs voice

playAudio(responseAudio)
```

You can also mix AI SDK models with Mastra providers:

```typescript
const voice = new CompositeVoice({
  input: groq.transcription('whisper-large-v3'), // AI SDK for STT
  output: new PlayAIVoice(), // Mastra provider for TTS

```

For more information on the CompositeVoice, refer to the [CompositeVoice Reference](/reference/voice/composite-voice).

## More resources

- [CompositeVoice](/reference/voice/composite-voice)
- [MastraVoice](/reference/voice/mastra-voice)
- [OpenAI Voice](/reference/voice/openai)
- [OpenAI Realtime Voice](/reference/voice/openai-realtime)
- [Azure Voice](/reference/voice/azure)
- [Google Voice](/reference/voice/google)
- [Google Gemini Live Voice](/reference/voice/google-gemini-live)
- [Deepgram Voice](/reference/voice/deepgram)
- [PlayAI Voice](/reference/voice/playai)
- [Voice Examples](https://github.com/mastra-ai/voice-examples)

---

# Text-to-Speech (TTS)

Text-to-Speech (TTS) in Mastra offers a unified API for synthesizing spoken audio from text using various providers.
By incorporating TTS into your applications, you can enhance user experience with natural voice interactions, improve accessibility for users with visual impairments, and create more engaging multimodal interfaces.

TTS is a core component of any voice application. Combined with STT (Speech-to-Text), it forms the foundation of voice interaction systems. Newer models support STS ([Speech-to-Speech](./speech-to-speech)) which can be used for real-time interactions but come at high cost ($).

## Configuration

To use TTS in Mastra, you need to provide a `speechModel` when initializing the voice provider. This includes parameters such as:

- **`name`**: The specific TTS model to use.
- **`apiKey`**: Your API key for authentication.
- **Provider-specific options**: Additional options that may be required or supported by the specific voice provider.

The **`speaker`** option allows you to select different voices for speech synthesis. Each provider offers a variety of voice options with distinct characteristics for **Voice diversity**, **Quality**, **Voice personality**, and **Multilingual support**

**Note**: All of these parameters are optional. You can use the default settings provided by the voice provider, which will depend on the specific provider you are using.

```typescript
const voice = new OpenAIVoice({
  speechModel: {
    name: 'tts-1-hd',
    apiKey: process.env.OPENAI_API_KEY,
  },
  speaker: 'alloy',

// If using default settings the configuration can be simplified to:
const voice = new OpenAIVoice()
```

## Available providers

Mastra supports a wide range of Text-to-Speech providers, each with their own unique capabilities and voice options. You can choose the provider that best suits your application's needs:

- [**OpenAI**](/reference/voice/openai/) - High-quality voices with natural intonation and expression
- [**Azure**](/reference/voice/azure/) - Microsoft's speech service with a wide range of voices and languages
- [**ElevenLabs**](/reference/voice/elevenlabs/) - Ultra-realistic voices with emotion and fine-grained control
- [**PlayAI**](/reference/voice/playai/) - Specialized in natural-sounding voices with various styles
- [**Google**](/reference/voice/google/) - Google's speech synthesis with multilingual support
- [**Cloudflare**](/reference/voice/cloudflare/) - Edge-optimized speech synthesis for low-latency applications
- [**Deepgram**](/reference/voice/deepgram/) - AI-powered speech technology with high accuracy
- [**Speechify**](/reference/voice/speechify/) - Text-to-speech optimized for readability and accessibility
- [**Sarvam**](/reference/voice/sarvam/) - Specialized in Indic languages and accents
- [**Murf**](/reference/voice/murf/) - Studio-quality voice overs with customizable parameters

Each provider is implemented as a separate package that you can install as needed:

```bash
pnpm add @mastra/voice-openai@latest  # Example for OpenAI
```

## Using the speak method

The primary method for TTS is the `speak()` method, which converts text to speech. This method can accept options that allows you to specify the speaker and other provider-specific options. Here's how to use it:

```typescript
const voice = new OpenAIVoice()

const agent = new Agent({
  id: 'voice-agent',
  name: 'Voice Agent',
  instructions: 'You are a voice assistant that can help users with their tasks.',
  model: 'openai/gpt-5.4',
  voice,

const { text } = await agent.generate('What color is the sky?')

// Convert text to speech to an Audio Stream
const readableStream = await voice.speak(text, {
  speaker: 'default', // Optional: specify a speaker
  properties: {
    speed: 1.0, // Optional: adjust speech speed
    pitch: 'default', // Optional: specify pitch if supported
  },

```

Check out the [Adding Voice to Agents](/docs/agents/adding-voice) documentation to learn how to use TTS in an agent.

---

# Speech-to-Text (STT)

Speech-to-Text (STT) in Mastra provides a standardized interface for converting audio input into text across multiple service providers.
STT helps create voice-enabled applications that can respond to human speech, enabling hands-free interaction, accessibility for users with disabilities, and more natural human-computer interfaces.

## Configuration

To use STT in Mastra, you need to provide a `listeningModel` when initializing the voice provider. This includes parameters such as:

- **`name`**: The specific STT model to use.
- **`apiKey`**: Your API key for authentication.
- **Provider-specific options**: Additional options that may be required or supported by the specific voice provider.

**Note**: All of these parameters are optional. You can use the default settings provided by the voice provider, which will depend on the specific provider you are using.

```typescript
const voice = new OpenAIVoice({
  listeningModel: {
    name: 'whisper-1',
    apiKey: process.env.OPENAI_API_KEY,
  },

// If using default settings the configuration can be simplified to:
const voice = new OpenAIVoice()
```

## Available providers

Mastra supports several Speech-to-Text providers, each with their own capabilities and strengths:

- [**OpenAI**](/reference/voice/openai/) - High-accuracy transcription with Whisper models
- [**Azure**](/reference/voice/azure/) - Microsoft's speech recognition with enterprise-grade reliability
- [**ElevenLabs**](/reference/voice/elevenlabs/) - Advanced speech recognition with support for multiple languages
- [**Google**](/reference/voice/google/) - Google's speech recognition with extensive language support
- [**Cloudflare**](/reference/voice/cloudflare/) - Edge-optimized speech recognition for low-latency applications
- [**Deepgram**](/reference/voice/deepgram/) - AI-powered speech recognition with high accuracy for various accents
- [**Sarvam**](/reference/voice/sarvam/) - Specialized in Indic languages and accents

Each provider is implemented as a separate package that you can install as needed:

```bash
pnpm add @mastra/voice-openai@latest  # Example for OpenAI
```

## Using the listen method

The primary method for STT is the `listen()` method, which converts spoken audio into text. Here's how to use it:

```typescript
const voice = new OpenAIVoice()

const agent = new Agent({
  id: 'voice-agent',
  name: 'Voice Agent',
  instructions: 'You are a voice assistant that provides recommendations based on user input.',
  model: 'openai/gpt-5.4',
  voice,

const audioStream = getMicrophoneStream() // Assume this function gets audio input

const transcript = await agent.voice.listen(audioStream, {
  filetype: 'm4a', // Optional: specify the audio file type

console.log(`User said: ${transcript}`)

const { text } = await agent.generate(
  `Based on what the user said, provide them a recommendation: ${transcript}`,

console.log(`Recommendation: ${text}`)
```

Check out the [Adding Voice to Agents](/docs/agents/adding-voice) documentation to learn how to use STT in an agent.

---

# Speech-to-Speech capabilities in Mastra

## Introduction

Speech-to-Speech (STS) in Mastra provides a standardized interface for real-time interactions across multiple providers.
STS enables continuous bidirectional audio communication through listening to events from Realtime models. Unlike separate TTS and STT operations, STS maintains an open connection that processes speech continuously in both directions.

## Configuration

- **`apiKey`**: Your OpenAI API key. Falls back to the `OPENAI_API_KEY` environment variable.
- **`model`**: The model ID to use for real-time voice interactions (e.g., `gpt-5.1-realtime`).
- **`speaker`**: The default voice ID for speech synthesis. This allows you to specify which voice to use for the speech output.

```typescript
const voice = new OpenAIRealtimeVoice({
  apiKey: 'your-openai-api-key',
  model: 'gpt-5.1-realtime',
  speaker: 'alloy', // Default voice

// If using default settings the configuration can be simplified to:
const voice = new OpenAIRealtimeVoice()
```

## Using STS

```typescript
const agent = new Agent({
  id: 'agent',
  name: 'OpenAI Realtime Agent',
  instructions: `You are a helpful assistant with real-time voice capabilities.`,
  model: 'openai/gpt-5.4',
  voice: new OpenAIRealtimeVoice(),

// Connect to the voice service
await agent.voice.connect()

// Listen for agent audio responses
agent.voice.on('speaker', ({ audio }) => {
  playAudio(audio)

// Initiate the conversation
await agent.voice.speak('How can I help you today?')

// Send continuous audio from the microphone
const micStream = getMicrophoneStream()
await agent.voice.send(micStream)
```

For integrating Speech-to-Speech capabilities with agents, refer to the [Adding Voice to Agents](/docs/agents/adding-voice) documentation.

## Google Gemini Live (Realtime)

```typescript
const agent = new Agent({
  id: 'agent',
  name: 'Gemini Live Agent',
  instructions: 'You are a helpful assistant with real-time voice capabilities.',
  // Model used for text generation; voice provider handles realtime audio
  model: 'openai/gpt-5.4',
  voice: new GeminiLiveVoice({
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'gemini-2.0-flash-exp',
    speaker: 'Puck',

    // Vertex AI option:
    // vertexAI: true,
    // project: 'your-gcp-project',
    // location: 'us-central1',
    // serviceAccountKeyFile: '/path/to/service-account.json',
  }),

await agent.voice.connect()

agent.voice.on('speaker', ({ audio }) => {
  playAudio(audio)

agent.voice.on('writing', ({ role, text }) => {
  console.log(`${role}: ${text}`)

await agent.voice.speak('How can I help you today?')

const micStream = getMicrophoneStream()
await agent.voice.send(micStream)
```

Note:

- Live API requires `GOOGLE_API_KEY`. Vertex AI requires project/location and service account credentials.
- Events: `speaker` (audio stream), `writing` (text), `turnComplete`, `usage`, and `error`.

---



# Streaming

# Streaming overview

Mastra supports real-time, incremental responses from agents and workflows, allowing users to see output as it’s generated instead of waiting for completion. This is useful for chat, long-form content, multi-step workflows, or any scenario where immediate feedback matters.

## Getting started

Mastra's streaming API adapts based on your model version:

- **`.stream()`**: For V2 models, supports **AI SDK v5** and later (`LanguageModelV2`).
- **`.streamLegacy()`**: For V1 models, supports **AI SDK v4** (`LanguageModelV1`).

## Streaming with agents

You can pass a single string for basic prompts, an array of strings when providing multiple pieces of context, or an array of message objects with `role` and `content` for precise control over roles and conversational flows.

### Using `Agent.stream()`

A `textStream` breaks the response into chunks as it's generated, allowing output to stream progressively instead of arriving all at once. Iterate over the `textStream` using a `for await` loop to inspect each stream chunk.

```typescript
const testAgent = mastra.getAgent('testAgent')

const stream = await testAgent.stream([{ role: 'user', content: 'Help me organize my day' }])

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)

```

> **Info:**
Visit [Agent.stream()](/reference/streaming/agents/stream) for more information.


### Output from `Agent.stream()`

The output streams the generated response from the agent.

```text
Of course!
To help you organize your day effectively, I need a bit more information.
Here are some questions to consider:
...
```

### Agent stream properties

An agent stream provides access to various response properties:

- **`stream.textStream`**: A readable stream that emits text chunks.
- **`stream.text`**: Promise that resolves to the full text response.
- **`stream.finishReason`**: The reason the agent stopped streaming.
- **`stream.usage`**: Token usage information.

### AI SDK v5+ Compatibility

AI SDK v5 (and later) uses `LanguageModelV2` for the model providers. If you are getting an error that you are using an AI SDK v4 model you will need to upgrade your model package to the next major version.

For integration with AI SDK v5+, use the `toAISdkV5Stream()` utility from `@mastra/ai-sdk` to convert Mastra streams to AI SDK-compatible format:

```typescript
const testAgent = mastra.getAgent('testAgent')

const stream = await testAgent.stream([{ role: 'user', content: 'Help me organize my day' }])

// Convert to AI SDK v5+ compatible stream
const aiSDKStream = toAISdkV5Stream(stream, { from: 'agent' })
```

For converting messages to AI SDK v5+ format, use the `toAISdkV5Messages()` utility from `@mastra/ai-sdk/ui`:

```typescript
const messages = [{ role: 'user', content: 'Hello' }]
const aiSDKMessages = toAISdkV5Messages(messages)
```

## Streaming with workflows

Streaming from a workflow returns a sequence of structured events describing the run lifecycle, rather than incremental text chunks. This event-based format makes it possible to track and respond to workflow progress in real time once a run is created using `.createRun()`.

### Using `Run.stream()`

The `stream()` method returns a `ReadableStream` of events directly.

```typescript
const run = await testWorkflow.createRun()

const stream = await run.stream({
  inputData: {
    value: 'initial data',
  },

for await (const chunk of stream) {
  console.log(chunk)

```

> **Info:**
Visit [Run.stream()](/reference/streaming/workflows/stream) for more information.


### Output from `Run.stream()`

The event structure includes `runId` and `from` at the top level, making it easier to identify and track workflow runs without digging into the payload.

```typescript

  type: 'workflow-start',
  runId: '1eeaf01a-d2bf-4e3f-8d1b-027795ccd3df',
  from: 'WORKFLOW',
  payload: {
    stepName: 'step-1',
    args: { value: 'initial data' },
    stepCallId: '8e15e618-be0e-4215-a5d6-08e58c152068',
    startedAt: 1755121710066,
    status: 'running'


```

## Workflow stream properties

A workflow stream provides access to various response properties:

- **`stream.status`**: The status of the workflow run.
- **`stream.result`**: The result of the workflow run.
- **`stream.usage`**: The total token usage of the workflow run.

## Related

- [Streaming events](./events)
- [Using Agents](/docs/agents/overview)
- [Workflows overview](../workflows/overview)

---

# Streaming events

Streaming from agents or workflows provides real-time visibility into either the LLM’s output or the status of a workflow run. This feedback can be passed directly to the user, or used within applications to handle workflow status more effectively, creating a smoother and more responsive experience.

Events emitted from agents or workflows represent different stages of generation and execution, such as when a run starts, when text is produced, or when a tool is invoked.

## Event types

Below is a complete list of events emitted from `.stream()`.
Depending on whether you’re streaming from an **agent** or a **workflow**, only a subset of these events will occur:

- **start**: Marks the beginning of an agent or workflow run.
- **step-start**: Indicates a workflow step has begun execution.
- **text-delta**: Incremental text chunks as they're generated by the LLM.
- **tool-call**: When the agent decides to use a tool, including the tool name and arguments.
- **tool-result**: The result returned from tool execution.
- **step-finish**: Confirms that a specific step has fully finalized, and may include metadata like the finish reason for that step.
- **finish**: When the agent or workflow completes, including usage statistics.

## Network event types

When using `agent.network()` for multi-agent collaboration, additional event types are emitted to track the orchestration flow:

- **routing-agent-start**: The routing agent begins analyzing the task to decide which primitive (agent/workflow/tool) to delegate to.
- **routing-agent-text-delta**: Incremental text as the routing agent processes the response from the selected primitive.
- **routing-agent-end**: The routing agent completes its selection, including the selected primitive and reason for selection.
- **agent-execution-start**: A delegated agent begins execution.
- **agent-execution-end**: A delegated agent completes execution.
- **agent-execution-event-\***: Events from the delegated agent's execution (e.g., `agent-execution-event-text-delta`).
- **workflow-execution-start**: A delegated workflow begins execution.
- **workflow-execution-end**: A delegated workflow completes execution.
- **workflow-execution-event-\***: Events from the delegated workflow's execution.
- **tool-execution-start**: A delegated tool begins execution.
- **tool-execution-end**: A delegated tool completes execution.
- **network-execution-event-step-finish**: A network iteration step completes.
- **network-execution-event-finish**: The entire network execution completes.

## Inspecting agent streams

Iterate over the `stream` with a `for await` loop to inspect all emitted event chunks.

```typescript
const testAgent = mastra.getAgent('testAgent')

const stream = await testAgent.stream([{ role: 'user', content: 'Help me organize my day' }])

for await (const chunk of stream) {
  console.log(chunk)

```

> **Info:**
Visit [Agent.stream()](/reference/streaming/agents/stream) for more information.


### Example agent output

Below is an example of events that may be emitted. Each event always includes a `type` and can include additional fields like `from` and `payload`.

```typescript

  type: 'start',
  from: 'AGENT',
  // ..

  type: 'step-start',
  from: 'AGENT',
  payload: {
    messageId: 'msg-cdUrkirvXw8A6oE4t5lzDuxi',
    // ...

  type: 'tool-call',
  from: 'AGENT',
  payload: {
    toolCallId: 'call_jbhi3s1qvR6Aqt9axCfTBMsA',
    toolName: 'testTool'
    // ..


```

## Inspecting workflow streams

Iterate over the `stream` with a `for await` loop to inspect all emitted event chunks.

```typescript
const testWorkflow = mastra.getWorkflow('testWorkflow')

const run = await testWorkflow.createRun()

const stream = await run.stream({
  inputData: {
    value: 'initial data',
  },

for await (const chunk of stream) {
  console.log(chunk)

```

### Example workflow output

Below is an example of events that may be emitted. Each event always includes a `type` and can include additional fields like `from` and `payload`.

```typescript

  type: 'workflow-start',
  runId: '221333ed-d9ee-4737-922b-4ab4d9de73e6',
  from: 'WORKFLOW',
  // ...

  type: 'workflow-step-start',
  runId: '221333ed-d9ee-4737-922b-4ab4d9de73e6',
  from: 'WORKFLOW',
  payload: {
    stepName: 'step-1',
    args: { value: 'initial data' },
    stepCallId: '9e8c5217-490b-4fe7-8c31-6e2353a3fc98',
    startedAt: 1755269732792,
    status: 'running'


```

### Foreach progress events

When a workflow uses `.foreach()`, each iteration emits a `workflow-step-progress` event. You can use these to track real-time progress:

```typescript
for await (const chunk of stream) {
  if (chunk.type === 'workflow-step-progress') {
    console.log(
      `${chunk.payload.id}: ${chunk.payload.completedCount}/${chunk.payload.totalCount} — ${chunk.payload.iterationStatus}`,


```

Each progress event includes:

- **`id`**: The step ID of the foreach step
- **`completedCount`**: Number of iterations completed so far
- **`totalCount`**: Total number of iterations
- **`currentIndex`**: Index of the iteration that completed
- **`iterationStatus`**: Status of the iteration (`success`, `failed`, or `suspended`)
- **`iterationOutput`**: Output of the iteration (when successful)

---

# Tool streaming

Tool streaming in Mastra enables tools to send incremental results while they run, rather than waiting until execution finishes. This allows you to surface partial progress, intermediate states, or progressive data directly to users or upstream agents and workflows.

Streams can be written to in two main ways:

- **From within a tool**: every tool receives a `context.writer` object, which is a writable stream you can use to push updates as execution progresses.
- **From an agent stream**: you can also pipe an agent's `stream` output directly into a tool's writer, making it convenient to chain agent responses into tool results without extra glue code.

By combining writable tool streams with agent streaming, you gain fine grained control over how intermediate results flow through your system and into the user experience.

## Agent using tool

Agent streaming can be combined with tool calls, allowing tool outputs to be written directly into the agent’s streaming response. This makes it possible to surface tool activity as part of the overall interaction.

```typescript
export const testAgent = new Agent({
  id: 'test-agent',
  name: 'Test Agent',
  instructions: 'You are a weather agent.',
  model: 'openai/gpt-5.4',
  tools: { testTool },

```

### Using `context.writer`

The `context.writer` object is available in a tool's `execute()` function and can be used to emit custom events, data, or values into the active stream. This enables tools to provide intermediate results or status updates while execution is still in progress.

> **Warning:**
You must `await` the call to `writer.write()` or else you will lock the stream and get a `WritableStream is locked` error.


```typescript
export const testTool = createTool({
  execute: async (inputData, context) => {
    const { value } = inputData

    await context?.writer?.write({
      type: 'custom-event',
      status: 'pending',

    const response = await fetch()

    await context?.writer?.write({
      type: 'custom-event',
      status: 'success',

    return {
      value: '',

  },

```

You can also use `writer.custom()` to emit top-level stream chunks. This is useful when integrating with UI frameworks.

```typescript
export const testTool = createTool({
  execute: async (inputData, context) => {
    const { value } = inputData

    await context?.writer?.custom({
      type: 'data-tool-progress',
      status: 'pending',

    const response = await fetch()

    await context?.writer?.custom({
      type: 'data-tool-progress',
      status: 'success',

    return {
      value: '',

  },

```

### Transient data chunks

By default, `data-*` chunks emitted with `writer.custom()` are persisted to storage as part of the message history. For chunks that are only needed during live streaming — such as progress updates or verbose log output — set `transient: true` to skip storage persistence. Transient chunks are still streamed to the client in real time but aren't saved to the database.

```typescript
await context?.writer?.custom({
  type: 'data-build-log',
  data: { line: 'Compiling module 3 of 12...' },
  transient: true,

```

Use transient chunks when the data is large or high-frequency and only relevant during the live session. After a page refresh, transient chunks are no longer available — only the tool's return value and any non-transient chunks are loaded from storage.

### Inspecting stream payloads

Events written to the stream are included in the emitted chunks. These chunks can be inspected to access any custom fields, such as event types, intermediate values, or tool-specific data.

```typescript
const stream = await testAgent.stream(['What is the weather in London?', 'Use the testTool'])

for await (const chunk of stream) {
  if (chunk.payload.output?.type === 'custom-event') {
    console.log(JSON.stringify(chunk, null, 2))


```

## Tool lifecycle hooks

Tools support lifecycle hooks that allow you to monitor different stages of tool execution during streaming. These hooks are particularly useful for logging or analytics.

### Example: Using `onInputAvailable` and `onOutput`

```typescript
export const weatherTool = createTool({
  id: 'weather-tool',
  description: 'Get weather information',
  inputSchema: z.object({
    city: z.string(),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
  // Called when the complete input is available
  onInputAvailable: ({ input, toolCallId }) => {
    console.log(`Weather requested for: ${input.city}`)
  },
  execute: async input => {
    const weather = await fetchWeather(input.city)
    return weather
  },
  // Called after successful execution
  onOutput: ({ output, toolName }) => {
    console.log(`${toolName} result: ${output.temperature}°F, ${output.conditions}`)
  },

```

### Available Hooks

- **onInputStart**: Called when tool call input streaming begins
- **onInputDelta**: Called for each chunk of input as it streams in
- **onInputAvailable**: Called when complete input is parsed and validated
- **onOutput**: Called after the tool successfully executes with the output

For detailed documentation on all lifecycle hooks, see the [createTool() reference](/reference/tools/create-tool#tool-lifecycle-hooks).

### Streaming tool input in UIs

When a model generates a tool call, the arguments arrive incrementally as `tool-call-delta` stream chunks before the final `tool-call` chunk. UIs can listen for the corresponding `tool_input_start`, `tool_input_delta`, and `tool_input_end` events to render tool arguments as they stream in — for example, showing a file path or command immediately rather than waiting for the complete tool call.

Using a partial JSON parser on the accumulated `argsTextDelta` fragments lets you extract usable argument values before the JSON is complete. This enables features like live diff previews for edit tools, streaming file content for write tools, and instant display of search patterns or file paths.

## Tool using an agent

Pipe an agent's `fullStream` to the tool's `writer`. This streams partial output, and Mastra automatically aggregates the agent's usage into the tool run.

```typescript
export const testTool = createTool({
  execute: async (inputData, context) => {
    const { city } = inputData

    const agent = context?.mastra?.getAgent('testAgent')
    const stream = await agent?.stream(`What is the weather in ${city}?`)

    await stream!.fullStream.pipeTo(context?.writer!)

    return {
      value: await stream!.text,

  },

```

---

# Workflow streaming

Workflow streaming in Mastra enables workflows to send incremental results while they execute, rather than waiting until completion. This allows you to surface partial progress, intermediate states, or progressive data directly to users or upstream agents and workflows.

Streams can be written to in two main ways:

- **From within a workflow step**: every workflow step receives a `writer` argument, which is a writable stream you can use to push updates as execution progresses.
- **From an agent stream**: you can also pipe an agent's `stream` output directly into a workflow step's writer, making it convenient to chain agent responses into workflow results without extra glue code.

By combining writable workflow streams with agent streaming, you gain fine-grained control over how intermediate results flow through your system and into the user experience.

## Using the `writer` argument

The `writer` argument is passed to a workflow step's `execute` function and can be used to emit custom events, data, or values into the active stream. This enables workflow steps to provide intermediate results or status updates while execution is still in progress.

> **Warning:**
You must `await` the call to `writer.write(...)` or else you will lock the stream and get a `WritableStream is locked` error.


```typescript
export const testStep = createStep({
  execute: async ({ inputData, writer }) => {
    const { value } = inputData;

    await writer?.write({
      type: "custom-event",
      status: "pending"
    });

    const response = await fetch(...);

    await writer?.write({
      type: "custom-event",
      status: "success"
    });

    return {
      value: ""
    };
  },
});
```

## Inspecting workflow stream payloads

Events written to the stream are included in the emitted chunks. These chunks can be inspected to access any custom fields, such as event types, intermediate values, or step-specific data.

```typescript
const testWorkflow = mastra.getWorkflow('testWorkflow')

const run = await testWorkflow.createRun()

const stream = await run.stream({
  inputData: {
    value: 'initial data',
  },

for await (const chunk of stream) {
  console.log(chunk)

if (result!.status === 'suspended') {
  // if the workflow is suspended, we can resume it with the resumeStream method
  const resumedStream = await run.resumeStream({
    resumeData: { value: 'resume data' },

  for await (const chunk of resumedStream) {
    console.log(chunk)


```

## Resuming an interrupted workflow stream

If a workflow stream is closed or interrupted for any reason, you can resume it with the `resumeStream` method. This will return a new `ReadableStream` that you can use to observe the workflow events.

```typescript
const newStream = await run.resumeStream()

for await (const chunk of newStream) {
  console.log(chunk)

```

## Workflow using an agent

Pipe an agent's `textStream` to the workflow step's `writer`. This streams partial output, and Mastra automatically aggregates the agent's usage into the workflow run.

```typescript
export const testStep = createStep({
  execute: async ({ inputData, mastra, writer }) => {
    const { city } = inputData

    const testAgent = mastra?.getAgent('testAgent')
    const stream = await testAgent?.stream(`What is the weather in ${city}$?`)

    await stream!.textStream.pipeTo(writer!)

    return {
      value: await stream!.text,

  },

```

---



# MCP (Model Context Protocol)

# MCP overview

Mastra supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction), an open standard for connecting AI agents to external tools and resources. It serves as a universal plugin system, enabling agents to call tools regardless of language or hosting environment.

Mastra can also be used to author MCP servers, exposing agents, tools, and other structured resources via the MCP interface. These can then be accessed by any system or agent that supports the protocol.

Mastra currently supports two MCP classes:

1. `MCPClient`: Connects to one or many MCP servers to access their tools, resources, prompts, and handle elicitation requests.
1. `MCPServer`: Exposes Mastra tools, agents, workflows, prompts, and resources to MCP-compatible clients.

## Get started

To use MCP, install the required dependency:

```bash npm2yarn
npm install @mastra/mcp@latest
```

## Configuring `MCPClient`

The `MCPClient` connects Mastra primitives to external MCP servers, which can be local packages (invoked using `npx`) or remote HTTP(S) endpoints. Each server must be configured with either a `command` or a `url`, depending on how it's hosted.

```typescript
export const testMcpClient = new MCPClient({
  id: 'test-mcp-client',
  servers: {
    wikipedia: {
      command: 'npx',
      args: ['-y', 'wikipedia-mcp'],
    },
    weather: {
      url: new URL(
        `https://server.smithery.ai/@smithery-ai/national-weather-service/mcp?api_key=${process.env.SMITHERY_API_KEY}`,
      ),
    },
  },

```

> **Info:**
Visit [MCPClient](/reference/tools/mcp-client) for a full list of configuration options.


:::tip Authentication

For connecting to OAuth-protected MCP servers, see the [OAuth Authentication](/reference/tools/mcp-client#oauth-authentication) section.


## Using `MCPClient` with an agent

To use tools from an MCP server in an agent, import your `MCPClient` and call `.listTools()` in the `tools` parameter. This loads from the defined MCP servers, making them available to the agent.

```typescript
export const testAgent = new Agent({
  id: 'test-agent',
  name: 'Test Agent',
  description: 'You are a helpful AI assistant',
  instructions: `
      You are a helpful assistant that has access to the following MCP Servers.
      - Wikipedia MCP Server
      - US National Weather Service

      Answer questions using the information you find using the MCP Servers.`,
  model: 'openai/gpt-5.4',
  tools: await testMcpClient.listTools(),

```

> **Info:**
Visit [Agent Class](/reference/agents/agent) for a full list of configuration options.


## Configuring `MCPServer`

To expose agents, tools, and workflows from your Mastra application to external systems over HTTP(S) use the `MCPServer` class. This makes them accessible to any system or agent that supports the protocol.

```typescript
export const testMcpServer = new MCPServer({
  id: 'test-mcp-server',
  name: 'Test Server',
  version: '1.0.0',
  agents: { testAgent },
  tools: { testTool },
  workflows: { testWorkflow },

```

> **Info:**
Visit [MCPServer](/reference/tools/mcp-server) for a full list of configuration options.


:::tip Authentication

To protect your MCP server with OAuth, see the [OAuth Protection](/reference/tools/mcp-server#oauth-protection) section.


## Registering an `MCPServer`

To make an MCP server available to other systems or agents that support the protocol, register it in the main `Mastra` instance using `mcpServers`.

```typescript
export const mastra = new Mastra({
  mcpServers: { testMcpServer },

```

## Static and dynamic tools

`MCPClient` offers two approaches to retrieving tools from connected servers, suitable for different application architectures:

| Feature | Static Configuration (`await mcp.listTools()`) | Dynamic Configuration (`await mcp.listToolsets()`) |
| :- | :- | :- |
| **Use Case** | Single-user, static config (e.g., CLI tool) | Multi-user, dynamic config (e.g., SaaS app) |
| **Configuration** | Fixed at agent initialization | Per-request, dynamic |
| **Credentials** | Shared across all uses | Can vary per user/request |
| **Agent Setup** | Tools added in `Agent` constructor | Tools passed in `.generate()` or `.stream()` options |

### Static tools

Use the `.listTools()` method to fetch tools from all configured MCP servers. This is suitable when configuration (such as API keys) is static and consistent across users or requests. Call it once and pass the result to the `tools` property when defining your agent.

> **Info:**
Visit [listTools()](/reference/tools/mcp-client#listtools) for more information.


```typescript
export const testAgent = new Agent({
  id: 'test-agent',
  tools: await testMcpClient.listTools(),

```

### Dynamic tools

Use the `.listToolsets()` method when tool configuration may vary by request or user, such as in a multi-tenant system where each user provides their own API key. This method returns toolsets that can be passed to the `toolsets` option in the agent's `.generate()` or `.stream()` calls.

```typescript
async function handleRequest(userPrompt: string, userApiKey: string) {
  const userMcp = new MCPClient({
    servers: {
      weather: {
        url: new URL('http://localhost:8080/mcp'),
        requestInit: {
          headers: {
            Authorization: `Bearer ${userApiKey}`,
          },
        },
      },
    },

  const agent = mastra.getAgent('testAgent')

  const response = await agent.generate(userPrompt, {
    toolsets: await userMcp.listToolsets(),

  await userMcp.disconnect()

  return Response.json({

```

> **Info:**
Visit [listToolsets()](/reference/tools/mcp-client#listtoolsets) for more information.


## Connecting to an MCP registry

MCP servers can be discovered through registries. Here's how to connect to some popular ones using `MCPClient`:


  [Klavis AI](https://klavis.ai) provides hosted, enterprise-authenticated, high-quality MCP servers.

    ```typescript
    import { MCPClient } from '@mastra/mcp'

    const mcp = new MCPClient({
      servers: {
        salesforce: {
          url: new URL(
            'https://salesforce-mcp-server.klavis.ai/mcp/?instance_id={private-instance-id}',
          ),
        },
        hubspot: {
          url: new URL('https://hubspot-mcp-server.klavis.ai/mcp/?instance_id={private-instance-id}'),
        },
      },

    ```

    Klavis AI offers enterprise-grade authentication and security for production deployments.

    For more details on how to integrate Mastra with Klavis, check out their [documentation](https://docs.klavis.ai/documentation/ai-platform-integration/mastra).

[mcp.run](https://www.mcp.run/) provides pre-authenticated, managed MCP servers. Tools are grouped into Profiles, each with a unique, signed URL.

    ```typescript
    import { MCPClient } from '@mastra/mcp'

    const mcp = new MCPClient({
      servers: {
        marketing: {
          // Example profile name
          url: new URL(process.env.MCP_RUN_SSE_URL!), // Get URL from mcp.run profile
        },
      },

    ```

    > **Important:** Treat the mcp.run SSE URL like a password. Store it securely, for example, in an environment variable.
    >
    > ```bash title=".env"
    > MCP_RUN_SSE_URL=https://www.mcp.run/api/mcp/sse?nonce=...
    > ```

[Composio.dev](https://composio.dev) offers a registry of [SSE-based MCP servers](https://mcp.composio.dev). You can use the SSE URL generated for tools like Cursor directly.

    ```typescript
    import { MCPClient } from '@mastra/mcp'

    const mcp = new MCPClient({
      servers: {
        googleSheets: {
          url: new URL('https://mcp.composio.dev/googlesheets/[private-url-path]'),
        },
        gmail: {
          url: new URL('https://mcp.composio.dev/gmail/[private-url-path]'),
        },
      },

    ```

    Authentication with services like Google Sheets often happens interactively through the agent conversation.

    _Note: Composio URLs are typically tied to a single user account, making them best suited for personal automation rather than multi-tenant applications._

[Smithery.ai](https://smithery.ai) provides a registry accessible via their CLI.

    ```typescript
    // Unix/Mac
    import { MCPClient } from '@mastra/mcp'

    const mcp = new MCPClient({
      servers: {
        sequentialThinking: {
          command: 'npx',
          args: [
            '-y',
            '@smithery/cli@latest',
            'run',
            '@smithery-ai/server-sequential-thinking',
            '--config',
            '{}',
          ],
        },
      },

    ```

    ```typescript
    // Windows
    import { MCPClient } from '@mastra/mcp'

    const mcp = new MCPClient({
      servers: {
        sequentialThinking: {
          command: 'npx',
          args: [
            '-y',
            '@smithery/cli@latest',
            'run',
            '@smithery-ai/server-sequential-thinking',
            '--config',
            '{}',
          ],
        },
      },

    ```

[Ampersand](https://withampersand.com?utm_source=mastra-docs) offers an [MCP Server](https://docs.withampersand.com/mcp) that allows you to connect your agent to 150+ integrations with SaaS products like Salesforce, Hubspot, and Zendesk.

    ```typescript
    // MCPClient with Ampersand MCP Server using SSE
    export const mcp = new MCPClient({
      servers: {
        '@amp-labs/mcp-server': {
          url: `https://mcp.withampersand.com/v1/sse?${new URLSearchParams({
            apiKey: process.env.AMPERSAND_API_KEY,
            project: process.env.AMPERSAND_PROJECT_ID,
            integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
            groupRef: process.env.AMPERSAND_GROUP_REF,
          })}`,
        },
      },

    ```

    ```typescript
    // If you prefer to run the MCP server locally:
    import { MCPClient } from '@mastra/mcp'

    // MCPClient with Ampersand MCP Server using stdio transport
    export const mcp = new MCPClient({
      servers: {
        '@amp-labs/mcp-server': {
          command: 'npx',
          args: [
            '-y',
            '@amp-labs/mcp-server@latest',
            '--transport',
            'stdio',
            '--project',
            process.env.AMPERSAND_PROJECT_ID,
            '--integrationName',
            process.env.AMPERSAND_INTEGRATION_NAME,
            '--groupRef',
            process.env.AMPERSAND_GROUP_REF, // optional
          ],
          env: {
            AMPERSAND_API_KEY: process.env.AMPERSAND_API_KEY,
          },
        },
      },

    ```

    As an alternative to MCP, Ampersand's AI SDK also has an adapter for Mastra, so you can [directly import Ampersand tools](https://docs.withampersand.com/ai-sdk#use-with-mastra) for your agent to access.

## Related

- [Using Tools](/docs/agents/using-tools)
- [MCPClient](/reference/tools/mcp-client)
- [MCPServer](/reference/tools/mcp-server)

---

# Publishing an MCP server

This example guides you through setting up a basic Mastra MCPServer using the stdio transport, building it, and preparing it for publishing to NPM.

## Install dependencies

Install the necessary packages:

```bash npm2yarn
npm install @mastra/mcp @mastra/core tsup
```

## Setting up an MCP server

Create a file for your stdio server, for example, `/src/mastra/stdio.ts`.

Add the following code to the file. Remember to import your actual Mastra tools and name the server appropriately.

    ```typescript title="src/mastra/stdio.ts"
    #!/usr/bin/env node
    import { MCPServer } from '@mastra/mcp'
    import { weatherTool } from './tools'

    const server = new MCPServer({
      name: 'my-mcp-server',
      version: '1.0.0',
      tools: { weatherTool },

    server.startStdio().catch(error => {
      console.error('Error running MCP server:', error)
      process.exit(1)

    ```

Update your `package.json` to include the `bin` entry pointing to your built server file and a script to build the server with both ESM and CJS outputs.

    ```json title="package.json"

      "bin": "dist/stdio.mjs",
      "scripts": {
        "build:mcp": "tsup src/mastra/stdio.ts --format esm,cjs --no-splitting --dts && echo '#!/usr/bin/env node' | cat - dist/stdio.mjs > temp && mv temp dist/stdio.mjs && chmod +x dist/stdio.mjs"


    ```

    The build command generates both ESM (`.mjs`) and CJS (`.cjs`) outputs for maximum compatibility. The shebang (`#!/usr/bin/env node`) is prepended to the ESM artifact to make it directly executable, and the `bin` entry points to this file.

Run the build command:

    ```bash
    pnpm run build:mcp
    ```

    This will compile your server code into both ESM and CJS formats and make the ESM output file executable. On Unix-like systems, the `chmod +x` step makes the file directly executable. Windows users may need to use WSL or handle execution through Node.js directly.

## Publishing to NPM

To make your MCP server available for others (or yourself) to use via `npx` or as a dependency, you can publish it to NPM.

Ensure you have an NPM account and are logged in (`npm login`).

Make sure your package name in `package.json` is unique and available.

Run the publish command from your project root after building:

    ```bash
    npm publish --access public
    ```

    For more details on publishing packages, refer to the [NPM documentation](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages).

## Using a published MCP server

Once published, your MCP server can be used by an `MCPClient` by specifying the command to run your package. You can also use any other MCP client like Claude desktop, Cursor, or Windsurf.

```typescript
const mcp = new MCPClient({
  servers: {
    // Give this MCP server instance a name
    yourServerName: {
      command: 'npx',
      args: ['-y', '@your-org-name/your-package-name@latest'], // Replace with your package name
    },
  },

// You can then get tools or toolsets from this configuration to use in your agent
const tools = await mcp.listTools()
const toolsets = await mcp.listToolsets()
```

Note: If you published without an organization scope, the `args` might be `["-y", "your-package-name@latest"]`.

---



# Evaluations

# Scorers overview

While traditional software tests have clear pass/fail conditions, AI outputs are non-deterministic — they can vary with the same input. **Scorers** help bridge this gap by providing quantifiable metrics for measuring agent quality.

Scorers are automated tests that evaluate Agents outputs using model-graded, rule-based, and statistical methods. Scorers return **scores**: numerical values (typically between 0 and 1) that quantify how well an output meets your evaluation criteria. These scores enable you to objectively track performance, compare different approaches, and identify areas for improvement in your AI systems. Scorers can be customized with your own prompts and scoring functions.

Scorers can be run in the cloud, capturing real-time results. But scorers can also be part of your CI/CD pipeline, allowing you to test and monitor your agents over time.

## Types of scorers

Mastra provides different kinds of scorers, each serving a specific purpose. Here are some common types:

1. **Textual Scorers**: Evaluate accuracy, reliability, and context understanding of agent responses
1. **Classification Scorers**: Measure accuracy in categorizing data based on predefined categories
1. **Prompt Engineering Scorers**: Explore impact of different instructions and input formats

## Installation

To access Mastra's scorers feature install the `@mastra/evals` package.

```bash npm2yarn
npm install @mastra/evals@latest
```

## Live evaluations

**Live evaluations** allow you to automatically score AI outputs in real-time as your agents and workflows operate. Instead of running evaluations manually or in batches, scorers run asynchronously alongside your AI systems, providing continuous quality monitoring.

### Adding scorers to agents

You can add built-in scorers to your agents to automatically evaluate their outputs. See the [full list of built-in scorers](/docs/evals/built-in-scorers) for all available options.

```typescript
export const evaluatedAgent = new Agent({
  scorers: {
    relevancy: {
      scorer: createAnswerRelevancyScorer({ model: 'openai/gpt-5-mini' }),
      sampling: { type: 'ratio', rate: 0.5 },
    },
    safety: {
      scorer: createToxicityScorer({ model: 'openai/gpt-5-mini' }),
      sampling: { type: 'ratio', rate: 1 },
    },
  },

```

### Adding scorers to workflow steps

You can also add scorers to individual workflow steps to evaluate outputs at specific points in your process:

```typescript
const contentStep = createStep({
  scorers: {
    customStepScorer: {
      scorer: customStepScorer(),
      sampling: {
        type: "ratio",
        rate: 1, // Score every step execution


  },
});

export const contentWorkflow = createWorkflow({ ... })
  .then(contentStep)
  .commit();
```

### How live evaluations work

**Asynchronous execution**: Live evaluations run in the background without blocking your agent responses or workflow execution. This ensures your AI systems maintain their performance while still being monitored.

**Sampling control**: The `sampling.rate` parameter (0-1) controls what percentage of outputs get scored:

- `1.0`: Score every single response (100%)
- `0.5`: Score half of all responses (50%)
- `0.1`: Score 10% of responses
- `0.0`: Disable scoring

**Automatic storage**: All scoring results are automatically stored in the `mastra_scorers` table in your configured database, allowing you to analyze performance trends over time.

## Trace evaluations

In addition to live evaluations, you can use scorers to evaluate historical traces from your agent interactions and workflows. This is particularly useful for analyzing past performance, debugging issues, or running batch evaluations.

:::note[Observability required]

To score traces, you must first configure observability in your Mastra instance to collect trace data. See [Tracing documentation](../observability/tracing/overview) for setup instructions.


## Studio

To score traces, you first need to register your scorers with your Mastra instance:

```typescript
const mastra = new Mastra({
  scorers: {
    answerRelevancy: myAnswerRelevancyScorer,
    responseQuality: myResponseQualityScorer,
  },

```

Once registered, you can score traces interactively within Studio under the **Observability** section. Open Studio to manage scorers, review scores, and run experiments.

- **Scorers list**: Browse all registered scorers with their description, and the number of agents and workflows each scorer is attached to.
- **Score results**: Select a scorer to see a paginated list of every score it has produced. Click a row to open the detail panel, which shows the score value, reason, input, output, and the prompts used by the judge. From this panel, save any result as a dataset item for future experiments.
- **Agent Evaluate tab**: Open the Evaluate tab on any agent to attach or detach scorers, create or edit stored scorers inline, manage datasets, and run experiments. Experiment results display per-item scores alongside pass/fail status and version tags.
- **Trace scoring**: In the Observability section, run a scorer against any historical trace or span to evaluate past interactions. Filter scores by agent or workflow.

## Next steps

- Learn how to create your own scorers in the [Creating Custom Scorers](/docs/evals/custom-scorers) guide
- Explore built-in scorers in the [Built-in Scorers](/docs/evals/built-in-scorers) section
- Test scorers with [Studio](/docs/studio/overview)

---

# Built-in scorers

Mastra provides a comprehensive set of built-in scorers for evaluating AI outputs. These scorers are optimized for common evaluation scenarios and are ready to use in your agents and workflows.

To create your own scorers, see the [Custom Scorers](/docs/evals/custom-scorers) guide.

## Available scorers

### Accuracy and reliability

These scorers evaluate how correct, truthful, and complete your agent's answers are:

- [`answer-relevancy`](/reference/evals/answer-relevancy): Evaluates how well responses address the input query (`0-1`, higher is better)
- [`answer-similarity`](/reference/evals/answer-similarity): Compares agent outputs against ground-truth answers for CI/CD testing using semantic analysis (`0-1`, higher is better)
- [`faithfulness`](/reference/evals/faithfulness): Measures how accurately responses represent provided context (`0-1`, higher is better)
- [`hallucination`](/reference/evals/hallucination): Detects factual contradictions and unsupported claims (`0-1`, lower is better)
- [`completeness`](/reference/evals/completeness): Checks if responses include all necessary information (`0-1`, higher is better)
- [`content-similarity`](/reference/evals/content-similarity): Measures textual similarity using character-level matching (`0-1`, higher is better)
- [`textual-difference`](/reference/evals/textual-difference): Measures textual differences between strings (`0-1`, higher means more similar)
- [`tool-call-accuracy`](/reference/evals/tool-call-accuracy): Evaluates whether the LLM selects the correct tool from available options (`0-1`, higher is better)
- [`trajectory-accuracy`](/reference/evals/trajectory-accuracy): Evaluates whether an agent follows the expected sequence of actions (tool calls, model generations, workflow steps, and other span types) (`0-1`, higher is better)
- [`prompt-alignment`](/reference/evals/prompt-alignment): Measures how well agent responses align with user prompt intent, requirements, completeness, and format (`0-1`, higher is better)

### Context quality

These scorers evaluate the quality and relevance of context used in generating responses:

- [`context-precision`](/reference/evals/context-precision): Evaluates context relevance and ranking using Mean Average Precision, rewarding early placement of relevant context (`0-1`, higher is better)
- [`context-relevance`](/reference/evals/context-relevance): Measures context utility with nuanced relevance levels, usage tracking, and missing context detection (`0-1`, higher is better)

:::tip[Context Scorer Selection]

- Use **Context Precision** when context ordering matters and you need standard IR metrics (ideal for RAG ranking evaluation)
- Use **Context Relevance** when you need detailed relevance assessment and want to track context usage and identify gaps

Both context scorers support:

- **Static context**: Pre-defined context arrays
- **Dynamic context extraction**: Extract context from runs using custom functions (ideal for RAG systems, vector databases, etc.)


### Output quality

These scorers evaluate adherence to format, style, and safety requirements:

- [`tone-consistency`](/reference/evals/tone-consistency): Measures consistency in formality, complexity, and style (`0-1`, higher is better)
- [`toxicity`](/reference/evals/toxicity): Detects harmful or inappropriate content (`0-1`, lower is better)
- [`bias`](/reference/evals/bias): Detects potential biases in the output (`0-1`, lower is better)
- [`keyword-coverage`](/reference/evals/keyword-coverage): Assesses technical terminology usage (`0-1`, higher is better)

---

# Custom scorers

Mastra provides a unified `createScorer` factory that allows you to build custom evaluation logic using either JavaScript functions or LLM-based prompt objects for each step. This flexibility lets you choose the best approach for each part of your evaluation pipeline.

## The four-step pipeline

All scorers in Mastra follow a consistent four-step evaluation pipeline:

1. **preprocess** (optional): Prepare or transform input/output data
1. **analyze** (optional): Perform evaluation analysis and gather insights
1. **generateScore** (required): Convert analysis into a numerical score
1. **generateReason** (optional): Generate human-readable explanations

Each step can use either **functions** or **prompt objects** (LLM-based evaluation), giving you the flexibility to combine deterministic algorithms with AI judgment as needed.

## Functions vs prompt objects

**Functions** use JavaScript for deterministic logic. They're ideal for:

- Algorithmic evaluations with clear criteria
- Performance-critical scenarios
- Integration with existing libraries
- Consistent, reproducible results

**Prompt Objects** use LLMs as judges for evaluation. They're perfect for:

- Subjective evaluations requiring human-like judgment
- Complex criteria difficult to code algorithmically
- Natural language understanding tasks
- Nuanced context evaluation

**What “prompt object” means:** Instead of a function, the step is an object with `description` + `createPrompt` (and `outputSchema` for `preprocess`/`analyze`). That object tells Mastra to run the judge LLM for the step and store the structured output in `results.<step>StepResult`.

You can mix and match approaches within a single scorer - for example, use a function for preprocessing data and an LLM for analyzing quality.

## Initializing a scorer

Every scorer starts with the `createScorer` factory function, which requires an id and description, and optionally accepts a type specification and judge configuration.

```typescript
const glutenCheckerScorer = createScorer({
  id: 'gluten-checker',
  description: 'Check if recipes contain gluten ingredients',
  judge: {                    // Optional: for prompt object steps
    model: 'openai/gpt-5.4',
    instructions: 'You are a Chef that identifies if recipes contain gluten.'

// Chain step methods here
.preprocess(...)
.analyze(...)
.generateScore(...)
.generateReason(...)
```

The judge configuration is only needed if you plan to use prompt objects in any step. Individual steps can override this default configuration with their own judge settings.

If all steps are function-based, the judge is never called and there is no judge output. To see LLM output, define at least one step as a prompt object and read the corresponding step result (for example, `results.analyzeStepResult`).

### Minimal judge example (prompt object)

This example uses a prompt object in `analyze`, so the judge runs and its structured output is available as `results.analyzeStepResult`.

```typescript
const quoteSourcesScorer = createScorer({
  id: 'quote-sources',
  description: 'Check if the response includes sources',
  judge: {
    model: 'openai/gpt-5-mini',
    instructions: 'You are a strict evaluator.',
  },

  .analyze({
    description: 'Detect whether sources are present',
    outputSchema: z.object({
      hasSources: z.boolean(),
      sources: z.array(z.string()),
    }),
    createPrompt: ({ run }) => `
Does the response contain sources? Extract them as a list.

Response:
${run.output}
`,

  .generateScore(({ results }) => (results.analyzeStepResult.hasSources ? 1 : 0))

// Run the scorer and inspect judge output
const result = await quoteSourcesScorer.run({
  input: 'What is the capital of France?',
  output: 'Paris is the capital of France [1]. Source: [1] Wikipedia',

console.log(result.score) // 1
console.log(result.analyzeStepResult) // { hasSources: true, sources: ["Wikipedia"] }
```

### Agent Type for Agent Evaluation

For type safety and compatibility with both live agent scoring and trace scoring, use `type: 'agent'` when creating scorers for agent evaluation. This allows you to use the same scorer for an agent and also use it to score traces:

```typescript
const myScorer = createScorer({
  type: 'agent', // Automatically handles agent input/output types
}).generateScore(({ run, results }) => {
  // run.output is automatically typed as ScorerRunOutputForAgent
  // run.input is automatically typed as ScorerRunInputForAgent

```

## Step-by-step breakdown

### preprocess Step (Optional)

Prepares input/output data when you need to extract specific elements, filter content, or transform complex data structures.

**Functions:** `({ run, results }) => any`

```typescript
const glutenCheckerScorer = createScorer(...)
.preprocess(({ run }) => {
  // Extract and clean recipe text
  const recipeText = run.output.text.toLowerCase();
  const wordCount = recipeText.split(' ').length;

  return {
    recipeText,
    wordCount,
    hasCommonGlutenWords: /flour|wheat|bread|pasta/.test(recipeText)
  };

```

**Prompt Objects:** Use `description`, `outputSchema`, and `createPrompt` to structure LLM-based preprocessing.

```typescript
const glutenCheckerScorer = createScorer(...)
.preprocess({
  description: 'Extract ingredients from the recipe',
  outputSchema: z.object({
    ingredients: z.array(z.string()),
    cookingMethods: z.array(z.string())
  }),
  createPrompt: ({ run }) => `
    Extract all ingredients and cooking methods from this recipe:
    ${run.output.text}

    Return JSON with ingredients and cookingMethods arrays.
  `

```

**Data Flow:** Results are available to subsequent steps as `results.preprocessStepResult`

### analyze Step (Optional)

Performs core evaluation analysis, gathering insights that will inform the scoring decision.

**Functions:** `({ run, results }) => any`

```typescript
const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(({ run, results }) => {
  const { recipeText, hasCommonGlutenWords } = results.preprocessStepResult;

  // Simple gluten detection algorithm
  const glutenKeywords = ['wheat', 'flour', 'barley', 'rye', 'bread'];
  const foundGlutenWords = glutenKeywords.filter(word =>
    recipeText.includes(word)
  );

  return {
    isGlutenFree: foundGlutenWords.length === 0,

    confidence: hasCommonGlutenWords ? 0.9 : 0.7
  };

```

**Prompt Objects:** Use `description`, `outputSchema`, and `createPrompt` for LLM-based analysis.

```typescript
const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze({
  description: 'Analyze recipe for gluten content',
  outputSchema: z.object({
    isGlutenFree: z.boolean(),
    glutenSources: z.array(z.string()),
    confidence: z.number().min(0).max(1)
  }),
  createPrompt: ({ run, results }) => `
    Analyze this recipe for gluten content:
    "${results.preprocessStepResult.recipeText}"

    Look for wheat, barley, rye, and hidden sources like soy sauce.
    Return JSON with isGlutenFree, glutenSources array, and confidence (0-1).
  `

```

**Data Flow:** Results are available to subsequent steps as `results.analyzeStepResult`

### `generateScore` step (required)

Converts analysis results into a numerical score. This is the only required step in the pipeline.

**Functions:** `({ run, results }) => number`

```typescript
const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(...)
.generateScore(({ results }) => {
  const { isGlutenFree, confidence } = results.analyzeStepResult;

  // Return 1 for gluten-free, 0 for contains gluten
  // Weight by confidence level
  return isGlutenFree ? confidence : 0;

```

**Prompt Objects:** See the [`createScorer`](/reference/evals/create-scorer) API reference for details on using prompt objects with generateScore, including required `calculateScore` function.

**Data Flow:** The score is available to generateReason as the `score` parameter

### `generateReason` step (optional)

Generates human-readable explanations for the score, useful for debugging, transparency, or user feedback.

**Functions:** `({ run, results, score }) => string`

```typescript
const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(...)
.generateScore(...)
.generateReason(({ results, score }) => {
  const { isGlutenFree, glutenSources } = results.analyzeStepResult;

  if (isGlutenFree) {
    return `Score: ${score}. This recipe is gluten-free with no harmful ingredients detected.`;
  } else {
    return `Score: ${score}. Contains gluten from: ${glutenSources.join(', ')}`;

```

**Prompt Objects:** Use `description` and `createPrompt` for LLM-generated explanations.

```typescript
const glutenCheckerScorer = createScorer({...})
.preprocess(...)
.analyze(...)
.generateScore(...)
.generateReason({
  description: 'Explain the gluten assessment',
  createPrompt: ({ results, score }) => `
    Explain why this recipe received a score of ${score}.
    Analysis: ${JSON.stringify(results.analyzeStepResult)}

    Provide a clear explanation for someone with dietary restrictions.
  `

```

## Example: Create a custom scorer

A custom scorer in Mastra uses `createScorer` with four core components:

1. [**Judge Configuration**](#judge-configuration)
1. [**Analysis Step**](#analysis-step)
1. [**Score Generation**](#score-generation)
1. [**Reason Generation**](#reason-generation)

Together, these components allow you to define custom evaluation logic using LLMs as judges.

> **Info:**
Visit [createScorer](/reference/evals/create-scorer) for the full API and configuration options.


```typescript
export const GLUTEN_INSTRUCTIONS = `You are a Chef that identifies if recipes contain gluten.`

export const generateGlutenPrompt = ({
  output,
}: {
  output: string
}) => `Check if this recipe is gluten-free.

Check for:
- Wheat
- Barley
- Rye
- Common sources like flour, pasta, bread

Example with gluten:
"Mix flour and water to make dough"
Response: {
  "isGlutenFree": false,
  "glutenSources": ["flour"]

Example gluten-free:
"Mix rice, beans, and vegetables"
Response: {
  "isGlutenFree": true,
  "glutenSources": []

Recipe to analyze:
${output}

Return your response in this format:

  "isGlutenFree": boolean,
  "glutenSources": ["list ingredients containing gluten"]
}`

export const generateReasonPrompt = ({
  isGlutenFree,
  glutenSources,
}: {
  isGlutenFree: boolean
  glutenSources: string[]
}) => `Explain why this recipe is${isGlutenFree ? '' : ' not'} gluten-free.

${glutenSources.length > 0 ? `Sources of gluten: ${glutenSources.join(', ')}` : 'No gluten-containing ingredients found'}

Return your response in this format:
"This recipe is [gluten-free/contains gluten] because [explanation]"`

export const glutenCheckerScorer = createScorer({
  id: 'gluten-checker',
  description: 'Check if the output contains any gluten',
  judge: {
    model: 'openai/gpt-5-mini',
    instructions: GLUTEN_INSTRUCTIONS,
  },

  .analyze({
    description: 'Analyze the output for gluten',
    outputSchema: z.object({
      isGlutenFree: z.boolean(),
      glutenSources: z.array(z.string()),
    }),
    createPrompt: ({ run }) => {
      const { output } = run
      return generateGlutenPrompt({ output: output.text })
    },

  .generateScore(({ results }) => {
    return results.analyzeStepResult.isGlutenFree ? 1 : 0

  .generateReason({
    description: 'Generate a reason for the score',
    createPrompt: ({ results }) => {
      return generateReasonPrompt({
        glutenSources: results.analyzeStepResult.glutenSources,
        isGlutenFree: results.analyzeStepResult.isGlutenFree,

    },

```

### Judge Configuration

Sets up the LLM model and defines its role as a domain expert.

```typescript
judge: {
  model: 'openai/gpt-5-mini',
  instructions: GLUTEN_INSTRUCTIONS,

```

### Analysis Step

Defines how the LLM should analyze the input and what structured output to return.

```typescript
.analyze({
  description: 'Analyze the output for gluten',
  outputSchema: z.object({
    isGlutenFree: z.boolean(),
    glutenSources: z.array(z.string()),
  }),
  createPrompt: ({ run }) => {
    const { output } = run;
    return generateGlutenPrompt({ output: output.text });
  },

```

The analysis step uses a prompt object to:

- Provide a clear description of the analysis task
- Define expected output structure with Zod schema (both boolean result and list of gluten sources)
- Generate dynamic prompts based on the input content

### Score Generation

Converts the LLM's structured analysis into a numerical score.

```typescript
.generateScore(({ results }) => {
  return results.analyzeStepResult.isGlutenFree ? 1 : 0;

```

The score generation function takes the analysis results and applies business logic to produce a score. In this case, the LLM directly determines if the recipe is gluten-free, so we use that boolean result: 1 for gluten-free, 0 for contains gluten.

### Reason Generation

Provides human-readable explanations for the score using another LLM call.

```typescript
.generateReason({
  description: 'Generate a reason for the score',
  createPrompt: ({ results }) => {
    return generateReasonPrompt({
      glutenSources: results.analyzeStepResult.glutenSources,
      isGlutenFree: results.analyzeStepResult.isGlutenFree,
    });
  },

```

The reason generation step creates explanations that help users understand why a particular score was assigned, using both the boolean result and the specific gluten sources identified by the analysis step.

## High gluten-free example

```typescript
const result = await glutenCheckerScorer.run({
  input: [{ role: 'user', content: 'Mix rice, beans, and vegetables' }],
  output: { text: 'Mix rice, beans, and vegetables' },

console.log('Score:', result.score)
console.log('Gluten sources:', result.analyzeStepResult.glutenSources)
console.log('Reason:', result.reason)
```

### High gluten-free output

```typescript

  score: 1,
  analyzeStepResult: {
    isGlutenFree: true,
    glutenSources: []
  },
  reason: 'This recipe is gluten-free because rice, beans, and vegetables are naturally gluten-free ingredients that are safe for people with celiac disease.'

```

## Partial gluten example

```typescript
const result = await glutenCheckerScorer.run({
  input: [{ role: 'user', content: 'Mix flour and water to make dough' }],
  output: { text: 'Mix flour and water to make dough' },

console.log('Score:', result.score)
console.log('Gluten sources:', result.analyzeStepResult.glutenSources)
console.log('Reason:', result.reason)
```

### Partial gluten output

```typescript

  score: 0,
  analyzeStepResult: {
    isGlutenFree: false,
    glutenSources: ['flour']
  },
  reason: 'This recipe is not gluten-free because it contains flour. Regular flour is made from wheat and contains gluten, making it unsafe for people with celiac disease or gluten sensitivity.'

```

## Low gluten-free example

```typescript
const result = await glutenCheckerScorer.run({
  input: [{ role: 'user', content: 'Add soy sauce and noodles' }],
  output: { text: 'Add soy sauce and noodles' },

console.log('Score:', result.score)
console.log('Gluten sources:', result.analyzeStepResult.glutenSources)
console.log('Reason:', result.reason)
```

### Low gluten-free output

```typescript

  score: 0,
  analyzeStepResult: {
    isGlutenFree: false,
    glutenSources: ['soy sauce', 'noodles']
  },
  reason: 'This recipe is not gluten-free because it contains soy sauce, noodles. Regular soy sauce contains wheat and most noodles are made from wheat flour, both of which contain gluten and are unsafe for people with gluten sensitivity.'

```

**Examples and Resources:**

- [createScorer API Reference](/reference/evals/create-scorer) - Complete technical documentation
- [Built-in Scorers Source Code](https://github.com/mastra-ai/mastra/tree/main/packages/evals/src/scorers) - Real implementations for reference

---



# Observability

# Observability overview

Mastra's observability system gives you visibility into every agent run, workflow step, tool call, and model interaction. It captures three complementary signals that work together to help you understand what your application is doing and why.

- [**Tracing**](/docs/observability/tracing/overview): Records every operation as a hierarchical timeline of spans, capturing inputs, outputs, token usage, and timing.
- [**Logging**](/docs/observability/logging): Forwards structured log entries from your application and Mastra internals to observability storage, correlated to traces automatically.
- [**Metrics**](/docs/observability/metrics/overview): Extracts duration, token usage, and cost data from traces automatically, with no additional instrumentation required.

## When to use observability

- Debug unexpected agent behavior by inspecting the full decision path, tool calls, and model responses.
- Monitor latency across agents, workflows, and tools to identify bottlenecks.
- Track token consumption and estimated cost over time to control spending.
- Diagnose workflow failures by tracing execution through each step.
- Compare agent performance before and after prompt or model changes.

## How the pieces fit together

Tracing is the foundation. When observability is configured, every agent run, workflow execution, tool call, and model interaction produces a [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans). Spans are organized into traces that show the full request lifecycle as a hierarchical timeline.

Metrics are derived from traces automatically. When a span ends, Mastra extracts duration, token counts, and cost estimates without any extra code. These metrics power the dashboards in [Studio](/docs/studio/observability).

Logs are correlated to traces automatically. Every `logger.info()`, `logger.warn()`, or `logger.error()` call within a traced context is tagged with the current trace and span IDs. You can navigate from a log entry directly to the trace that produced it.

All three signals share correlation IDs (trace ID, span ID, entity type, entity name), so you can jump between a metric spike, the traces behind it, and the logs within those traces.

## Get started

Install `@mastra/observability` and a storage backend:

```bash npm2yarn
npm install @mastra/observability @mastra/libsql @mastra/duckdb
```

Then configure observability in your Mastra instance. The following example uses composite storage to route observability data to DuckDB (which supports metrics aggregation) while keeping everything else in LibSQL:

```ts
  Observability,
  DefaultExporter,
  CloudExporter,
  SensitiveDataFilter,
} from '@mastra/observability'

export const mastra = new Mastra({
  storage: new MastraCompositeStore({
    id: 'composite-storage',

      id: 'mastra-storage',
      url: 'file:./mastra.db',
    }),

      observability: await new DuckDBStore().getStore('observability'),
    },
  }),
  observability: new Observability({
    configs: {

        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // Persists traces to storage for Mastra Studio
          new CloudExporter(), // Sends traces to Mastra Cloud (if MASTRA_CLOUD_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),

```

This enables tracing, log forwarding, and metrics. Mastra also supports external tracing providers like Langfuse, Datadog, and any OpenTelemetry-compatible platform. See [Tracing](/docs/observability/tracing/overview) for configuration details.

## Storage

Not all storage backends support every signal. Traces and logs work with most backends, but metrics require an OLAP-capable store like DuckDB (development) or ClickHouse (production). For the full compatibility list, see [storage provider support](/docs/observability/tracing/exporters/default#storage-provider-support).

For production environments with high traffic, use composite storage to route the observability domain to a dedicated backend. See [production recommendations](/docs/observability/tracing/exporters/default#production-recommendations) for details.

## Next steps

- [Tracing](/docs/observability/tracing/overview)
- [Logging](/docs/observability/logging)
- [Metrics](/docs/observability/metrics/overview)
- [Mastra Studio](/docs/studio/observability)
- [Automatic metrics reference](/reference/observability/metrics/automatic-metrics)

---

# Logging

Mastra's logging system captures function execution, input data, and output responses in a structured format.

When deploying to Mastra Cloud, logs are shown on the [Logs](/docs/mastra-cloud/observability) page. In self-hosted or custom environments, logs can be directed to files or external services depending on the configured transports.

## Configuring logs with `PinoLogger`

When [initializing a new Mastra project](/guides/getting-started/quickstart) using the CLI, `PinoLogger` is included by default.

```typescript
export const mastra = new Mastra({
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),

```

> **Info:**
Visit [PinoLogger](/reference/logging/pino-logger) for all available configuration options.


## Logging to observability storage

When [observability](/docs/observability/overview) is configured, all logger calls are automatically forwarded to your observability storage. This means every `debug`, `info`, `warn`, `error`, and `trackException` call from your application and from Mastra's internal components appears alongside your traces.

No code changes are required. Mastra wraps the configured logger so that it writes to both the original logger (console, file, or custom transport) and the observability system simultaneously.

### Configuring observability log level

You can control which log levels reach observability storage independently from your console logger. Add a `logging` option to your observability instance configuration:

```typescript
export const mastra = new Mastra({
  logger: new PinoLogger({ name: 'Mastra', level: 'debug' }),
  observability: new Observability({
    configs: {

        serviceName: 'my-app',
        exporters: [new DefaultExporter()],
        logging: {
          enabled: true, // set to false to disable log forwarding
          level: 'info', // minimum level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
        },
      },
    },
  }),

```

In this example, the console logger outputs all levels starting from `debug`, but only `info` and above are written to observability storage. This keeps your storage clean while still having verbose console output during development.

| Option | Type | Default | Description |
| - | - | - | - |
| `enabled` | `boolean` | `true` | Set to `false` to disable all log forwarding to observability storage. |
| `level` | `LogLevel` | `'debug'` | Minimum severity level. Logs below this level are discarded. |

### Querying logs

Logs written to observability storage are queryable through the Mastra client SDK:

```typescript
const client = new MastraClient()

const logs = await client.listLogsVNext({
  filters: { level: 'error' },
  pagination: { page: 1, perPage: 50 },
  orderBy: { field: 'timestamp', direction: 'desc' },

```

When using a persistent storage backend like DuckDB or ClickHouse, logs survive restarts and are available for historical analysis.

## Customizing logs

Mastra provides access to a logger instance via the `mastra.getLogger()` method, available inside both workflow steps and tools. The logger supports standard severity levels: `debug`, `info`, `warn`, and `error`.

### Logging from workflow steps

Within a workflow step, access the logger via the `mastra` parameter inside the `execute` function. This allows you to log messages relevant to the step's execution.

```typescript
const step1 = createStep({
  execute: async ({ mastra }) => {
    const logger = mastra.getLogger();
    logger.info("workflow info log");

    return {
      output: ""
    };

});

export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
```

### Logging from tools

Similarly, tools have access to the logger instance via the `mastra` parameter. Use this to log tool-specific activity during execution.

```typescript
export const testTool = createTool({
  execute: async (inputData, context) => {
    const logger = context?.mastra.getLogger()
    logger?.info('tool info log')

    return {
      output: '',

  },

```

### Logging with additional data

Logger methods accept an optional second argument for additional data. Pass a structured object to make logs filterable in observability storage.

```typescript
const step1 = createStep({
  execute: async ({ mastra }) => {
    const testAgent = mastra.getAgent("testAgent");
    const logger = mastra.getLogger();
    
    logger.info("workflow info log", { agent: testAgent });

    return {
      output: ""
    };

});

export const testWorkflow = createWorkflow({...})
  .then(step1)
  .commit();
```

---



# Deployment

# Deployment overview

Mastra applications can be deployed to any Node.js-compatible environment. You can deploy a Mastra server, integrate with an existing web framework, deploy to cloud providers, or use Mastra Cloud for managed hosting.

## Runtime support

Mastra can run against any of these runtime environments:

- Node.js `v22.13.0` or later
- Bun
- Deno
- Cloudflare

## Deployment options

### Mastra Server

Mastra provides a [server](/docs/server/mastra-server) powered by Hono that can be deployed independently. Use the `mastra build` command to build your application and deploy the output to your preferred VM, container, or PaaS platform.

Use this option when you need full control over your infrastructure, long-running processes, or WebSocket connections. The [Mastra server deployment guide](/docs/deployment/mastra-server) provides more details.

### Monorepo

Deploy a Mastra server as part of a monorepo setup, following the same approach as standalone deployment.

Read about [monorepo deployment](/docs/deployment/monorepo).

### Cloud Providers

Mastra applications can be deployed to cloud providers and serverless platforms. Mastra includes optional built-in deployers for Vercel, Netlify, and Cloudflare to automate the build and deployment process.

Use this option for auto-scaling, minimal infrastructure management, or when you're already using one of these platforms.

- [Amazon EC2](/guides/deployment/amazon-ec2)
- [AWS Lambda](/guides/deployment/aws-lambda)
- [Azure App Services](/guides/deployment/azure-app-services)
- [Cloudflare](/guides/deployment/cloudflare)
- [Digital Ocean](/guides/deployment/digital-ocean)
- [Netlify](/guides/deployment/netlify)
- [Vercel](/guides/deployment/vercel)

### Web Framework

When Mastra is integrated with a web framework, it deploys alongside your application using the framework's standard deployment process. The guides below cover framework-specific configuration requirements for deployment.

Use these guides when adding Mastra to an existing Next.js or Astro application.

- [With Next.js on Vercel](/docs/deployment/web-framework#with-nextjs-on-vercel)
- [With Astro on Vercel](/docs/deployment/web-framework#with-astro-on-vercel)
- [With Astro on Netlify](/docs/deployment/web-framework#with-astro-on-netlify)

### Mastra Cloud

We're building Mastra Cloud to be the easiest place to deploy and observe your Mastra agents. It's currently in beta.

Learn more in the [Mastra Cloud docs](/docs/mastra-cloud/overview).

## Workflow runners

Mastra workflows run using the built-in execution engine by default. For production workloads requiring managed infrastructure, workflows can also be deployed to specialized platforms like [Inngest](https://www.inngest.com) that provide step memoization, automatic retries, and real-time monitoring.

Visit the [Workflow Runners guide](/docs/deployment/workflow-runners) for execution options and the [Inngest deployment guide](/guides/deployment/inngest) for setup instructions.

---

# Deploy a Mastra server

Mastra compiles your application into a standalone Node.js server that can run on any platform supporting Node.js, Bun, or Deno.

> **Tip:**
This guide covers deploying the standalone server generated by `mastra build`. If you need to integrate Mastra into an existing Express or Hono application, see [Server Adapters](/docs/server/server-adapters) instead.


## Building your application

Run the build command from your project root:

```bash
mastra build
```

This creates a `.mastra` directory containing your production-ready server.

> **Info:**
Read the [`mastra build`](/reference/cli/mastra#mastra-build) reference for all available flags.


## Build output

After building, Mastra creates the following structure:

```
.mastra/
├── .build/                # Intermediate build artifacts (module maps, analysis)
└── output/
    ├── index.mjs          # Server entry point
    ├── mastra.mjs         # Your bundled Mastra configuration
    ├── tools.mjs          # Aggregated tool exports
    ├── tools/             # Individual tool bundles
    ├── package.json       # Production dependencies
    ├── node_modules/      # Installed dependencies
    ├── .npmrc             # Copied from your project (if present)
    ├── public/            # Static assets (if src/mastra/public exists)
    └── playground/        # Studio UI (if --studio flag used)
```

The `output` directory is self-contained. You can copy it to any server and run it directly.

## Running the server

Start the server using the Mastra CLI:

```bash
mastra start
```

Or run directly with Node.js:

```bash
node .mastra/output/index.mjs
```

The `mastra start` command provides additional features:

- Loads environment variables from `.env.production` and `.env`
- Provides helpful error messages for missing modules
- Handles process signals for graceful shutdown

> **Info:**
Read the [`mastra start`](/reference/cli/mastra#mastra-start) reference for all available flags.


## Build configuration

### Public folder

If a `public` folder exists in your Mastra directory (`src/mastra/public`), its contents are copied to the output directory during build. These files are served as static assets by the server.

### Mastra configuration

The build process respects configuration in your Mastra instance. For server behavior like CORS, timeouts, and middleware, see [server overview](/docs/server/mastra-server). For all available options, see the [configuration reference](/reference/configuration).

## Build process

The build follows these steps:

1. **Locates entry file**: Finds `index.ts` or `index.js` in your Mastra directory.
1. **Discovers tools**: Scans for tool files matching `{mastraDir}/tools/**/*.{js,ts}`, excluding test files.
1. **Analyzes dependencies**: Determines which packages to bundle vs. install externally.
1. **Bundles code**: Uses Rollup with tree-shaking and optional source maps.
1. **Generates server**: Creates a Hono-based HTTP server as `index.mjs`.
1. **Installs dependencies**: Runs `npm install` in the output directory.
1. **Copies assets**: Copies `public` folder and `.npmrc` if present.

## Environment variables

| Variable | Description |
| - | - |
| `PORT` | Server port (default: `4111`) |
| `MASTRA_STUDIO_PATH` | Path to Studio build directory (default: `./playground`) |
| `MASTRA_SKIP_DOTENV` | Skip loading `.env` files when set |
| `NODE_OPTIONS` | Node.js options (e.g., `--max-old-space-size=4096` for build memory issues) |

## Server endpoints

The built server exposes endpoints for health checks, agents, workflows, and more:

| Endpoint | Description |
| - | - |
| `GET /health` | Health check endpoint, returns `200 OK` |
| `GET /api/openapi.json` | OpenAPI specification (if `server.build.openAPIDocs` is enabled). |
| `GET /swagger-ui` | Interactive API documentation (if `server.build.swaggerUI` is enabled) |

This list isn't exhaustive. To view all endpoints, run `mastra dev` and visit `http://localhost:4111/swagger-ui`.

To add your own endpoints, see [Custom API Routes](/docs/server/custom-api-routes).

## Troubleshooting

### Memory errors during build

If you encounter `JavaScript heap out of memory` errors:

```bash
NODE_OPTIONS="--max-old-space-size=4096" mastra build
```

## Related

- [Server Overview](/docs/server/mastra-server) - Configure server behavior, middleware, and authentication
- [Server Adapters](/docs/server/server-adapters) - Use Express or Hono instead of `mastra build`
- [Custom API Routes](/docs/server/custom-api-routes) - Add custom HTTP endpoints
- [Configuration Reference](/reference/configuration) - Full configuration options

---

# Deploy to cloud providers

Mastra applications can be deployed to cloud providers and serverless platforms. Mastra includes optional built-in deployers for Vercel, Netlify, and Cloudflare to automate the deployment process.

## Supported cloud providers

The following guides show how to deploy Mastra to specific cloud providers:

- [Amazon EC2](/guides/deployment/amazon-ec2)
- [AWS Lambda](/guides/deployment/aws-lambda)
- [Azure App Services](/guides/deployment/azure-app-services)
- [Cloudflare](/guides/deployment/cloudflare)
- [Digital Ocean](/guides/deployment/digital-ocean)
- [Netlify](/guides/deployment/netlify)
- [Vercel](/guides/deployment/vercel)

---



# Server

# Server overview

Mastra runs as an HTTP server that exposes your agents, workflows, and other functionality as API endpoints. The server handles request routing, middleware execution, authentication, and streaming responses.

> **Info:**
This page covers the [`server`](/reference/configuration#server-options) configuration options passed to the `Mastra` constructor. For running Mastra with your own HTTP server (Hono, Express, etc.), visit [Server Adapters](/docs/server/server-adapters).


## Server architecture

Mastra uses [Hono](https://hono.dev) as its underlying HTTP server framework. When you build a Mastra application using `mastra build`, it generates a Hono-based HTTP server in the `.mastra` directory.

The server provides:

- API endpoints for all registered agents and workflows
- Custom API routes and middleware
- Authentication across providers
- Request context for dynamic configuration
- Stream data redaction for secure responses

## Configuration

Configure the server by passing a `server` object to the `Mastra` constructor:

```typescript
export const mastra = new Mastra({
  server: {
    port: 3000, // Defaults to PORT env var or 4111
    host: '0.0.0.0', // Defaults to MASTRA_HOST env var or 'localhost'
  },

```

> **Info:**
Visit the [configuration reference](/reference/configuration#server-options) for a full list of available server options.


## Server features

- **[Middleware](/docs/server/middleware)**: Intercept requests for authentication, logging, CORS, or injecting request-specific context.
- **[Custom API Routes](/docs/server/custom-api-routes)**: Extend the server with your own HTTP endpoints that have access to the Mastra instance.
- **[Request Context](/docs/server/request-context)**: Pass request-specific values to agents, tools, and workflows based on runtime conditions.
- **[Server Adapters](/docs/server/server-adapters)**: Run Mastra with Express, Hono, or your own HTTP server instead of the generated server.
- **[Custom Adapters](/docs/server/custom-adapters)**: Build adapters for frameworks not officially supported.
- **[Mastra Client SDK](/docs/server/mastra-client)**: Type-safe client for calling agents, workflows, and tools from browser or server environments.
- **[Authentication](/docs/server/auth)**: Secure endpoints with JWT, Clerk, Supabase, Firebase, Auth0, or WorkOS.

## REST API

You can explore all available endpoints in the OpenAPI specification at [http://localhost:4111/api/openapi.json](http://localhost:4111/api/openapi.json), which details every endpoint and its request and response schemas.

To explore the API interactively, visit the Swagger UI at [http://localhost:4111/swagger-ui](http://localhost:4111/swagger-ui). Here, you can discover endpoints and test them directly from your browser.

> **Note:**
The OpenAPI and Swagger endpoints are disabled in production by default. To enable them, set [`server.build.openAPIDocs`](/reference/configuration#serverbuild) and [`server.build.swaggerUI`](/reference/configuration#serverbuild) to `true` respectively.


## OpenAI Responses API

Mastra exposes OpenAI-compatible Responses and Conversations routes that let you use Mastra Agents as a Responses API. These routes are agent-backed adapters over Mastra agents, memory, and storage, so requests run through the selected Mastra agent instead of acting as a raw provider proxy.

These APIs are currently experimental.

Use `agent_id` to select the Mastra agent that should handle the request. Initial requests target an agent directly, and stored follow-up turns can continue with `previous_response_id`. You can also pass `model` to override the agent's configured model for a single request. If you omit `model`, Mastra uses the model already configured on the agent.

The Responses routes support streaming, function calling (tools), stored continuations with `previous_response_id`, conversation threads through `conversation_id`, provider-specific passthrough with `providerOptions`, and JSON output through `text.format`.

For the full request and response contract, see the [Responses API reference](/reference/client-js/responses) and [Conversations API reference](/reference/client-js/conversations). For the complete list of HTTP routes, see [server routes](/reference/server/routes#responses-api).

## Stream data redaction

When streaming agent responses, the HTTP layer redacts system prompts, tool definitions, API keys, and similar data from each chunk before sending it to clients. This is enabled by default.

This behavior is only configurable by using [server adapters](/docs/server/server-adapters#stream-data-redaction). For server adapters, stream data redaction is enabled by default, too.

## TypeScript configuration

Mastra requires `module` and `moduleResolution` settings compatible with modern Node.js. Legacy options like `CommonJS` or `node` aren't supported.

```json

  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]

```

---

# Custom API routes

By default, Mastra automatically exposes registered agents and workflows via its server. For additional behavior you can define your own HTTP routes.

Routes are provided with a helper `registerApiRoute()` from `@mastra/core/server`. Routes can live in the same file as the `Mastra` instance but separating them helps keep configuration concise.

```typescript
export const mastra = new Mastra({
  server: {
    apiRoutes: [
      registerApiRoute('/my-custom-route', {
        method: 'GET',
        handler: async c => {
          const mastra = c.get('mastra')
          const agent = await mastra.getAgent('my-agent')

          return c.json({ message: 'Custom route' })
        },
      }),
    ],
  },

```

Once registered, a custom route will be accessible from the root of the server. For example:

```bash
curl http://localhost:4111/my-custom-route
```

Each route's handler receives the Hono `Context`. Within the handler you can access the `Mastra` instance to fetch or call agents and workflows.

## Middleware

To add route-specific middleware pass a `middleware` array when calling `registerApiRoute()`.

```typescript
export const mastra = new Mastra({
  server: {
    apiRoutes: [
      registerApiRoute('/my-custom-route', {
        method: 'GET',
        middleware: [
          async (c, next) => {
            console.log(`${c.req.method} ${c.req.url}`)
            await next()
          },
        ],
        handler: async c => {
          return c.json({ message: 'Custom route with middleware' })
        },
      }),
    ],
  },

```

## OpenAPI documentation

Custom routes can include OpenAPI metadata to appear in the Swagger UI alongside Mastra server routes. You can access the OpenAPI spec at `/api/openapi.json`, where both custom routes and built-in routes are listed. Pass an `openapi` option with standard OpenAPI operation fields.

```typescript
export const mastra = new Mastra({
  server: {
    apiRoutes: [
      registerApiRoute('/items/:itemId', {
        method: 'GET',
        openapi: {
          summary: 'Get item by ID',
          description: 'Retrieves a single item by its unique identifier',
          tags: ['Items'],
          parameters: [

              name: 'itemId',
              in: 'path',
              required: true,
              description: 'The item ID',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Item found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Item not found',
            },
          },
        },
        handler: async c => {
          const itemId = c.req.param('itemId')
          return c.json({ id: itemId, name: 'Example Item' })
        },
      }),
    ],
  },

```

### Using Zod Schemas

Zod schemas in the `openapi` configuration are converted to JSON Schema when the OpenAPI document is generated:

```typescript
const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),

const CreateItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),

export const mastra = new Mastra({
  server: {
    apiRoutes: [
      registerApiRoute('/items', {
        method: 'POST',
        openapi: {
          summary: 'Create a new item',
          tags: ['Items'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: CreateItemSchema,
              },
            },
          },
          responses: {
            201: {
              description: 'Item created',
              content: {
                'application/json': {
                  schema: ItemSchema,
                },
              },
            },
          },
        },
        handler: async c => {
          const body = await c.req.json()
          return c.json({ id: 'new-id', ...body }, 201)
        },
      }),
    ],
  },

```

### Viewing in Swagger UI

When running in development mode (`mastra dev`) or with `swaggerUI: true` in build options, your custom routes appear in the Swagger UI at `/swagger-ui`.

```typescript
export const mastra = new Mastra({
  server: {
    build: {
      swaggerUI: true, // Enable in production builds
    },
    apiRoutes: [
      // Your routes...
    ],
  },

```

## Authentication

When authentication is configured on your Mastra server, custom API routes require authentication by default. To make a route publicly accessible, set `requiresAuth: false`:

```typescript
export const mastra = new Mastra({
  server: {
    auth: new MastraJwtAuth({
      secret: process.env.MASTRA_JWT_SECRET,
    }),
    apiRoutes: [
      // Protected route (default behavior)
      registerApiRoute('/protected-data', {
        method: 'GET',
        handler: async c => {
          // Access authenticated user from request context
          const user = c.get('requestContext').get('user')
          return c.json({ message: 'Authenticated user', user })
        },
      }),

      // Public route (no authentication required)
      registerApiRoute('/webhooks/github', {
        method: 'POST',
        requiresAuth: false, // Explicitly opt out of authentication
        handler: async c => {
          const payload = await c.req.json()
          // Process webhook without authentication
          return c.json({ received: true })
        },
      }),
    ],
  },

```

### Authentication behavior

- **No auth configured**: All routes (built-in and custom) are public
- **Auth configured**:
  - Mastra-provided routes (`/api/agents/*`, `/api/workflows/*`, etc.) require authentication
  - Custom routes require authentication by default
  - Custom routes can opt out with `requiresAuth: false`

### Accessing user information

When a request is authenticated, the user object is available in the request context:

```typescript
registerApiRoute('/user-profile', {
  method: 'GET',
  handler: async c => {
    const requestContext = c.get('requestContext')
    const user = requestContext.get('user')

    return c.json({ user })
  },

```

For more information about authentication providers, see the [Auth documentation](/docs/server/auth).

## Continue generation after client disconnect

Built-in streaming helpers such as [`chatRoute()`](/reference/ai-sdk/chat-route) forward the incoming request's `AbortSignal` to `agent.stream()`. That's the right default when a browser disconnect should cancel the model call.

If you want the server to keep generating and persist the final response even after the client disconnects, build a custom route around the underlying `MastraModelOutput`. Start the agent stream without forwarding `c.req.raw.signal`, then call `consumeStream()` in the background so generation continues server-side.

```typescript
  createUIMessageStream,
  createUIMessageStreamResponse,
  InferUIMessageChunk,
  UIMessage,
} from 'ai'


export const mastra = new Mastra({
  server: {
    apiRoutes: [
      registerApiRoute('/chat/persist/:agentId', {
        method: 'POST',
        handler: async c => {
          const { messages, memory } = await c.req.json()
          const mastra = c.get('mastra')
          const agent = mastra.getAgent(c.req.param('agentId'))

          const stream = await agent.stream(messages, {
            memory,
            // Do not pass c.req.raw.signal if this route should keep running
            // after the client disconnects.

          void stream.consumeStream().catch(error => {
            mastra.getLogger()?.error('Background stream consumption failed', { error })

          const uiStream = createUIMessageStream({
            originalMessages: messages,
            execute: async ({ writer }) => {
              for await (const part of toAISdkStream(stream, { from: 'agent' })) {
                writer.write(part as InferUIMessageChunk)

            },

          return createUIMessageStreamResponse({ stream: uiStream })
        },
      }),
    ],
  },

```

> **Note:**
Use this pattern only when you intentionally want work to continue after the HTTP client is gone. If you want disconnects to cancel generation, keep using `chatRoute()` or forward the request `AbortSignal` yourself.


## Related

- [registerApiRoute() Reference](/reference/server/register-api-route) - Full API reference
- [Server Middleware](/docs/server/middleware) - Global middleware configuration
- [Mastra Server](/docs/server/mastra-server) - Server configuration options

---

# Middleware

Mastra servers can execute custom middleware functions before or after an API
route handler is invoked. This is useful for things like authentication,
logging, injecting request-specific context or adding CORS headers.

A middleware receives the [Hono](https://hono.dev) `Context` (`c`) and a `next`
function. If it returns a `Response` the request is short-circuited. Calling
`next()` continues processing the next middleware or route handler.

```typescript
export const mastra = new Mastra({
  server: {
    middleware: [

        handler: async (c, next) => {
          // Example: Add authentication check
          const authHeader = c.req.header('Authorization')
          if (!authHeader) {
            return new Response('Unauthorized', { status: 401 })

          await next()
        },
        path: '/api/*',
      },
      // Add a global request logger
      async (c, next) => {
        console.log(`${c.req.method} ${c.req.url}`)
        await next()
      },
    ],
  },

```

To attach middleware to a single route pass the `middleware` option to
`registerApiRoute`:

```typescript
registerApiRoute('/my-custom-route', {
  method: 'GET',
  middleware: [
    async (c, next) => {
      console.log(`${c.req.method} ${c.req.url}`)
      await next()
    },
  ],
  handler: async c => {
    const mastra = c.get('mastra')
    return c.json({ message: 'Hello, world!' })
  },

```

## Common examples

### Using `RequestContext`

You can populate `RequestContext` dynamically in server middleware by extracting information from the request. In this example, the `temperature-unit` is set based on the Cloudflare `CF-IPCountry` header to ensure responses match the user's locale.

```typescript
export const mastra = new Mastra({
  agents: { testWeatherAgent },
  server: {
    middleware: [
      async (context, next) => {
        const country = context.req.header('CF-IPCountry')
        const requestContext = context.get('requestContext')

        requestContext.set('temperature-unit', country === 'US' ? 'fahrenheit' : 'celsius')

        await next()
      },
    ],
  },

```

### Authentication

```typescript

  handler: async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });

    // Validate token here
    await next();
  },
  path: '/api/*',

```

### Authorization (User Isolation)

Authentication verifies who the user is. Authorization controls what they can access. Without authorization middleware, an authenticated user could access other users' threads by guessing IDs or manipulating the `resourceId` parameter.

Mastra provides reserved context keys that, when set by middleware, take precedence over client-provided values. The server automatically enforces these keys across memory and agent endpoints:

```typescript
export const mastra = new Mastra({
  server: {
    auth: {
      authenticateToken: async token => {
        // Your auth logic returns the user
        return verifyToken(token) // { id: 'user-123', ... }
      },
    },
    middleware: [

        path: '/api/*',
        handler: async (c, next) => {
          const token = c.req.header('Authorization')
          if (!token) {
            return c.json({ error: 'Unauthorized' }, 401)

          const user = await getAuthenticatedUser<{ id: string }>({
            mastra: c.get('mastra'),
            token,
            request: c.req.raw,

          const requestContext = c.get('requestContext')

          if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)

          // Force all API operations to use this user's ID
          // This takes precedence over any client-provided resourceId
          requestContext.set(MASTRA_RESOURCE_ID_KEY, user.id)

          return next()
        },
      },
    ],
  },

```

`server.middleware` runs before Mastra's per-route auth checks. When middleware needs the authenticated user, call `getAuthenticatedUser()` to resolve it from the configured auth provider without changing the default route auth flow.

With this middleware, the server automatically:

- **Filters thread listing** to only return threads owned by the user
- **Validates thread access** and returns 403 if accessing another user's thread
- **Forces thread creation** to use the authenticated user's ID
- **Validates message operations** including deletion, ensuring messages belong to owned threads

Even if a client passes `?resourceId=other-user-id`, the middleware-set value takes precedence. Attempts to access threads or messages owned by other users will return a 403 error.

#### Using `MASTRA_THREAD_ID_KEY`

You can also set `MASTRA_THREAD_ID_KEY` to override the client-provided thread ID:

```typescript
// Force operations to use a specific thread
requestContext.set(MASTRA_THREAD_ID_KEY, validatedThreadId)
```

This is useful when you want to restrict operations to a specific thread that you've validated through other means.

### CORS support

```typescript

  handler: async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    c.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });

    await next();
  },

```

### Request logging

```typescript

  handler: async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    console.log(`${c.req.method} ${c.req.url} - ${duration}ms`);
  },

```

### Special Mastra headers

When integrating with Mastra Cloud or custom clients the following headers can
be inspected by middleware to tailor behavior:

```typescript

  handler: async (c, next) => {
    const isFromMastraCloud = c.req.header('x-mastra-cloud') === 'true';
    const clientType = c.req.header('x-mastra-client-type');
    const isStudio =
      c.req.header('x-studio') === 'true';

    if (isFromMastraCloud) {
      // Special handling

    await next();
  },

```

- `x-mastra-cloud`: request originates from Mastra Cloud
- `x-mastra-client-type`: identifies the client SDK, e.g. `js` or `python`
- `x-studio`: request triggered from Studio

# Related

- [Request Context](/docs/server/request-context)
- [Reserved Keys](/docs/server/request-context#reserved-keys)

---

# Server adapters

Server adapters let you run Mastra with your own HTTP server instead of the Hono server generated by `mastra build`. They provide more control over the server setup, including custom middleware ordering, authentication, logging, and deployment configuration. You can still integrate Mastra into any Node.js application without changing how agents or workflows execute.

## When to use server adapters

- You want Mastra’s endpoints added automatically to an existing application
- You need direct access to the server instance for custom configuration
- Your team prefers using another server framework instead of the Hono server created by `mastra build`.

> **Tip:**
For deployments without custom server requirements, use `mastra build` instead. It configures server setup, registers middleware, and applies deployment settings based on your project configuration. See [Server Configuration](/docs/server/mastra-server).

If you want to use [Studio](/docs/studio/overview) with your server adapter, use [`mastra studio`](/reference/cli/mastra#mastra-studio) to only launch the Studio UI.


## Available adapters

Mastra currently provides these official server adapters:

- [@mastra/express](/reference/server/express-adapter)
- [@mastra/hono](/reference/server/hono-adapter)
- [@mastra/fastify](/reference/server/fastify-adapter)
- [@mastra/koa](/reference/server/koa-adapter)

You can build your own adapter, read [custom adapters](/docs/server/custom-adapters) for details.

## Installation

Install the adapter for the framework of your choice.


  ```bash npm2yarn
    npm install @mastra/express@latest
    ```

```bash npm2yarn
    npm install @mastra/hono@latest
    ```

```bash npm2yarn
    npm install @mastra/fastify@latest
    ```

```bash npm2yarn
    npm install @mastra/koa@latest
    ```

## Configuration

Initialize your app as usual, then create a `MastraServer` by passing in the `app` and your main `mastra` instance from `src/mastra/index.ts`. Calling `init()` automatically registers Mastra middleware and all available endpoints. You can continue adding your own routes as normal, either before or after `init()`, and they’ll run alongside Mastra’s endpoints.


  ```typescript {8} title="src/express-server.ts"
    import express from 'express'
    import { MastraServer } from '@mastra/express'
    import { mastra } from './mastra'

    const app = express()
    app.use(express.json())

    const server = new MastraServer({ app, mastra })

    await server.init()

    app.listen(4111, () => {
      console.log('Server running on port 4111')

    ```

    :::info

    See the [Express Adapter](/reference/server/express-adapter) documentation for full configuration options.

    :::

```typescript
    import { Hono } from 'hono'
    import { serve } from '@hono/node-server'
    import { HonoBindings, HonoVariables, MastraServer } from '@mastra/hono'
    import { mastra } from './mastra'

    const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>()

    const server = new MastraServer({ app, mastra })

    await server.init()

    serve({ fetch: app.fetch, port: 4111 }, () => {
      console.log('Server running on port 4111')

    ```

    :::info

    See the [Hono Adapter](/reference/server/hono-adapter) documentation for full configuration options.

    :::

```typescript
    import Fastify from 'fastify'
    import { MastraServer } from '@mastra/fastify'
    import { mastra } from './mastra'

    const app = Fastify()
    const server = new MastraServer({ app, mastra })

    await server.init()

    app.get('/health', async request => {
      const mastraInstance = request.mastra
      const agents = Object.keys(mastraInstance.listAgents())
      return { status: 'ok', agents }

    const port = 4111

    app.listen({ port }, () => {
      console.log(`Server running on http://localhost:${port}`)
      console.log(`Try: curl http://localhost:${port}/api/agents`)

    ```

    :::info

    See the [Fastify Adapter](/reference/server/fastify-adapter) documentation for full configuration options.

    :::

```typescript
    import Koa from 'koa'
    import bodyParser from 'koa-bodyparser'
    import { MastraServer } from '@mastra/koa'
    import { mastra } from './mastra'

    const app = new Koa()
    app.use(bodyParser()) // Required for body parsing

    const server = new MastraServer({ app, mastra })

    await server.init()

    app.use(async (ctx, next) => {
      if (ctx.path === '/health' && ctx.method === 'GET') {
        const mastraInstance = ctx.state.mastra
        const agents = Object.keys(mastraInstance.listAgents())
        ctx.body = { status: 'ok', agents }
        return

      await next()

    const port = 4111

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
      console.log(`Try: curl http://localhost:${port}/api/agents`)

    ```

    :::info

    See the [Koa Adapter](/reference/server/koa-adapter) documentation for full configuration options.

    :::

## Initialization flow

Calling `init()` runs three steps in order. Understanding this flow helps when you need to insert your own middleware at specific points.

1. `registerContextMiddleware()`: Attaches the Mastra instance, request context, tools, and abort signal to every request. This makes Mastra available to all subsequent middleware and route handlers.
1. `registerAuthMiddleware()`: Runs the adapter auth hook during initialization. Official adapters enforce auth inline when Mastra registers built-in routes and `registerApiRoute()` routes, so raw framework routes should use the adapter's exported `createAuthMiddleware()` helper when they need Mastra auth.
1. `registerRoutes()`: Registers all Mastra API routes for agents, workflows, and other features. Also registers MCP routes if MCP servers are configured.

### Manual initialization

For custom middleware ordering, call each method separately instead of `init()`. This is useful when you need middleware that runs before Mastra's context is set up, or when you need to insert logic between the initialization steps.

```typescript
const server = new MastraServer({ app, mastra });

// Your middleware first
app.use(loggingMiddleware);

server.registerContextMiddleware();

// Middleware that needs Mastra context
app.use(customMiddleware);

await server.registerRoutes();

// Routes after Mastra
app.get('/health', ...);
```

> **Tip:**
Use manual initialization when you need middleware that runs before Mastra's context is available, or when you need to insert middleware between the context and auth steps.


## Adding custom routes

You can add your own routes to the app alongside Mastra's routes.

- Routes added **before** `init()` won't have Mastra context available.
- Routes added **after** `init()` have access to the Mastra context (the Mastra instance, request context, authenticated user, etc.).
- When you want Mastra-managed auth and route metadata such as `requiresAuth`, prefer `registerApiRoute()`.
- When you mount routes directly on the framework app, use the adapter's exported `createAuthMiddleware()` helper if those routes need Mastra auth.

> **Info:**
Visit "Adding custom routes" for [Express](/reference/server/express-adapter#adding-custom-routes) and [Hono](/reference/server/hono-adapter#adding-custom-routes) for more information.


## Route prefixes

By default, Mastra routes are registered at `/api/agents`, `/api/workflows`, etc. Use the `prefix` option to change this. This is useful for API versioning or when integrating with an existing app that has its own `/api` routes.

```typescript
const server = new MastraServer({
  app,
  mastra,
  prefix: '/api/v2',

```

With this prefix, Mastra routes become `/api/v2/agents`, `/api/v2/workflows`, etc. Custom routes you add directly to the app aren't affected by this prefix.

## OpenAPI spec

Mastra can generate an OpenAPI specification for all registered routes. This is useful for documentation, client generation, or integration with API tools. Enable it by setting the `openapiPath` option:

```typescript
const server = new MastraServer({
  app,
  mastra,
  openapiPath: '/openapi.json',

```

The spec is generated from the Zod schemas defined on each route and served at the specified path. It includes all Mastra routes as well as any custom routes created with `createRoute()`.

## Stream data redaction

When streaming agent responses over HTTP, the HTTP streaming layer redacts sensitive information from stream chunks before sending them to clients. This prevents accidental exposure of:

- System prompts and agent instructions
- Tool definitions and their parameters
- API keys and other credentials in request bodies
- Internal configuration data

This redaction happens at the HTTP boundary, so internal callbacks like `onStepFinish` still have access to the full request data for debugging and observability purposes.

By default, redaction is enabled. Configure this behavior via `streamOptions`. Set `redact: false` only for internal services or debugging scenarios where you need access to the full request data in stream responses.

```typescript
const server = new MastraServer({
  app,
  mastra,
  streamOptions: {
    redact: true, // Default
  },

```

> **Info:**
See [MastraServer](/reference/server/mastra-server) for full configuration options.


## Per-route auth overrides

When authentication is configured on your Mastra instance, all routes require authentication by default. Sometimes you need exceptions: public health check endpoints, webhook receivers, or admin routes that need stricter controls.

Use `customRouteAuthConfig` to override authentication behavior for specific routes. Keys follow the format `METHOD:PATH` where method is `GET`, `POST`, `PUT`, `DELETE`, or `ALL`. Paths support wildcards (`*`) for matching multiple routes. Setting a value to `false` makes the route public, while `true` requires authentication.

```typescript
const server = new MastraServer({
  app,
  mastra,
  customRouteAuthConfig: new Map([
    // Public health check
    ['GET:/api/health', false],
    // Public API spec
    ['GET:/api/openapi.json', false],
    // Public webhook endpoints
    ['POST:/api/webhooks/*', false],
    // Require auth even if globally disabled
    ['POST:/api/admin/reset', true],
    // Protect all methods on internal routes
    ['ALL:/api/internal/*', true],
  ]),

```

> **Info:**
See [MastraServer](/reference/server/mastra-server) for full configuration options.


## Accessing the app

After creating the adapter, you may still need access to the underlying framework app. This is useful when passing it to a platform’s `serve` function or when adding routes from another module.

```typescript
// Via the MastraServer instance
const app = server.getApp()

// Via the Mastra instance (available after adapter construction)
const app = mastra.getServerApp()
```

Both methods return the same app instance. Use whichever is more convenient based on what's in scope.

## Server config vs adapter options

When using server adapters, configuration comes from two places: the Mastra `server` config (passed to the `Mastra` constructor) and the adapter constructor options. Understanding which options come from where helps avoid confusion when settings don't seem to take effect.

### Used by adapters

The adapter reads these settings from `mastra.getServer()`:

| Option | Description |
| - | - |
| `auth` | Authentication config, used by `registerAuthMiddleware()`. |
| `bodySizeLimit` | Default body size limit in bytes. Can be overridden per-adapter via `bodyLimitOptions`. |
| `onError` | Custom error handler called when an unhandled error occurs in a route handler. See [server.onError](/reference/configuration#serveronerror). |

### Adapter constructor only

These options are passed directly to the adapter constructor and aren't read from the Mastra config:

| Option | Description |
| - | - |
| `prefix` | Route path prefix |
| `openapiPath` | OpenAPI spec endpoint |
| `bodyLimitOptions` | Body size limit with custom error handler |
| `streamOptions` | Stream redaction settings |
| `customRouteAuthConfig` | Per-route auth overrides |
| `mcpOptions` | MCP transport options (e.g., `serverless: true` for stateless environments) |

### Not used by adapters

These `server` config options are only used by `mastra build` and have no effect when using adapters directly:

| Option | Used by |
| - | - |
| `port`, `host` | `mastra dev`, `mastra build` |
| `cors` | `mastra build` adds CORS middleware |
| `timeout` | `mastra build` |
| `apiRoutes` | `registerApiRoute()` for `mastra build` |
| `middleware` | Middleware config for `mastra build` |

When using adapters, configure these features directly with your framework. For example, add CORS middleware using Hono's or Express's built-in CORS packages, and set the port when calling your framework's listen function.

## MCP support

Server adapters register MCP (Model Context Protocol) routes during `registerRoutes()` when MCP servers are configured in your Mastra instance. MCP allows external tools and services to connect to your Mastra server and interact with your agents.

The adapter registers routes for both HTTP and SSE (Server-Sent Events) transports, enabling different client connection patterns.

### Serverless mode

For serverless environments like Cloudflare Workers or Vercel Edge, enable stateless mode via `mcpOptions`.

When using the Mastra deployer (the standard `mastra dev` / `mastra build` path), set `mcpOptions` in your server config:

```typescript
const mastra = new Mastra({
  server: {
    mcpOptions: {
      serverless: true,
    },
  },

```

When manually creating a server adapter, pass `mcpOptions` directly:

```typescript
const server = new MastraServer({
  app,
  mastra,
  mcpOptions: {
    serverless: true,
  },

```

When `serverless: true`, MCP HTTP requests run without session management, making them compatible with stateless execution environments.

See [MCP](/docs/mcp/overview) for configuration details and how to set up MCP servers.

## Related

- [Hono Adapter](/reference/server/hono-adapter): Hono-specific setup
- [Express Adapter](/reference/server/express-adapter): Express-specific setup
- [Custom Adapters](/docs/server/custom-adapters): Building adapters for other frameworks
- [Server Configuration](/docs/server/mastra-server): Using `mastra build` instead
- [Authentication](/docs/server/auth): Configuring auth for your server
- [MastraServer Reference](/reference/server/mastra-server): Full API reference
- [createRoute() Reference](/reference/server/create-route): Creating type-safe custom routes

---



# Studio

# Studio

Studio provides an interactive UI for building, testing, and managing your agents, workflows, and tools. Run it locally during development, or [deploy it](/docs/studio/deployment) to production so your team can manage agents, monitor performance, and gain insights through built-in observability.

Add [authentication](/docs/studio/auth) to protect your deployed Studio with login screens, role-based access control, and permission-based UI rendering so you can control what each team member can see and do. You can also [create a project in Mastra Cloud](/docs/mastra-cloud/setup) for a hosted option.

## Start Studio

If you created your application with `create mastra`, start the development server using the `dev` script. You can also run it directly with `mastra dev`.

```bash npm2yarn
npm run dev
```

Once the server is running, you can:

- Open the Studio UI at [http://localhost:4111](http://localhost:4111/) to interact with your agents, workflows, and tools.
- Visit [http://localhost:4111/swagger-ui](http://localhost:4111/swagger-ui) to discover and interact with the underlying REST API.

To run Studio in production, see [Studio deployment](/docs/studio/deployment). To run Studio independently from your Mastra server, use [`mastra studio`](/reference/cli/mastra#mastra-studio).

## Primitives

### Agents

Chat with your agent directly, dynamically switch [models](/models), and tweak settings like temperature and top-p to understand how they affect the output.

When you interact with your agent, you can follow each step of its reasoning, view tool call outputs, and [observe](#observability) traces and logs to see how responses are generated. You can also attach [scorers](#scorers) to measure and compare response quality over time.

### Workflows

Visualize your workflow as a graph and run it step by step with a custom input. During execution, the interface updates in real time to show the active step and the path taken.

When running a workflow, you can also view detailed traces showing tool calls, raw JSON outputs, and any errors that might have occurred along the way.

### Processors

View the input and output processors attached to each agent. The agent detail panel lists every processor by name and type, so you can verify your guardrails, token limiters, and custom processors are wired up correctly before testing.

See [processors](/docs/agents/processors) and [guardrails](/docs/agents/guardrails) for configuration details.

### MCP servers

List the MCP servers attached to your Mastra instance and explore their available tools.

### Tools

Run tools on their own to observe behavior and test them before assigning them to an agent. If something goes wrong, re-run a tool in isolation to debug the issue.

### Workspaces

Browse the files in your agent's workspace filesystem using a built-in file browser. Switch between workspace mounts, create directories, and view file contents with syntax highlighting. Writable workspaces allow directory creation and file deletion; read-only workspaces are labeled accordingly. The Skills tab lists all discovered skills with their instructions, references, and metadata. Install community skills from [skills.sh](https://skills.sh) or remove existing ones.

See [workspaces](/docs/workspace/overview) for configuration details.

### Request context

Set runtime variables that flow into your agent's instructions and tools through dependency injection. Edit request context as JSON or use a schema-driven form when your agent defines a `requestContextSchema`. Values persist across test chats and experiments, so you can trigger conditional flows without restarting.

See [request context](/docs/server/request-context) for configuration details.

## Evaluation

### Scorers

The Scorers tab displays the results of your agent's scorers as they run. When messages pass through your agent, the defined scorers evaluate each output asynchronously and render their results here. This allows you to understand how your scorers respond to different interactions, compare performance across test cases, and identify areas for improvement.

### Datasets

Create and manage collections of test cases to evaluate your agents and workflows. Import items from CSV or JSON, define input and ground-truth schemas, and pin to specific versions so you can reproduce experiments exactly. Run experiments with [scorers](/docs/evals/overview) to compare quality across prompts, models, or code changes.

See [datasets overview](/docs/evals/datasets/overview) for the full API and versioning details.

### Experiments

Run all items in a dataset against an agent, workflow, or scorer and collect the results in one place. Select a target, optionally attach scorers, and trigger the experiment. The results view shows each item's input, output, status, and individual score breakdowns. Compare two experiments side by side to measure the impact of prompt, model, or code changes.

See [datasets overview](/docs/evals/datasets/overview) for setup details.

## Observability

Visit the [Studio observability](/docs/studio/observability) docs to learn more.

## Settings

Configure the connection between Studio and your Mastra server. The settings page includes:

- **Mastra instance URL**: The base URL of your Mastra server (e.g. `http://localhost:4111`).
- **API prefix**: Optional path prefix for all API requests (defaults to `/api`).
- **Custom headers**: Add key-value pairs sent with every request, useful for authentication tokens or routing headers.
- **Theme**: Switch between dark, light, or system theme.

## Code configuration

In addition to the [settings](#settings) UI, you can configure the local development server and Studio also through the [`server`](/reference/configuration#server-options) option in your `src/mastra/index.ts`.

By default, Studio runs at [http://localhost:4111](http://localhost:4111). You can change the [`host`](/reference/configuration#serverhost) and [`port`](/reference/configuration#serverport).

Mastra also supports HTTPS development through the [`--https`](/reference/cli/mastra#--https) flag, which automatically creates and manages certificates for your project. When you run `mastra dev --https`, a private key and certificate are generated for localhost (or your configured host). Visit the [HTTPS reference](/reference/configuration#serverhttps) to learn more.

## Next steps

- Learn how to [deploy Studio](/docs/studio/deployment) for production use.
- Add [authentication](/docs/studio/auth) to control access to your deployed Studio.
- Explore [Studio observability](/docs/studio/observability) to monitor agent performance through metrics, traces, and logs.

---



# Mastra Cloud

# Mastra Cloud

[Mastra Cloud](https://cloud.mastra.ai) is a platform for deploying, managing, and monitoring Mastra applications. [Import your project](/docs/mastra-cloud/setup) to get started.

## Studio

Run [Studio](/docs/studio/overview) in the cloud and share access with your team via a link. Team members can test agents and workflows, tweak system prompts, and give feedback without running the project locally.

## Deploy

Enable [deployments](/docs/mastra-cloud/deployment) and Mastra Cloud hosts your server for you. Connect your GitHub repository for automatic deployments whenever you push to your configured branch. Mastra Cloud exposes your agents, tools, and workflows as REST API endpoints.

Once deployed, the project dashboard gives you visibility into:

- Deployment status and history
- Build logs and configuration
- Environment variables and settings

## Observability

[Observability](/docs/mastra-cloud/observability) provides insight into how your agents and workflows behave in production. View detailed traces of agent runs, workflow executions, and logs to debug issues and understand performance.

> **Info:**
You don’t need to deploy to Mastra Cloud to use Observability. You can send traces to Mastra from any environment

---

# Setup

Import your Mastra project to [Mastra Cloud](https://cloud.mastra.ai) to use [Studio](/docs/mastra-cloud/overview) and optionally [deploy](/docs/mastra-cloud/deployment) your agent.

## Before you begin

- [Sign in](https://cloud.mastra.ai) to Cloud
- Push your [Mastra project](/docs) to GitHub

## Options

![Select project type](/img/mastra-cloud/mastra-cloud-select.png)

When you create a new project, you can choose from three options:

1. **Create from GitHub** - Import a Mastra project from GitHub
1. **Create from your server** - Connect a self-hosted Mastra instance to [Studio](/docs/mastra-cloud/overview)
1. **Create from template** - Start from a [pre-built template](https://mastra.ai/templates)

To create a project from GitHub, follow these steps:

## Create from GitHub

Connect to GitHub when prompted

    ![Deployment details](/img/mastra-cloud/mastra-cloud-connect.png)

Search for your repository and click **Import**

    ![Deployment details](/img/mastra-cloud/mastra-cloud-import-git-repository.jpg)

Configure your project settings. Mastra Cloud auto-detects most settings, but you'll still need to enter the environment variables for your configured [model provider](/models):

    ![Deployment details](/img/mastra-cloud/mastra-cloud-deployment-details.jpg)

Click **Create Project**

## Next steps

Once your project is imported, [Studio](/docs/mastra-cloud/overview) automatically creates a sandbox where you can interact with your agents and share access with your team.

When you're ready for production, enable [Deployment](/docs/mastra-cloud/deployment) settings and hit deploy!

---



# Workspace

# Workspaces

**Added in:** `@mastra/core@1.1.0`

A Mastra workspace gives agents a persistent environment for storing files and executing commands. Agents use workspace tools to read and write files, run shell commands, and search indexed content.

A workspace supports the following features:

- **[Filesystem](/docs/workspace/filesystem)**: File storage (read, write, list, delete, copy, move, grep)
- **[Sandbox](/docs/workspace/sandbox)**: Command execution (shell commands) and background processes
- **[LSP inspection](/docs/workspace/lsp)**: Hover, definition, and implementation queries through language servers
- **[Search](/docs/workspace/search)**: BM25, vector, or hybrid search over indexed content
- **[Skills](/docs/workspace/skills)**: Reusable instructions for agents

## When to use workspaces

Use a workspace when your agent needs access to the local filesystem, shell commands, semantic code inspection, indexed search, or reusable skill instructions.

## How it works

When you assign a workspace to an agent, Mastra includes the corresponding tools in the agent's toolset. The agent can then use these tools to interact with files and execute commands.

You can create a workspace with any combination of the supported features. The agent receives only the tools relevant to what's configured.

## Usage

### Creating a workspace

Create a workspace by instantiating the `Workspace` class with your desired features:

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({
    basePath: './workspace',
  }),
  sandbox: new LocalSandbox({
    workingDirectory: './workspace',
  }),
  skills: ['/skills'],

```

The `skills` array specifies paths to directories containing skill definitions, see [Skills](/docs/workspace/skills).

### Global workspace

Set a workspace on the Mastra instance. All agents inherit this workspace unless they define their own:

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),

const mastra = new Mastra({
  workspace,

```

### Agent-level workspace

Assign a workspace directly to an agent to override the global workspace:

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './agent-workspace' }),

export const myAgent = new Agent({
  id: 'my-agent',
  model: 'openai/gpt-5.4',
  workspace,

```

## Configuration patterns

Workspaces support several configuration patterns depending on what capabilities your agent needs. The two main building blocks are `filesystem` (file tools) and `sandbox` (command execution), with `mounts` as the way to bridge cloud storage into sandboxes.

### Filesystem + sandbox (local)

For local development, pair a `LocalFilesystem` and `LocalSandbox` pointed at the same directory. Since both operate on the local machine, files written through the filesystem are immediately available to commands in the sandbox:

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  sandbox: new LocalSandbox({ workingDirectory: './workspace' }),

```

The agent receives both file tools and `execute_command`. This is the simplest full-featured setup.

### Mounts + sandbox (cloud storage)

When you need cloud storage accessible inside a sandbox, use `mounts`. This FUSE-mounts the cloud filesystem into the sandbox so commands can read and write files at the mount path:

```typescript
const workspace = new Workspace({
  mounts: {
    '/data': new S3Filesystem({
      bucket: 'my-bucket',
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
    '/skills': new GCSFilesystem({
      bucket: 'agent-skills',
    }),
  },
  sandbox: new E2BSandbox({ id: 'dev-sandbox' }),

```

Under the hood, `mounts` creates a [CompositeFilesystem](/docs/workspace/filesystem#mounts-and-compositefilesystem) that routes file tool operations to the correct provider based on path prefix. Commands in the sandbox access the mounted paths directly (e.g., `ls /data`).

You can mount multiple providers at different paths. Each mount path must be unique and non-overlapping.

> **Note:**
`filesystem` and `mounts` are mutually exclusive — you can't use both in the same workspace. Use `filesystem` for a single provider without a sandbox, or `mounts` when you need to combine cloud storage with a sandbox.


### Filesystem only

Use a single `filesystem` when agents only need to read and write files. No command execution is available.

```typescript
const workspace = new Workspace({
  filesystem: new S3Filesystem({
    bucket: 'my-bucket',
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),

```

The agent receives file tools (`read_file`, `write_file`, `list_directory`, `grep`, etc.) that operate directly against the storage provider.

### Sandbox only

Use a single `sandbox` when agents only need to execute commands. No file tools are added.

```typescript
const workspace = new Workspace({
  sandbox: new E2BSandbox({ id: 'dev-sandbox' }),

```

The agent receives the `execute_command` tool.

### Which pattern should I use?

| Scenario | Pattern |
| - | - |
| Local development with files and commands | `filesystem` + `sandbox` (both local, same directory) |
| Cloud storage accessible inside a cloud sandbox | `mounts` + `sandbox` |
| Multiple cloud providers in one sandbox | `mounts` + `sandbox` (one mount per provider) |
| Agent reads/writes files, no command execution needed | `filesystem` only |
| Agent runs commands, no file tools needed | `sandbox` only |

## Tool configuration

Configure tool behavior through the `tools` option on the workspace. This controls which tools are enabled and how they behave.

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  sandbox: new LocalSandbox({ workingDirectory: './workspace' }),
  tools: {
    // Global defaults
    enabled: true,
    requireApproval: false,

    // Per-tool overrides
    [WORKSPACE_TOOLS.FILESYSTEM.WRITE_FILE]: {
      requireApproval: true,
      requireReadBeforeWrite: true,
    },
    [WORKSPACE_TOOLS.FILESYSTEM.DELETE]: {
      enabled: false,
    },
    [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: {
      requireApproval: true,
    },
  },

```

### Tool options

| Option | Type | Description |
| - | - | - |
| `enabled` | `boolean \| (context) => boolean` | Whether the tool is available (default: `true`). When a function, evaluated at tool-listing time. |
| `requireApproval` | `boolean \| (context) => boolean` | Whether the tool requires user approval before execution (default: `false`). When a function, evaluated at execution time with access to `args`. |
| `requireReadBeforeWrite` | `boolean \| (context) => boolean` | For write tools: require reading the file first (default: `false`). When a function, evaluated at execution time with access to `args`. |
| `name` | `string` | Custom name for the tool. Replaces the default `mastra_workspace_*` name. |
| `maxOutputTokens` | `number` | Maximum tokens for tool output (default: `2000`). Output exceeding this limit is truncated using tiktoken. |

### Dynamic tool configuration

Tool options that accept functions receive a context object and return a boolean. This enables context-aware tool behavior.

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  tools: {
    // Dynamic enabled: disable command execution unless explicitly allowed
    [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: {
      enabled: async ({ requestContext }) => {
        return requestContext['allowExecution'] === 'true'
      },
    },

    // Dynamic requireApproval: only require approval for protected paths
    [WORKSPACE_TOOLS.FILESYSTEM.WRITE_FILE]: {
      requireApproval: async ({ args }) => {
        return (args.path as string).startsWith('/protected')
      },
      requireReadBeforeWrite: true,
    },
  },

```

Functions for `enabled` receive `{ requestContext, workspace }`. Functions for `requireApproval` and `requireReadBeforeWrite` also receive `args` since they are evaluated when the tool is called.

### Tool name remapping

Rename workspace tools to match the conventions your agent expects. The config key remains the original `WORKSPACE_TOOLS` constant — only the exposed name changes.

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  sandbox: new LocalSandbox({ workingDirectory: './workspace' }),
  lsp: true,
  tools: {
    [WORKSPACE_TOOLS.FILESYSTEM.READ_FILE]: { name: 'view' },
    [WORKSPACE_TOOLS.FILESYSTEM.GREP]: { name: 'search_content' },
    [WORKSPACE_TOOLS.FILESYSTEM.LIST_FILES]: { name: 'find_files' },
    [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: { name: 'execute_command' },
    [WORKSPACE_TOOLS.LSP.LSP_INSPECT]: { name: 'lsp_inspect' },
  },

```

The agent sees `view`, `search_content`, `find_files`, `execute_command`, and `lsp_inspect` instead of the default `mastra_workspace_*` names. Tool names must be unique — duplicate names or conflicts with other default names throw an error.

## LSP inspection

Enable `lsp` on a workspace to add semantic code inspection through language servers. This adds the `mastra_workspace_lsp_inspect` tool by default, which can return hover information, definition locations, and implementations for a symbol at a specific cursor position.

See [LSP inspection](/docs/workspace/lsp) for configuration, examples, and tool name remapping.

### Output truncation

Workspace tools automatically truncate large outputs to avoid exceeding LLM context limits. Two layers of truncation apply:

1. **Line-based tail**: Command output is limited to the last 200 lines by default (configurable per-command via the `tail` parameter)
1. **Token-based limit**: Tool output is capped at 2000 tokens by default

Set `maxOutputTokens` per tool to adjust the token limit:

```typescript
const workspace = new Workspace({
  // ...
  tools: {
    [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: {
      maxOutputTokens: 5000,
    },
  },

```

ANSI escape codes (colors, cursor sequences) are automatically stripped from command output before it reaches the model.

### Read-before-write

When `requireReadBeforeWrite` is enabled on write tools, agents must read a file before writing to it. This prevents overwriting files the agent hasn't seen:

- **New files**: Can be written without reading (they don't exist yet)
- **Existing files**: Must be read first
- **Externally modified files**: If a file changed since the agent read it, the write fails

File write safety is enforced at two layers:

1. **Tool layer**: Before a write tool runs, the read tracker checks whether the file was modified since it was last read. If it was, the tool throws a `FileReadRequiredError`.
1. **Filesystem layer**: At write time, `writeFile()` compares the file's current modification time against the expected value (passed via `expectedMtime` in write options). If they don't match, it throws a `StaleFileError`. This catches external modifications (for example, an editor saving the file) that happen between the tool-level check and the actual write.

When `requireReadBeforeWrite` is enabled, workspace tools pass the recorded modification time through automatically. You can also use `expectedMtime` directly when calling `filesystem.writeFile()` outside of tools:

```typescript
const stat = await filesystem.stat('/docs/file.md')
// ... later ...
await filesystem.writeFile('/docs/file.md', newContent, {
  expectedMtime: stat.modifiedAt,

```

## Initialization

Calling `init()` is optional in most cases—some providers initialize on first operation. Call `init()` manually when using a workspace outside of Mastra (standalone scripts, tests) or when you need to pre-provision resources before the first agent interaction.

```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  sandbox: new LocalSandbox({ workingDirectory: './workspace' }),

// Optional: pre-create directories and sandbox before first use
await workspace.init()
```

### What `init()` does

Initialization runs setup logic for each configured provider:

- `LocalFilesystem`: Creates the base directory if it doesn't exist
- `LocalSandbox`: Creates the working directory
- `Search` (if configured): Indexes files from `autoIndexPaths`, see [Search and Indexing](/docs/workspace/search)

External providers may perform additional setup like establishing connections or authenticating.

## Related

- [Filesystem](/docs/workspace/filesystem)
- [Sandbox](/docs/workspace/sandbox)
- [LSP inspection](/docs/workspace/lsp)
- [Skills](/docs/workspace/skills)
- [Search and indexing](/docs/workspace/search)
- [Workspace class reference](/reference/workspace/workspace-class)

---

