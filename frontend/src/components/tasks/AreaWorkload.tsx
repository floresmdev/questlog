import type { AreaCount } from '../../api/types';
import { pct } from '../../lib/percent';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface AreaWorkloadProps {
  items: AreaCount[];
}

/** Open tasks per area, bars scaled to the busiest area. */
export function AreaWorkload({ items }: AreaWorkloadProps) {
  const max = Math.max(0, ...items.map((i) => i.count));

  return (
    <Panel className="flex flex-col gap-[11px] px-5 py-[18px]">
      <SectionHeader title="Carga por área" size={15}>
        <span className="text-xs font-semibold text-ink-muted">tareas abiertas</span>
      </SectionHeader>
      {items.map(({ area, count }) => (
        <div key={area.id} className="flex items-center gap-2.5 text-[12.5px]">
          <span className="w-[100px] shrink-0 font-semibold text-ink-2">{area.name}</span>
          <span className="h-2 flex-grow overflow-hidden rounded bg-track">
            <span className="block h-full rounded bg-primary" style={{ width: pct(count, max) }} />
          </span>
          <span className="w-[22px] text-right font-extrabold text-ink">{count}</span>
        </div>
      ))}
    </Panel>
  );
}
