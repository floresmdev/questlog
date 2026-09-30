import type { ReactNode } from 'react';

interface IconButtonProps {
  label: string;
  children: ReactNode;
  /** Show the blue unread dot. */
  badge?: boolean;
  onClick?: () => void;
}

export function IconButton({ label, children, badge, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent text-ink-2 hover:bg-hover"
    >
      {children}
      {badge && (
        <span className="absolute right-[9px] top-2 h-2 w-2 box-content rounded-full border-2 border-surface bg-primary" />
      )}
    </button>
  );
}
