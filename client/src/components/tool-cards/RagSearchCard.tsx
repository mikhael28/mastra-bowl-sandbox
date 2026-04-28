import { useState } from 'react';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { ToolCardProps, statusColor, unwrap, safeStringify } from './types';

/**
 * Rendering a `kb-search` call as chunk cards instead of a JSON blob. Each
 * chunk is the atomic unit of grounded generation: text snippet, vector
 * similarity score, source path, tags. Showing these explicitly teaches the
 * reader *what RAG actually grounds on* — which is the most common point of
 * confusion when people hear "RAG" for the first time.
 */
export function RagSearchCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const args = (tc.args ?? {}) as any;
  const result = unwrap(tc.result) as any;

  // The `kb-search` output shape in this repo is roughly:
  //   { results: [{ text, score, id, source, tags, metadata }], mode }
  // but the tool has gone through revisions so we handle a few synonyms.
  const chunks: Array<any> = Array.isArray(result)
    ? result
    : Array.isArray(result?.results)
      ? result.results
      : Array.isArray(result?.chunks)
        ? result.chunks
        : Array.isArray(result?.matches)
          ? result.matches
          : [];

  const query: string =
    args.query ?? args.q ?? args.text ?? args.input ?? '';
  const collection: string | undefined =
    args.collectionId ?? args.collection ?? result?.collectionId;
  const mode: string | undefined = args.mode ?? result?.mode;

  return (
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor(tc.status)}`}>
      <div className="flex items-center gap-2">
        <PrimitiveBadge primitive="rag" onTeach={onTeach} compact />
        <span className="font-mono text-slate-200">{tc.toolName}</span>
        {mode && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-200 font-mono">
            {mode}
          </span>
        )}
        {collection && (
          <span className="text-[10px] text-slate-400 font-mono">
            in {collection}
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-400">{tc.status}</span>
      </div>

      {query && (
        <div className="mt-1 text-[11px] text-slate-300 italic truncate">
          “{query}”
        </div>
      )}

      {tc.status === 'calling' && chunks.length === 0 && (
        <div className="mt-2 text-[11px] text-slate-500 italic">
          searching the knowledge base…
        </div>
      )}

      {chunks.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {chunks.slice(0, 8).map((c: any, i: number) => (
            <ChunkRow key={c.id ?? i} chunk={c} rank={i + 1} />
          ))}
          {chunks.length > 8 && (
            <div className="text-[10px] text-slate-500 italic">
              … {chunks.length - 8} more chunks
            </div>
          )}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
        <button
          onClick={() => onTeach('rag')}
          className="shrink-0 text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
        >
          learn →
        </button>
        <span>
          Each chunk has a vector-similarity score. The agent decides which to
          cite. <span className="font-mono">mode: auto</span> lets the planner
          pick between quick (single search) and deep (multi-query) retrieval.
        </span>
      </div>
    </div>
  );
}

function ChunkRow({ chunk, rank }: { chunk: any; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const text: string = chunk.text ?? chunk.content ?? chunk.chunk ?? '';
  const score: number | undefined = chunk.score ?? chunk.similarity ?? chunk._score;
  const source: string | undefined =
    chunk.source ??
    chunk.metadata?.source ??
    chunk.metadata?.sourceType ??
    chunk.filename ??
    chunk.path;
  const tags: string[] =
    chunk.tags ??
    chunk.metadata?.tags ??
    (Array.isArray(chunk.metadata?.tag) ? chunk.metadata.tag : []);

  const excerpt = expanded ? text : text.slice(0, 280);

  return (
    <div className="p-2 rounded border border-pink-500/20 bg-slate-900/50 text-[11px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10px] font-mono">
          {rank}
        </span>
        {typeof score === 'number' && (
          <span className="text-pink-300 font-mono text-[10px]">
            {score.toFixed(3)}
          </span>
        )}
        {source && (
          <span className="text-slate-500 font-mono truncate">{source}</span>
        )}
        {tags.length > 0 && (
          <span className="ml-auto flex gap-1 flex-wrap">
            {tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1 py-px rounded"
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
        {excerpt}
        {!expanded && text.length > 280 && '…'}
      </div>
      {text.length > 280 && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-1 text-[10px] text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
        >
          {expanded ? 'show less' : 'show full chunk'}
        </button>
      )}
    </div>
  );
}
