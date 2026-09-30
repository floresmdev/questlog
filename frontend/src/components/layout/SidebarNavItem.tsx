import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import type { IconProps } from '../ui/icons';

interface SidebarNavItemProps {
  label: string;
  icon: ComponentType<IconProps>;
  /** Router path ("/tasks") or a placeholder anchor ("#builds") for screens not built yet. */
  to: string;
}

const base = 'flex h-11 items-center gap-3.5 rounded-[10px] px-3.5 text-[14.5px] font-semibold';
const idle = `${base} text-ink-2 hover:bg-hover hover:text-ink`;
const active = `${base} bg-primary text-white hover:text-white`;

export function SidebarNavItem({ label, icon: Icon, to }: SidebarNavItemProps) {
  const content = (
    <>
      <Icon size={22} />
      {label}
    </>
  );

  if (!to.startsWith('/')) {
    return (
      <a href={to} className={idle}>
        {content}
      </a>
    );
  }
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? active : idle)}>
      {content}
    </NavLink>
  );
}
