
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
import { workingMemoryRoute } from './routes/working-memory-route';
import { artifactFilesRoute } from './routes/artifact-files-route';

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
    apiRoutes: [voiceSpeakRoute, workingMemoryRoute, artifactFilesRoute],
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
