import type { AreaProgressItem } from '../../api/types';
import { pct } from '../../lib/percent';
import { AreaTag } from '../ui/AreaTag';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface AreaProgressProps {
  items: AreaProgressItem[];
}

export function AreaProgress({ items }: AreaProgressProps) {
  return (
    <Panel className="flex flex-col gap-3 px-[22px] py-[18px]">
      <SectionHeader title="Progreso por área" link={{ label: 'Ver tablero', to: '/tasks' }} />
      {items.map(({ area, done, total }) => {
        const percent = pct(done, total);
        return (
          <div key={area.id} className="flex items-center gap-3 text-[13px]">
            <AreaTag area={area} size="md" className="w-28 shrink-0 justify-center" />
            <span className="h-2 flex-grow overflow-hidden rounded bg-track">
              <span className="block h-full rounded bg-primary" style={{ width: percent }} />
            </span>
            <span className="w-11 text-right text-[11.5px] font-semibold text-ink-muted">
              {done}/{total}
            </span>
            <span className="w-[38px] text-right font-extrabold text-ink">{percent}</span>
          </div>
        );
      })}
    </Panel>
  );
}
