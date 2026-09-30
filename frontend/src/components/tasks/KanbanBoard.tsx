import { useState } from 'react';
import type { BoardLane, Id, TaskListItem } from '../../api/types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { KanbanFilters, type BoardView } from './KanbanFilters';
import { KanbanLane } from './KanbanLane';

interface KanbanBoardProps {
  lanes: BoardLane[];
  selectedTaskId?: Id;
  onSelectTask?: (task: TaskListItem) => void;
}

export function KanbanBoard({ lanes, selectedTaskId, onSelectTask }: KanbanBoardProps) {
  const [view, setView] = useState<BoardView>('board');

  return (
    <Panel as="section" className="flex min-w-0 flex-grow flex-col gap-4 p-5">
      <SectionHeader title="Tablero Kanban" size={17} className="flex-wrap gap-y-2">
        <KanbanFilters areaLabel="Todas" assigneeLabel="Todos" buildLabel="Todas" view={view} onViewChange={setView} />
      </SectionHeader>

      {/* Lanes keep a usable width; below ~1280px viewports the board scrolls sideways. */}
      <div className="-mx-1 flex min-h-0 flex-grow flex-col overflow-x-auto px-1">
        <div className="grid min-h-0 min-w-[600px] flex-grow grid-cols-4 grid-rows-[22px_minmax(0,1fr)] gap-x-3 gap-y-2">
          <div className="col-span-2" />
          <div className="col-span-2 flex min-w-0 items-center gap-2 text-[11px] font-extrabold tracking-[0.6px] text-success">
            <span className="h-px min-w-3 flex-grow bg-lane-active-rule" />
            <span className="truncate">TERMINADAS · SEPARADAS POR ESTADO EN EL JUEGO</span>
            <span className="h-px min-w-3 flex-grow bg-lane-active-rule" />
          </div>
          {lanes.map((lane) => (
            <KanbanLane key={lane.id} lane={lane} selectedTaskId={selectedTaskId} onSelectTask={onSelectTask} />
          ))}
        </div>
      </div>
    </Panel>
  );
}
