import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  onTeach: (id: PrimitiveId) => void;
}

const SCORERS = [
  {
    id: 'based-scorer',
    name: 'Based',
    description:
      'Grades blog post output 0-10 on authenticity, boldness, originality, personality, and impact. Weighted average with Based highlights + cringe extraction.',
    dimensions: ['authenticity', 'boldness', 'originality', 'personality', 'impact'],
    file: 'src/mastra/scorers/based-scorer.ts',
    usage:
      'Called directly from blog-post-workflow (`basedScorer.run({ output: { text } })`) and sampled 10% on mastraclaw-agent.',
  },
  {
    id: 'answer-relevancy',
    name: 'Answer relevancy (prebuilt)',
    description:
      'LLM-as-judge scorer that checks whether an agent response actually answers the question. Ships in @mastra/evals/scorers/prebuilt.',
    dimensions: [],
    file: 'imported into mastraclaw-agent.ts',
    usage: 'Sampled 20% on mastraclaw-agent responses.',
  },
  {
    id: 'toxicity',
    name: 'Toxicity (prebuilt)',
    description:
      'Flags toxic, harassing, or otherwise harmful content. Pairs well with the content-moderation processors.',
    dimensions: [],
    file: 'imported into mastraclaw-agent.ts',
    usage: 'Sampled 20% on mastraclaw-agent responses.',
  },
];

export function ScorersPanel({ onTeach }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="border-b border-slate-800 p-4 flex items-center gap-3">
        <h2 className="font-semibold">Scorers</h2>
        <PrimitiveBadge primitive="scorer" onTeach={onTeach} compact />
        <div className="text-xs text-slate-400">
          LLM-as-judge + programmatic evals, sampled at runtime.
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {SCORERS.map((s) => (
          <div
            key={s.id}
            className="rounded border border-slate-800 bg-slate-900/40 p-4"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  {s.name}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {s.id}
                </div>
              </div>
              <PrimitiveBadge primitive="scorer" onTeach={onTeach} compact />
            </div>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {s.description}
            </p>
            {s.dimensions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {s.dimensions.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs text-slate-400 leading-snug">
              {s.usage}
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-500">
              {s.file}
            </div>
          </div>
        ))}
        <div className="text-xs text-slate-500 pt-2">
          Tip: run the <code className="font-mono">blog-post-workflow</code> in
          the Workflows tab — you&apos;ll see the Based scorer branch deciding
          whether to finalize the post or rewrite it bolder.
        </div>
      </div>
    </div>
  );
}
