import type { KeyboardEvent } from 'react';
import type { TaskListItem } from '../../api/types';
import { buildLabel, shortDate } from '../../lib/format';
import { AreaTag } from '../ui/AreaTag';
import { Avatar } from '../ui/Avatar';
import { BuildChip } from '../ui/BuildChip';
import { DoneStateTag } from '../ui/DoneStateTag';
import { PriorityTag } from '../ui/PriorityTag';
import { CalendarIcon, MessageIcon } from '../ui/icons';

interface TaskCardProps {
  task: TaskListItem;
  selected?: boolean;
  onSelect?: (task: TaskListItem) => void;
}

/**
 * Kanban card. Variant follows the task state:
 * open (priority tag) · done-active ("En el juego" + build) · done-changed (state, note, build).
 */
export function TaskCard({ task, selected, onSelect }: TaskCardProps) {
  const isDone = task.status === 'done';
  const date = isDone && task.completedAt ? task.completedAt : task.dueDate;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(task);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect?.(task)}
      onKeyDown={onKeyDown}
      className={`flex shrink-0 cursor-pointer flex-col gap-[7px] rounded-task border bg-surface p-2.5 outline-none focus-visible:border-primary ${
        selected ? 'border-primary shadow-selected' : 'border-border shadow-task'
      }`}
    >
      <div
        className={`text-[13px] font-bold leading-[1.3] ${
          task.doneState === 'removed' ? 'text-ink-muted line-through' : 'text-ink'
        }`}
      >
        {task.title}
      </div>

      <div className="flex flex-wrap gap-[5px]">
        <AreaTag area={task.area} />
        {task.doneState ? <DoneStateTag state={task.doneState} /> : <PriorityTag priority={task.priority} />}
      </div>

      {task.changeNote && task.doneState !== 'active' && (
        <span className="text-[11.5px] leading-[1.35] text-ink-3">{task.changeNote}</span>
      )}

      {isDone && task.integratedBuild && (
        <BuildChip withIcon className="self-start">
          {buildLabel(task.integratedBuild)}
        </BuildChip>
      )}

      <div className="flex items-center gap-2.5 text-[11px] font-medium text-ink-muted">
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <CalendarIcon size={12} strokeWidth={2} />
          {shortDate(date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageIcon size={12} strokeWidth={2} />
          {task.commentCount}
        </span>
        <Avatar user={task.assignee} className="ml-auto" />
      </div>
    </article>
  );
}
