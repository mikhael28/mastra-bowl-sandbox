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
      'Grades text output 0-10 on authenticity, boldness, originality, personality, and impact. Weighted average with Based highlights + cringe extraction.',
    dimensions: ['authenticity', 'boldness', 'originality', 'personality', 'impact'],
    file: 'src/mastra/scorers/based-scorer.ts',
    usage:
      'Sampled 10% on mastraclaw-agent responses.',
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
    <div className="flex-1 flex flex-col overflow-hidden scan-lines">
      <header
        className="p-4 flex items-center gap-3"
        style={{
          borderBottom: '1px solid rgba(108, 230, 248, 0.22)',
          background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.25))',
        }}
      >
        <div>
          <div className="holo-eyebrow">// MODULE 08</div>
          <h2 className="holo-title text-base mt-0.5">SCORERS</h2>
        </div>
        <PrimitiveBadge primitive="scorer" onTeach={onTeach} compact />
        <div className="text-xs holo-readout" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
          // LLM-as-judge + programmatic evals, sampled at runtime.
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {SCORERS.map((s) => (
          <div
            key={s.id}
            className="holo-frame-sm p-4"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <div className="holo-title text-sm">{s.name}</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
                  &gt; {s.id}
                </div>
              </div>
              <PrimitiveBadge primitive="scorer" onTeach={onTeach} compact />
            </div>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: '#cdf2fb' }}>
              {s.description}
            </p>
            {s.dimensions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {s.dimensions.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5"
                    style={{
                      background: 'rgba(255, 88, 116, 0.10)',
                      border: '1px solid rgba(255, 88, 116, 0.4)',
                      color: '#ff859a',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs holo-readout leading-snug" style={{ color: 'rgba(170, 246, 255, 0.7)' }}>
              // {s.usage}
            </div>
            <div className="mt-2 text-[10px] font-mono" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              &gt; {s.file}
            </div>
          </div>
        ))}
        <div className="text-xs holo-readout pt-2" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
          // Tip: chat with <code className="font-mono" style={{ color: '#aaf6ff' }}>mastraclaw-agent</code> —
          the Based scorer samples 10% of responses to grade voice and authenticity.
        </div>
      </div>
    </div>
  );
}
