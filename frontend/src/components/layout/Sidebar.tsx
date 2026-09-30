import type { CurrentBuild, User } from '../../api/types';
import {
  BarChartIcon,
  CalendarIcon,
  CheckSquareIcon,
  DocumentIcon,
  GamepadIcon,
  HomeIcon,
  LayersIcon,
  MessageIcon,
  SettingsIcon,
  TeamIcon,
} from '../ui/icons';
import { CurrentBuildCard } from './CurrentBuildCard';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUser } from './SidebarUser';

const NAV = [
  { label: 'Overview', icon: HomeIcon, to: '/overview' },
  { label: 'Tareas', icon: CheckSquareIcon, to: '/tasks' },
  { label: 'Builds', icon: LayersIcon, to: '#builds' },
  { label: 'Calendario', icon: CalendarIcon, to: '#calendario' },
  { label: 'Analíticas', icon: BarChartIcon, to: '#analiticas' },
  { label: 'Documentos', icon: DocumentIcon, to: '#docs' },
  { label: 'Mensajes', icon: MessageIcon, to: '#mensajes' },
  { label: 'Equipo', icon: TeamIcon, to: '#equipo' },
  { label: 'Ajustes', icon: SettingsIcon, to: '#ajustes' },
];

interface SidebarProps {
  user: User | undefined;
  currentBuild: CurrentBuild | undefined;
}

export function Sidebar({ user, currentBuild }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen min-h-[900px] w-60 shrink-0 flex-col gap-7 border-r border-border bg-surface px-[18px] py-6">
      <div className="flex items-center gap-3 px-1.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-primary text-white">
          <GamepadIcon size={24} strokeWidth={1.9} />
        </div>
        <div className="flex flex-col">
          <span className="text-[21px] font-extrabold tracking-[-0.4px] text-ink">Questlog</span>
          <span className="text-[11px] font-semibold text-ink-muted">Game Dev Tasks</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <SidebarNavItem key={item.label} {...item} />
        ))}
      </nav>

      {currentBuild ? <CurrentBuildCard current={currentBuild} /> : <div className="mt-auto" />}
      {user && <SidebarUser user={user} />}
    </aside>
  );
}
