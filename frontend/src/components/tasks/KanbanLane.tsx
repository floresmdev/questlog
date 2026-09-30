import type { BoardLane, Id, TaskListItem } from '../../api/types';
import { laneStyle } from '../../lib/styles';
import { PencilIcon, PlayCircleIcon, PlusIcon } from '../ui/icons';
import { TaskCard } from './TaskCard';

interface KanbanLaneProps {
  lane: BoardLane;
  selectedTaskId?: Id;
  onSelectTask?: (task: TaskListItem) => void;
}

export function KanbanLane({ lane, selectedTaskId, onSelectTask }: KanbanLaneProps) {
  const style = laneStyle[lane.id];
  const hidden = lane.total - lane.tasks.length;

  return (
    <div className={`flex min-h-0 flex-col gap-2 rounded-xl p-2 ${style.lane}`}>
      <div className={`flex h-10 shrink-0 items-center gap-2 rounded-[9px] px-2.5 ${style.head} ${style.text}`}>
        {lane.id === 'done_active' && <PlayCircleIcon size={16} className="shrink-0" />}
        {lane.id === 'done_changed' && <PencilIcon size={16} className="shrink-0" />}
        <span className="min-w-0 flex-grow break-words text-[13.5px] font-extrabold leading-tight line-clamp-2">{style.title}</span>
        <span className="shrink-0 rounded-md bg-surface px-[7px] py-0.5 text-[11px] font-extrabold">{lane.total}</span>
        {style.addLabel && (
          <button
            type="button"
            aria-label={style.addLabel}
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-current"
          >
            <PlusIcon size={15} />
          </button>
        )}
      </div>

      <div className="-m-1 flex min-h-0 flex-grow flex-col gap-2 overflow-y-auto p-1">
        {lane.tasks.map((task) => (
          <TaskCard key={task.id} task={task} selected={task.id === selectedTaskId} onSelect={onSelectTask} />
        ))}
      </div>

      {hidden > 0 && (
        <a href={style.moreHref} className="shrink-0 p-1.5 text-center text-[12.5px] font-bold">
          Ver {hidden} más
        </a>
      )}
    </div>
  );
}
