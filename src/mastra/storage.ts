import { MastraCompositeStore } from '@mastra/core/storage';
import { LibSQLStore } from '@mastra/libsql';
import { DuckDBStore } from '@mastra/duckdb';
import { ObservabilityStorageClickhouseVNext } from '@mastra/clickhouse';

const observabilityStorage = process.env.CLICKHOUSE_URL
  ? new ObservabilityStorageClickhouseVNext({
      url: process.env.CLICKHOUSE_URL,
      username: process.env.CLICKHOUSE_USERNAME ?? 'default',
      password: process.env.CLICKHOUSE_PASSWORD ?? '',
      retention: { logs: 14, metrics: 90 },
    })
  : await new DuckDBStore().getStore('observability');

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
