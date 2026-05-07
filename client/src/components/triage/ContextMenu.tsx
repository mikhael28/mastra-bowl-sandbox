import { useEffect, useRef, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Lightweight right-click context menu. Positioned at viewport (x, y), nudged
// back inside the screen if the requested position would clip. Closes on
// click-outside, escape, or scroll — all the usual suspects, since browser
// scroll wheels move the underlying content but the menu's screen position
// would otherwise stay anchored.
// ---------------------------------------------------------------------------

export interface ContextMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  accent?: 'purple' | 'blue' | 'green' | 'red' | 'default';
  onClick: () => void;
  disabled?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  header?: string;
}

const ACCENT: Record<NonNullable<ContextMenuItem['accent']>, string> = {
  purple: 'text-[#ec88f5] hover:bg-[#ec88f515]',
  blue: 'text-[#aaf6ff] hover:bg-[#aaf6ff15]',
  green: 'text-[#36e3a8] hover:bg-[#36e3a815]',
  red: 'text-[#ff5874] hover:bg-[#ff587415]',
  default: 'text-[#cdf2fb] hover:bg-[#0a2b37]',
};

export function ContextMenu({ x, y, items, onClose, header }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Nudge into viewport after first paint — we know the menu's actual width
    // and height only once it's mounted.
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const overflowX = rect.right - window.innerWidth;
    const overflowY = rect.bottom - window.innerHeight;
    if (overflowX > 0) el.style.left = `${x - overflowX - 8}px`;
    if (overflowY > 0) el.style.top = `${y - overflowY - 8}px`;
  }, [x, y]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScroll = () => onClose();
    // Listen capture on mousedown so we close before the click lands on
    // whatever was beneath the menu.
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ left: x, top: y }}
      className="fixed z-[60] min-w-[220px] py-1 bg-[#04141a] border border-[#143a48] rounded-lg shadow-2xl shadow-black/50"
      role="menu"
    >
      {header && (
        <div className="px-3 py-1.5 border-b border-[#0a2b37] text-[10px] font-semibold text-[#5395a8] uppercase tracking-wider">
          {header}
        </div>
      )}
      {items.map((item) => (
        <button
          key={item.id}
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            ACCENT[item.accent ?? 'default']
          }`}
        >
          {item.icon && (
            <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
          )}
          <span className="flex-1 min-w-0">
            <span className="font-medium leading-tight">{item.label}</span>
            {item.description && (
              <span className="block text-[11px] text-[#5395a8] mt-0.5 leading-snug">
                {item.description}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
