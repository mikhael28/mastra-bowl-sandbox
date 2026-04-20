
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from "@mastra/duckdb";
import { ObservabilityStorageClickhouseVNext } from '@mastra/clickhouse';
import { MastraCompositeStore } from '@mastra/core/storage';
import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';
import { MastraEditor } from '@mastra/editor'

// Agents
import { mathAgent } from './agents/math-agent';
import { copywriterAgent } from './agents/copywriter-agent';
import { editorAgent } from './agents/editor-agent';
import { publisherAgent } from './agents/publisher-agent';
import { newsAgent } from './agents/news-agent';
import { openclawAgent } from './agents/openclaw-agent';
import { intentClarifierAgent } from './agents/intent-clarifier-agent';
import { researchPlannerAgent } from './agents/research-planner-agent';
import { searchResultEvaluatorAgent } from './agents/search-result-evaluator-agent';
import { answererAgent } from './agents/answerer-agent';
import { legalQueryPlannerAgent } from './agents/legal-query-planner-agent';
import { legalResultEvaluatorAgent } from './agents/legal-result-evaluator-agent';
import { getPineconeStore } from './tools/legal';

// Workflows
import { blogPostWorkflow } from './workflows/blog-post-workflow';
import { techTouchdownWorkflow } from './workflows/tech-touchdown-workflow';
import { deepSearch } from './workflows/deep-search-workflow';
import { legalRag } from './workflows/legal-rag-workflow';

// Scorers
import { basedScorer } from './scorers/based-scorer';

// MCP
import { docsMcpServer } from './mcp/docs-server';
import { ComposioToolProvider } from '@mastra/editor/composio';
import { ArcadeToolProvider } from '@mastra/editor/arcade';

const observabilityStorage = process.env.CLICKHOUSE_URL
  ? new ObservabilityStorageClickhouseVNext({
      url: process.env.CLICKHOUSE_URL,
      username: process.env.CLICKHOUSE_USERNAME ?? 'default',
      password: process.env.CLICKHOUSE_PASSWORD ?? '',
      retention: { logs: 14, metrics: 90 },
    })
  : await new DuckDBStore().getStore('observability');

export const mastra = new Mastra({
  workflows: { blogPostWorkflow, techTouchdownWorkflow, deepSearch, legalRag },
  agents: {
    mathAgent,
    copywriterAgent,
    editorAgent,
    publisherAgent,
    newsAgent,
    openclawAgent,
    intentClarifierAgent,
    researchPlannerAgent,
    searchResultEvaluatorAgent,
    answererAgent,
    legalQueryPlannerAgent,
    legalResultEvaluatorAgent,
  },
  scorers: {
    basedScorer,
  },
  mcpServers: {
    docsMcpServer,
  },
  vectors: {
    'legal-pinecone': getPineconeStore(),
  },
  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: new LibSQLStore({
      id: "mastra-storage",
      url: "file:./mastra.db",
    }),
    domains: {
      observability: observabilityStorage,
    }
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  editor: new MastraEditor({
    toolProviders: {
      composio: new ComposioToolProvider({
        apiKey: process.env.COMPOSIO_API_KEY!,
      }),
      arcade: new ArcadeToolProvider({
        apiKey: process.env.ARCADE_API_KEY!,
      }),
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
