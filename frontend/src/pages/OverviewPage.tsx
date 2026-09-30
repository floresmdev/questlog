import { useState } from 'react';
import { api } from '../api';
import { useApi } from '../hooks/useApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { TopBar } from '../components/layout/TopBar';
import { AreaProgress } from '../components/overview/AreaProgress';
import { BuildHistory } from '../components/overview/BuildHistory';
import { DoneStateBreakdown } from '../components/overview/DoneStateBreakdown';
import { MiniCalendar } from '../components/overview/MiniCalendar';
import { TodayTasks } from '../components/overview/TodayTasks';
import { UpcomingDeadlines } from '../components/overview/UpcomingDeadlines';
import { WeeklyCompletedChart } from '../components/overview/WeeklyCompletedChart';
import { RecentActivity } from '../components/shared/RecentActivity';
import { StatCard } from '../components/shared/StatCard';
import { Panel } from '../components/ui/Panel';
import { CheckCircleIcon, CheckSquareIcon, LayersIcon, TeamIcon } from '../components/ui/icons';
import { GAME_NAME } from '../lib/app';
import { monthGrid, toISODate } from '../lib/calendar';
import { shortDate } from '../lib/format';
import { APP_NOW } from '../lib/now';

export function OverviewPage() {
  const user = useCurrentUser();
  const [month, setMonth] = useState(() => new Date(APP_NOW.getFullYear(), APP_NOW.getMonth(), 1));

  const { data: stats } = useApi(() => api.getOverviewStats());
  const { data: areaProgress } = useApi(() => api.getAreaProgress());
  const { data: weekly } = useApi(() => api.getWeeklyCompleted(8));
  const { data: agenda } = useApi(() => api.getAgenda(toISODate(APP_NOW)));
  const { data: events } = useApi(() => {
    const grid = monthGrid(month);
    return api.getCalendarEvents(toISODate(grid[0]), toISODate(grid[grid.length - 1]));
  }, [month]);
  const { data: deadlines } = useApi(() => api.getUpcomingDeadlines(3));
  const { data: activity } = useApi(() => api.getActivity('overview'));
  const { data: builds } = useApi(() => api.getBuildHistory(4));
  const { data: doneBreakdown } = useApi(() => api.getDoneBreakdown());

  const firstName = user?.fullName.split(' ')[0] ?? '';

  return (
    <>
      <TopBar
        title="Overview"
        subtitle={`Hola, ${firstName}. Así va el desarrollo de ${GAME_NAME} hoy.`}
        searchPlaceholder="Buscar tareas, builds o personas…"
        searchLabel="Buscar"
        searchWidth="w-[320px]"
        showSettings
        user={user}
      />

      <div className="flex flex-grow flex-col gap-5 p-6">
        <div className="grid grid-cols-4 gap-5">
          {stats && (
            <>
              <StatCard
                tone="blue"
                icon={<CheckSquareIcon size={28} />}
                label="Tareas activas"
                value={stats.pending + stats.inProgress}
                footnote={`${stats.pending} pendientes · ${stats.inProgress} en proceso`}
              />
              <StatCard
                tone="green"
                icon={<CheckCircleIcon size={28} />}
                label="Terminadas"
                value={stats.done}
                footnote={`↑ ${stats.doneThisWeek} esta semana`}
                footnoteClass="text-success"
              />
              <StatCard
                tone="amber"
                icon={<LayersIcon size={28} />}
                label="Build actual"
                value={stats.currentBuild.version}
                valueStyle="mono"
                footnote={
                  stats.nextBuild?.releasedAt
                    ? `Próxima: ${stats.nextBuild.version} · ${shortDate(stats.nextBuild.releasedAt)}`
                    : 'Sin próxima build'
                }
                footnoteClass="text-warning"
              />
              <StatCard
                tone="violet"
                icon={<TeamIcon size={28} />}
                label="Equipo"
                value={stats.teamSize}
                footnote={`en ${stats.areaCount} áreas`}
              />
            </>
          )}
        </div>

        <div className="grid h-[262px] grid-cols-2 gap-5">
          {areaProgress && <AreaProgress items={areaProgress} />}
          {weekly && <WeeklyCompletedChart points={weekly} />}
        </div>

        <div className="grid h-[262px] grid-cols-2 gap-5">
          {agenda && <TodayTasks items={agenda} />}
          <Panel className="flex gap-[22px] px-[22px] py-[18px]">
            <MiniCalendar month={month} today={APP_NOW} events={events ?? []} onMonthChange={setMonth} />
            {deadlines && <UpcomingDeadlines items={deadlines} />}
          </Panel>
        </div>

        <div className="grid h-[236px] grid-cols-3 gap-5">
          {activity && <RecentActivity items={activity} variant="relative" />}
          {builds && <BuildHistory items={builds} />}
          {doneBreakdown && <DoneStateBreakdown data={doneBreakdown} />}
        </div>
      </div>
    </>
  );
}
