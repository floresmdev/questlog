import type { TaskStats } from '../../api/types';
import { Panel } from '../ui/Panel';

interface SprintDonutProps {
  sprint: TaskStats['sprint'];
}

const R = 26;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function SprintDonut({ sprint }: SprintDonutProps) {
  const segments = [
    { label: 'Terminadas', value: sprint.done, color: '#2563EB' },
    { label: 'En proceso', value: sprint.inProgress, color: '#F59E0B' },
    { label: 'Pendientes', value: sprint.pending, color: '#BFD0F5' },
  ];
  let offset = 0;

  return (
    <Panel className="flex h-[104px] items-center gap-4 px-5 py-3.5">
      <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0" role="img" aria-label={`Progreso del sprint: ${sprint.done}% terminado`}>
        <circle cx="36" cy="36" r={R} fill="none" stroke="#EEF1F6" strokeWidth="10" />
        {segments.map((s) => {
          const length = (s.value / 100) * CIRCUMFERENCE;
          const circle = (
            <circle
              key={s.label}
              cx="36"
              cy="36"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="10"
              strokeDasharray={`${length} ${CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 36 36)"
            />
          );
          offset += length;
          return circle;
        })}
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="800" fill="#111827" fontFamily="Plus Jakarta Sans, sans-serif">
          {sprint.done}%
        </text>
      </svg>
      <div className="flex flex-grow flex-col gap-[5px]">
        <span className="text-[13.5px] font-bold text-ink">Progreso del sprint</span>
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            <b className="ml-auto text-ink">{s.value}%</b>
          </span>
        ))}
      </div>
    </Panel>
  );
}
