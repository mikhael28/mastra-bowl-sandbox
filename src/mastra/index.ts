
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { MastraEditor } from '@mastra/editor'
import { storage } from './storage';

// Agents
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
import { issueAnalyzerAgent } from './agents/issue-analyzer-agent';
import { prAnalyzerAgent } from './agents/pr-analyzer-agent';
import { prIssueLinkerAgent } from './agents/pr-issue-linker-agent';
import { duplicateFinderAgent } from './agents/duplicate-finder-agent';
import { triageChatAgent } from './agents/triage-chat-agent';
import { getKnowledgeBaseStore, VECTOR_STORE_NAME } from './tools/rag';

// Workflows
import { techTouchdownWorkflow } from './workflows/tech-touchdown-workflow';
import { deepSearch } from './workflows/deep-search-workflow';
import { ragWorkflow } from './workflows/rag-workflow';
import { triageWorkflow } from './workflows/triage-workflow';
import { triageUpdateWorkflow } from './workflows/triage-update-workflow';

// Custom routes
import { voiceSpeakRoute } from './routes/voice-speak-route';
import {
  workingMemoryRoute,
  updateWorkingMemoryRoute,
} from './routes/working-memory-route';
import { artifactFilesRoute } from './routes/artifact-files-route';
import { localModelStatusRoute } from './routes/local-model-route';
import { browserMirrorRoute } from './routes/browser-mirror-route';
import { triageDataRoute, triageHiddenRoute } from './routes/triage-data-route';

// Scorers
import { basedScorer } from './scorers/based-scorer';

// MCP
import { composioProvider, arcadeProvider } from './tool-providers';

export const mastra = new Mastra({
  workflows: { techTouchdownWorkflow, deepSearch, ragWorkflow, triageWorkflow, triageUpdateWorkflow },
  agents: {
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
    issueAnalyzerAgent,
    prAnalyzerAgent,
    prIssueLinkerAgent,
    duplicateFinderAgent,
    triageChatAgent,
  },
  scorers: {
    basedScorer,
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
      triageDataRoute,
      triageHiddenRoute,
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
