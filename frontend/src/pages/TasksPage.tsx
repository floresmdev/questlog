import { useState } from 'react';
import { api, type Id } from '../api';
import { useApi } from '../hooks/useApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { TopBar } from '../components/layout/TopBar';
import { RecentActivity } from '../components/shared/RecentActivity';
import { StatCard } from '../components/shared/StatCard';
import { AreaWorkload } from '../components/tasks/AreaWorkload';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { PriorityOverview } from '../components/tasks/PriorityOverview';
import { SprintDonut } from '../components/tasks/SprintDonut';
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel';
import { CalendarCheckIcon, CheckCircleIcon, PlusIcon, PulseIcon } from '../components/ui/icons';

export function TasksPage() {
  const user = useCurrentUser();
  const { data: stats } = useApi(() => api.getTaskStats());
  const { data: lanes } = useApi(() => api.getBoard());
  const { data: activity } = useApi(() => api.getActivity('tasks'));
  const { data: workload } = useApi(() => api.getAreaWorkload());
  const { data: priorities } = useApi(() => api.getPriorityStats());

  // undefined = nothing picked yet → default to the first card in progress; null = panel closed.
  const [pickedId, setPickedId] = useState<Id | null>();
  const selectedId = pickedId === undefined ? lanes?.find((l) => l.id === 'in_progress')?.tasks[0]?.id : pickedId;
  const { data: detail } = useApi(
    () => (selectedId ? api.getTask(selectedId) : Promise.resolve(undefined)),
    [selectedId],
  );

  return (
    <>
      <TopBar
        title="Tareas"
        subtitle="Organiza y da seguimiento al desarrollo del juego"
        searchPlaceholder="Buscar tarea, ID o build…"
        searchLabel="Buscar tareas"
        user={user}
        action={
          <button
            type="button"
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-primary px-[18px] text-[13.5px] font-bold text-white hover:bg-primary-hover"
          >
            <PlusIcon size={16} />
            Nueva tarea
          </button>
        }
      />

      <div className="flex flex-grow flex-col gap-5 p-6">
        <div className="grid grid-cols-4 gap-5">
          {stats && (
            <>
              <StatCard
                tone="blue"
                icon={<CalendarCheckIcon size={28} />}
                label="Total de tareas"
                value={stats.total}
                footnote={`↑ ${stats.newThisWeek} nuevas esta semana`}
                footnoteClass="text-success"
              />
              <StatCard
                tone="amber"
                icon={<PulseIcon size={28} />}
                label="En proceso"
                value={stats.inProgress}
                footnote={`↓ ${stats.inProgressDueThisWeek} vencen esta semana`}
                footnoteClass="text-warning"
              />
              <StatCard
                tone="green"
                icon={<CheckCircleIcon size={28} />}
                label="Terminadas"
                value={stats.done}
                footnote={
                  <>
                    <span className="text-success">{stats.doneActive} en el juego</span> ·{' '}
                    <span className="text-violet">{stats.doneChanged} mod./elim.</span>
                  </>
                }
              />
              <SprintDonut sprint={stats.sprint} />
            </>
          )}
        </div>

        <div className="flex h-[700px] gap-5">
          {lanes && <KanbanBoard lanes={lanes} selectedTaskId={selectedId ?? undefined} onSelectTask={(t) => setPickedId(t.id)} />}
          {selectedId && detail && <TaskDetailPanel task={detail} onClose={() => setPickedId(null)} />}
        </div>

        <div className="grid h-[220px] grid-cols-3 gap-5">
          {activity && <RecentActivity items={activity} variant="clock" />}
          {workload && <AreaWorkload items={workload} />}
          {priorities && <PriorityOverview stats={priorities} />}
        </div>
      </div>
    </>
  );
}
