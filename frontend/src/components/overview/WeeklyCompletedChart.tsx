import type { WeeklyCompletedPoint } from '../../api/types';
import { axisDate } from '../../lib/format';
import { FilterDropdown } from '../ui/FilterDropdown';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface WeeklyCompletedChartProps {
  points: WeeklyCompletedPoint[];
}

// Plot area in viewBox units (matches the reference SVG).
const W = 480;
const TOP = 10;
const BOTTOM = 150;

export function WeeklyCompletedChart({ points }: WeeklyCompletedChartProps) {
  const peak = Math.max(0, ...points.map((p) => p.count));
  // Round the axis up to the next even number with some headroom (6 → 8).
  const yMax = Math.max(8, Math.ceil((peak + 1) / 2) * 2);
  const ticks = [4, 3, 2, 1, 0].map((i) => (yMax / 4) * i);

  const step = points.length > 1 ? W / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: Math.round(i * step),
    y: BOTTOM - (p.count / yMax) * (BOTTOM - TOP),
  }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x} ${c.y}`).join('');
  const area = coords.length ? `${line}L${coords.at(-1)!.x} ${BOTTOM}L0 ${BOTTOM}Z` : '';
  const gridY = ticks.slice(0, -1).map((t) => BOTTOM - (t / yMax) * (BOTTOM - TOP));

  return (
    <Panel className="flex flex-col gap-2.5 px-[22px] py-[18px]">
      <SectionHeader title="Tareas terminadas por semana">
        <FilterDropdown label={`Últimas ${points.length} semanas`} className="h-8 text-[12.5px]" />
      </SectionHeader>
      <div className="flex flex-grow gap-2.5">
        <div className="flex w-3.5 flex-col justify-between pb-[22px] pt-0.5 text-right text-[11px] font-semibold text-ink-muted">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="flex flex-grow flex-col gap-1.5">
          <svg
            width="100%"
            height="160"
            viewBox={`-8 0 ${W + 16} 160`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Tareas terminadas por semana: ${points.map((p) => p.count).join(', ')}`}
          >
            <path d={gridY.map((y) => `M-8 ${y}H${W + 8}`).join('')} stroke="#EEF1F6" strokeWidth="1" />
            <path d={`M-8 ${BOTTOM}H${W + 8}`} stroke="#D9DEE8" strokeWidth="1" />
            <path d={area} fill="#2563EB" fillOpacity="0.1" />
            <path d={line} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" />
            {coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="4.5"
                fill="#2563EB"
                {...(i === coords.length - 1 && { stroke: '#FFFFFF', strokeWidth: 2 })}
              />
            ))}
          </svg>
          <div className="flex justify-between text-[11px] font-semibold text-ink-muted">
            {points.map((p) => (
              <span key={p.weekStart}>{axisDate(p.weekStart)}</span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
