import { useState } from 'react';
import type { AgendaItem, Id } from '../../api/types';
import { AreaTag } from '../ui/AreaTag';
import { Avatar } from '../ui/Avatar';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface TodayTasksProps {
  items: AgendaItem[];
  onToggle?: (id: Id, done: boolean) => void;
}

export function TodayTasks({ items, onToggle }: TodayTasksProps) {
  // Local optimistic state until toggling is wired to the API.
  const [done, setDone] = useState<Record<Id, boolean>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.done])),
  );

  const toggle = (id: Id, value: boolean) => {
    setDone((d) => ({ ...d, [id]: value }));
    onToggle?.(id, value);
  };

  return (
    <Panel className="flex flex-col gap-1.5 px-[22px] py-[18px]">
      <SectionHeader title="Tareas de hoy" link={{ label: 'Ver todas', to: '/tasks' }} className="mb-1" />
      {items.map((item) => (
        <label key={item.id} className="flex h-[37px] shrink-0 cursor-pointer items-center gap-3 border-b border-line-row text-[13.5px]">
          <input
            type="checkbox"
            checked={done[item.id] ?? false}
            onChange={(e) => toggle(item.id, e.target.checked)}
            className="m-0 h-[18px] w-[18px] shrink-0 accent-primary"
          />
          <span className={`flex-grow truncate font-semibold ${done[item.id] ? 'text-ink-muted' : 'text-ink'}`}>
            {item.title}
          </span>
          <AreaTag area={item.area} size="md" />
          <Avatar user={item.assignee} size="sm" />
          <span className="w-11 text-right text-xs font-semibold text-ink-muted">{item.time}</span>
        </label>
      ))}
    </Panel>
  );
}
