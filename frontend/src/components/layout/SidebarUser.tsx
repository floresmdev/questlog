import type { User } from '../../api/types';
import { Avatar } from '../ui/Avatar';
import { ChevronDownIcon } from '../ui/icons';

interface SidebarUserProps {
  user: User;
}

export function SidebarUser({ user }: SidebarUserProps) {
  return (
    <div className="flex items-center gap-3 border-t border-line-divider px-1.5 pt-3">
      <Avatar user={user} size="xl" />
      <div className="flex flex-grow flex-col">
        <span className="text-sm font-bold text-ink">{user.fullName}</span>
        <span className="text-xs text-ink-muted">{user.jobTitle}</span>
      </div>
      <ChevronDownIcon size={16} strokeWidth={2} className="text-ink-muted" />
    </div>
  );
}
