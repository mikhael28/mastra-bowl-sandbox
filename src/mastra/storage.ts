import { MastraCompositeStore } from '@mastra/core/storage';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from '@mastra/duckdb';

const observabilityStorage = await new DuckDBStore().getStore('observability');

export const storage = new MastraCompositeStore({
  id: 'composite-storage',
  default: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),
  domains: {
    observability: observabilityStorage,
  },
});
