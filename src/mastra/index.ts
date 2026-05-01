
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { MastraEditor } from '@mastra/editor'
import { storage } from './storage';

// Agents
import { mathAgent } from './agents/math-agent';
import { copywriterAgent } from './agents/copywriter-agent';
import { editorAgent } from './agents/editor-agent';
import { publisherAgent } from './agents/publisher-agent';
import { newsAgent } from './agents/news-agent';
import { mastraclawAgent } from './agents/mastraclaw-agent';
import { intentClarifierAgent } from './agents/intent-clarifier-agent';
import { researchPlannerAgent } from './agents/research-planner-agent';
import { searchResultEvaluatorAgent } from './agents/search-result-evaluator-agent';
import { answererAgent } from './agents/answerer-agent';
import { queryPlannerAgent } from './agents/query-planner-agent';
import { retrievalEvaluatorAgent } from './agents/retrieval-evaluator-agent';
import { emailAgent } from './agents/email-agent';
import { voiceAgent } from './agents/voice-agent';
import { hybridVoiceAgent } from './agents/hybrid-voice-agent';
import { getKnowledgeBaseStore, VECTOR_STORE_NAME } from './tools/rag';

// Workflows
import { blogPostWorkflow } from './workflows/blog-post-workflow';
import { techTouchdownWorkflow } from './workflows/tech-touchdown-workflow';
import { deepSearch } from './workflows/deep-search-workflow';
import { ragWorkflow } from './workflows/rag-workflow';

// Custom routes
import { voiceSpeakRoute } from './routes/voice-speak-route';
import {
  workingMemoryRoute,
  updateWorkingMemoryRoute,
} from './routes/working-memory-route';
import { artifactFilesRoute } from './routes/artifact-files-route';
import { localModelStatusRoute } from './routes/local-model-route';
import { browserMirrorRoute } from './routes/browser-mirror-route';

// Scorers
import { basedScorer } from './scorers/based-scorer';

// MCP
import { docsMcpServer } from './mcp/docs-server';
import { composioProvider, arcadeProvider } from './tool-providers';

export const mastra = new Mastra({
  workflows: { blogPostWorkflow, techTouchdownWorkflow, deepSearch, ragWorkflow },
  agents: {
    mathAgent,
    copywriterAgent,
    editorAgent,
    publisherAgent,
    newsAgent,
    mastraclawAgent,
    intentClarifierAgent,
    researchPlannerAgent,
    searchResultEvaluatorAgent,
    answererAgent,
    queryPlannerAgent,
    retrievalEvaluatorAgent,
    emailAgent,
    voiceAgent,
    hybridVoiceAgent,
  },
  scorers: {
    basedScorer,
  },
  mcpServers: {
    docsMcpServer,
  },
  vectors: {
    [VECTOR_STORE_NAME]: getKnowledgeBaseStore(),
  },
  storage,
  server: {
    apiRoutes: [
      voiceSpeakRoute,
      workingMemoryRoute,
      updateWorkingMemoryRoute,
      artifactFilesRoute,
      localModelStatusRoute,
      browserMirrorRoute,
    ],
    // cors: {
    //   origin: ['http://localhost:4111'],
    //   allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    //   allowHeaders: ['Content-Type', 'Authorization', 'x-mastra-client-type'],
    //   credentials: true,
    // },
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  editor: new MastraEditor({
    toolProviders: {
      ...(composioProvider ? { composio: composioProvider } : {}),
      ...(arcadeProvider ? { arcade: arcadeProvider } : {}),
    },
  }),
  observability: new Observability({
    configs: {
      default: {
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
});

// Defensive wrapper: Mastra's built-in `/browser/:agentId/stream` websocket
// (registered automatically when any agent has a `.browser`) calls
// `mastra.getAgentById(agentId)` which throws on unknown agents. A stale
// browser tab opening a WS for an agent that no longer exists in this
// project (e.g. `weather-agent` from a prior demo) takes the whole process
// down because the error isn't caught upstream. Downstream code already
// handles `null` correctly (`if (!toolset) return;`), so swallowing the
// throw is safe and just avoids the crash.
const _origGetAgentById = (mastra as any).getAgentById.bind(mastra);
(mastra as any).getAgentById = function (agentId: string) {
  try {
    return _origGetAgentById(agentId);
  } catch (err: any) {
    console.warn(
      `[mastra] getAgentById("${agentId}") returned null (was: ${err?.message ?? err})`,
    );
    return null;
  }
};
