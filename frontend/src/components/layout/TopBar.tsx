import type { ReactNode } from 'react';
import type { User } from '../../api/types';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { BellIcon, MessageLinesIcon, SearchIcon, SettingsIcon } from '../ui/icons';

interface TopBarProps {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  /** Tailwind width class for the search box. */
  searchWidth?: string;
  /** Primary button shown before the icon buttons (e.g. "Nueva tarea"). */
  action?: ReactNode;
  showSettings?: boolean;
  user: User | undefined;
}

export function TopBar({
  title,
  subtitle,
  searchPlaceholder,
  searchLabel,
  searchWidth = 'w-[300px]',
  action,
  showSettings,
  user,
}: TopBarProps) {
  return (
    <header className="flex h-[76px] shrink-0 items-center gap-3.5 border-b border-border bg-surface px-6">
      <div className="flex min-w-0 flex-grow flex-col gap-0.5 border-l-2 border-border pl-4">
        <h1 className="m-0 text-[21px] font-extrabold text-ink">{title}</h1>
        <span className="truncate text-[13px] text-ink-muted">{subtitle}</span>
      </div>
      <label
        className={`flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-line-control bg-field px-3.5 ${searchWidth}`}
      >
        <SearchIcon size={16} className="shrink-0 text-ink-muted" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
        />
      </label>
      {action}
      <IconButton label="Notificaciones" badge>
        <BellIcon size={22} />
      </IconButton>
      <IconButton label="Mensajes">
        <MessageLinesIcon size={22} />
      </IconButton>
      {showSettings && (
        <IconButton label="Ajustes">
          <SettingsIcon size={22} />
        </IconButton>
      )}
      {user && <Avatar user={user} size="lg" />}
    </header>
  );
}
