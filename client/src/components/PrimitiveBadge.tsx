import { EDUCATION, PrimitiveId } from '../lib/education';

interface Props {
  primitive: PrimitiveId;
  onTeach: (id: PrimitiveId) => void;
  compact?: boolean;
}

const COLOR: Record<PrimitiveId, string> = {
  agent: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'agent-as-tool': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  tool: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  workflow: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'workflow-suspend': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  memory: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'working-memory': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  rag: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  mcp: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  scorer: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  processor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  voice: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  browser: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  workspace: 'bg-slate-500/30 text-slate-200 border-slate-500/30',
  sandbox: 'bg-zinc-700/40 text-zinc-100 border-zinc-500/40',
  approval: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  stream: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30',
  observability: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export function PrimitiveBadge({ primitive, onTeach, compact }: Props) {
  const entry = EDUCATION[primitive];
  return (
    <button
      onClick={() => onTeach(primitive)}
      className={`inline-flex items-center gap-1 border rounded-full font-mono hover:brightness-125 transition ${
        COLOR[primitive]
      } ${compact ? 'text-[10px] px-1.5 py-px' : 'text-xs px-2 py-0.5'}`}
      title={`What is ${entry.title}? Click to learn →`}
    >
      <span>{entry.title}</span>
      <span className="opacity-60">ⓘ</span>
    </button>
  );
}
