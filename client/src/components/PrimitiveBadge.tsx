import { EDUCATION, PrimitiveId } from '../lib/education';

interface Props {
  primitive: PrimitiveId;
  onTeach: (id: PrimitiveId) => void;
  compact?: boolean;
  /** Render as a non-interactive <span> (no nested <button>s). Use inside
   * a parent button / link where the badge is purely decorative. */
  asStatic?: boolean;
}

/* iDroid badge palette: every primitive sits on the same cyan/amber/red HUD
   scale. Each primitive gets a distinct hue tag so it stays differentiated
   without breaking the iDroid color discipline. */
const COLOR: Record<PrimitiveId, { bg: string; border: string; text: string }> = {
  agent:           { bg: 'rgba(108, 230, 248, 0.10)', border: 'rgba(108, 230, 248, 0.45)', text: '#aaf6ff' },
  'agent-as-tool': { bg: 'rgba(170, 246, 255, 0.10)', border: 'rgba(170, 246, 255, 0.45)', text: '#cdf2fb' },
  tool:            { bg: 'rgba(54, 227, 168, 0.10)',  border: 'rgba(54, 227, 168, 0.45)',  text: '#66f5c2' },
  workflow:        { bg: 'rgba(255, 184, 77, 0.10)',  border: 'rgba(255, 184, 77, 0.45)',  text: '#ffd082' },
  'workflow-suspend':{bg: 'rgba(255, 144, 0, 0.10)',  border: 'rgba(255, 144, 0, 0.45)',   text: '#ffa820' },
  memory:          { bg: 'rgba(108, 230, 248, 0.08)', border: 'rgba(108, 230, 248, 0.40)', text: '#88efff' },
  'working-memory':{ bg: 'rgba(54, 212, 236, 0.10)',  border: 'rgba(54, 212, 236, 0.45)',  text: '#36d4ec' },
  rag:             { bg: 'rgba(217, 108, 224, 0.10)', border: 'rgba(217, 108, 224, 0.45)', text: '#ec88f5' },
  mcp:             { bg: 'rgba(185, 76, 196, 0.10)',  border: 'rgba(185, 76, 196, 0.45)',  text: '#d96ce0' },
  scorer:          { bg: 'rgba(255, 88, 116, 0.10)',  border: 'rgba(255, 88, 116, 0.45)',  text: '#ff859a' },
  processor:       { bg: 'rgba(255, 184, 77, 0.10)',  border: 'rgba(255, 184, 77, 0.45)',  text: '#ffc04d' },
  voice:           { bg: 'rgba(20, 201, 138, 0.10)',  border: 'rgba(20, 201, 138, 0.45)',  text: '#36e3a8' },
  browser:         { bg: 'rgba(154, 240, 112, 0.10)', border: 'rgba(154, 240, 112, 0.45)', text: '#9af070' },
  workspace:       { bg: 'rgba(125, 195, 212, 0.10)', border: 'rgba(125, 195, 212, 0.45)', text: '#a8e0ec' },
  sandbox:         { bg: 'rgba(83, 149, 168, 0.10)',  border: 'rgba(83, 149, 168, 0.45)',  text: '#7dc3d4' },
  approval:        { bg: 'rgba(54, 212, 236, 0.10)',  border: 'rgba(54, 212, 236, 0.45)',  text: '#88efff' },
  stream:          { bg: 'rgba(108, 230, 248, 0.08)', border: 'rgba(108, 230, 248, 0.35)', text: '#88efff' },
  observability:   { bg: 'rgba(108, 230, 248, 0.10)', border: 'rgba(108, 230, 248, 0.45)', text: '#6ce6f8' },
};

export function PrimitiveBadge({ primitive, onTeach, compact, asStatic }: Props) {
  const entry = EDUCATION[primitive];
  const c = COLOR[primitive];
  const baseStyle: React.CSSProperties = {
    background: c.bg,
    border: `1px solid ${c.border}`,
    color: c.text,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    boxShadow: `0 0 6px ${c.bg}, inset 0 0 6px ${c.bg}`,
  };
  const sizing = compact
    ? 'text-[9px] px-1.5 py-px'
    : 'text-[10px] px-2 py-0.5';
  const className = `inline-flex items-center gap-1 ${sizing} ${
    asStatic ? '' : 'hover:brightness-150'
  }`;

  if (asStatic) {
    return (
      <span className={className} style={baseStyle} title={entry.title}>
        <span>{entry.title}</span>
      </span>
    );
  }
  return (
    <button
      onClick={() => onTeach(primitive)}
      className={className}
      style={baseStyle}
      title={`What is ${entry.title}? Click to learn →`}
    >
      <span>{entry.title}</span>
      <span style={{ opacity: 0.6 }}>?</span>
    </button>
  );
}
