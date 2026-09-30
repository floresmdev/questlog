import type { Deadline } from '../../api/types';
import { daysBetween, parseDate, shortDate } from '../../lib/format';
import { APP_NOW } from '../../lib/now';

interface UpcomingDeadlinesProps {
  items: Deadline[];
}

/** Tasks due within this many days are shown in red. */
const URGENT_DAYS = 2;

function toneClass(item: Deadline) {
  if (item.kind === 'build') return 'border-deadline-build-border bg-deadline-build-bg text-deadline-build-text';
  return daysBetween(APP_NOW, parseDate(item.date)) <= URGENT_DAYS
    ? 'border-deadline-urgent-border bg-deadline-urgent-bg text-deadline-urgent-text'
    : 'border-deadline-soon-border bg-deadline-soon-bg text-deadline-soon-text';
}

export function UpcomingDeadlines({ items }: UpcomingDeadlinesProps) {
  return (
    <div className="flex w-[209px] shrink-0 flex-col gap-2 border-l border-line-divider pl-[18px]">
      <span className="mb-0.5 text-[13px] font-extrabold">Próximas entregas</span>
      {items.map((item) => (
        <div key={item.id} className={`flex flex-col gap-0.5 rounded-[10px] border-[1.5px] px-2.5 py-2 ${toneClass(item)}`}>
          <span className={`text-[12.5px] font-bold text-ink ${item.kind === 'build' ? 'font-mono' : ''}`}>{item.label}</span>
          <span className="text-[11.5px] font-semibold">
            {shortDate(item.date)} · {item.detail}
          </span>
        </div>
      ))}
    </div>
  );
}
