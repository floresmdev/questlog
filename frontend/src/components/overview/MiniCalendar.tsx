import type { CalendarEvent, CalendarEventKind } from '../../api/types';
import { monthGrid, toISODate } from '../../lib/calendar';
import { isSameDay, monthTitle } from '../../lib/format';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';

interface MiniCalendarProps {
  /** Any date inside the month to show. */
  month: Date;
  today: Date;
  events: CalendarEvent[];
  onMonthChange?: (month: Date) => void;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const dotClass: Record<CalendarEventKind, string> = {
  build: 'bg-success',
  due: 'bg-danger-dot',
};

export function MiniCalendar({ month, today, events, onMonthChange }: MiniCalendarProps) {
  const days = monthGrid(month);
  // A due date outranks a build on the same day.
  const eventByDay = new Map<string, CalendarEventKind>();
  for (const e of events) {
    if (eventByDay.get(e.date) !== 'due') eventByDay.set(e.date, e.kind);
  }
  const shift = (delta: number) => onMonthChange?.(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  const navButton = 'flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-ink-2 hover:bg-hover';

  return (
    <div className="flex flex-grow flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <h2 className="m-0 flex-grow text-base font-extrabold text-ink">Calendario</h2>
        <button type="button" aria-label="Mes anterior" className={navButton} onClick={() => shift(-1)}>
          <ChevronLeftIcon size={14} />
        </button>
        <span className="text-[13.5px] font-bold">{monthTitle(month)}</span>
        <button type="button" aria-label="Mes siguiente" className={navButton} onClick={() => shift(1)}>
          <ChevronRightIcon size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-[3px]">
        {WEEKDAYS.map((d) => (
          <span key={d} className="flex h-7 items-center justify-center text-[11px] font-semibold text-ink-muted">
            {d}
          </span>
        ))}
        {days.map((d) => {
          const outside = d.getMonth() !== month.getMonth();
          const isToday = isSameDay(d, today);
          const event = eventByDay.get(toISODate(d));
          return (
            <span
              key={toISODate(d)}
              className={`relative flex h-7 flex-col items-center justify-center text-[12.5px] font-semibold ${
                isToday ? 'text-white' : outside ? 'text-ink-faint' : 'text-ink'
              }`}
            >
              {isToday && <span className="absolute h-7 w-7 rounded-full bg-primary" />}
              <span className="relative">{d.getDate()}</span>
              {event && <span className={`absolute -bottom-px h-[5px] w-[5px] rounded-full ${dotClass[event]}`} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
