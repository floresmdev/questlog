import type { Priority, PriorityStats } from '../../api/types';
import { splitPercent } from '../../lib/percent';
import { priorityLabel } from '../../lib/styles';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface PriorityOverviewProps {
  stats: PriorityStats;
}

const ORDER: Priority[] = ['high', 'medium', 'low'];

const tileClass: Record<Priority, string> = {
  high: 'bg-priority-high-tile text-priority-high-text',
  medium: 'bg-priority-medium-tile text-priority-medium-text',
  low: 'bg-priority-low-tile text-primary-hover',
};

const barClass: Record<Priority, string> = {
  high: 'bg-priority-high-bar',
  medium: 'bg-priority-medium-bar',
  low: 'bg-priority-low-bar',
};

export function PriorityOverview({ stats }: PriorityOverviewProps) {
  const counts = ORDER.map((p) => stats[p]);
  const widths = splitPercent(counts);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <Panel className="flex flex-col gap-3.5 px-5 py-[18px]">
      <SectionHeader title="Prioridades" size={15} />
      <div className="grid grid-cols-3 gap-2.5">
        {ORDER.map((p) => (
          <div key={p} className={`flex flex-col items-center gap-0.5 rounded-[10px] p-2.5 ${tileClass[p]}`}>
            <span className="text-xs font-bold">{priorityLabel[p]}</span>
            <span className="text-[26px] font-extrabold text-ink">{stats[p]}</span>
          </div>
        ))}
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded">
        {ORDER.map((p, i) => (
          <span key={p} className={barClass[p]} style={{ width: `${widths[i]}%` }} />
        ))}
      </div>
      <span className="text-xs font-medium text-ink-muted">
        Total: {total} tareas · {stats.highDueThisWeek} de prioridad alta vencen esta semana
      </span>
    </Panel>
  );
}
