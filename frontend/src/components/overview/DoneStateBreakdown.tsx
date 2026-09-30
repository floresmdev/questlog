import { Link } from 'react-router-dom';
import type { DoneBreakdown, DoneState } from '../../api/types';
import { splitPercent } from '../../lib/percent';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface DoneStateBreakdownProps {
  data: DoneBreakdown;
}

const SEGMENTS: { state: DoneState; label: string; bar: string; tile: string; text: string }[] = [
  { state: 'active', label: 'Activas en el juego', bar: 'bg-done-active-bar', tile: 'bg-done-active-tile', text: 'text-done-active-label' },
  { state: 'modified', label: 'Modificadas', bar: 'bg-done-modified-bar', tile: 'bg-done-modified-tile', text: 'text-done-modified-label' },
  { state: 'removed', label: 'Eliminadas', bar: 'bg-done-removed-bar', tile: 'bg-done-removed-tile', text: 'text-done-removed-label' },
];

/** Stacked bar + one tile per in-game state for finished tasks. */
export function DoneStateBreakdown({ data }: DoneStateBreakdownProps) {
  const counts = SEGMENTS.map((s) => data[s.state]);
  const widths = splitPercent(counts);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <Panel className="flex flex-col gap-3 px-5 py-[18px]">
      <SectionHeader title="Estado de terminadas">
        <span className="text-[12.5px] font-bold text-ink">{total} tareas</span>
      </SectionHeader>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-md">
        {SEGMENTS.map((s, i) => (
          <span key={s.state} className={s.bar} style={{ width: `${widths[i]}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {SEGMENTS.map((s) => (
          <div key={s.state} className={`flex flex-col items-center gap-0.5 rounded-[10px] px-2 py-2.5 ${s.tile}`}>
            <span className={`text-center text-[11.5px] font-bold ${s.text}`}>{s.label}</span>
            <span className="text-[26px] font-extrabold">{data[s.state]}</span>
          </div>
        ))}
      </div>
      <span className="text-xs leading-[1.45] text-ink-3">
        El {widths[0]} % de lo terminado sigue vivo en la build actual.{' '}
        <Link to="/tasks" className="font-bold">
          Ver cambios
        </Link>
      </span>
    </Panel>
  );
}
