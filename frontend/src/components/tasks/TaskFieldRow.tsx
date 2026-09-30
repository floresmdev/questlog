import type { ReactNode } from 'react';

interface TaskFieldRowProps {
  label: string;
  children: ReactNode;
}

/** Label/value row in the task detail panel. */
export function TaskFieldRow({ label, children }: TaskFieldRowProps) {
  return (
    <div className="grid min-h-[30px] grid-cols-[96px_minmax(0,1fr)] items-center text-[12.5px]">
      <span className="font-medium text-ink-muted">{label}</span>
      <span className="flex items-center gap-2 font-semibold text-ink">{children}</span>
    </div>
  );
}
