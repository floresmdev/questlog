import { FilterDropdown } from '../ui/FilterDropdown';
import { GridIcon, ListIcon } from '../ui/icons';

export type BoardView = 'list' | 'board';

interface KanbanFiltersProps {
  areaLabel: string;
  assigneeLabel: string;
  buildLabel: string;
  view: BoardView;
  onViewChange: (view: BoardView) => void;
}

/** Área / Responsable / Build dropdowns plus the list/board toggle. */
export function KanbanFilters({ areaLabel, assigneeLabel, buildLabel, view, onViewChange }: KanbanFiltersProps) {
  const toggleClass = (on: boolean) =>
    `flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-lg ${
      on ? 'border-0 bg-primary text-white' : 'border border-line-control bg-surface text-ink-muted'
    }`;

  return (
    <>
      <FilterDropdown label={`Área: ${areaLabel}`} />
      <FilterDropdown label={`Responsable: ${assigneeLabel}`} />
      <FilterDropdown label={`Build: ${buildLabel}`} />
      <div className="ml-1 flex shrink-0 gap-1">
        <button type="button" aria-label="Vista de lista" aria-pressed={view === 'list'} className={toggleClass(view === 'list')} onClick={() => onViewChange('list')}>
          <ListIcon size={16} />
        </button>
        <button type="button" aria-label="Vista Kanban" aria-pressed={view === 'board'} className={toggleClass(view === 'board')} onClick={() => onViewChange('board')}>
          <GridIcon size={16} />
        </button>
      </div>
    </>
  );
}
