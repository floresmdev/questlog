import type { ReactNode } from 'react';

/** sm: Kanban cards · md: Overview · detail: task detail panel. */
export type TagSize = 'sm' | 'md' | 'detail';

const sizeClass: Record<TagSize, string> = {
  sm: 'h-5 px-[7px] rounded-[5px] text-[10.5px]',
  md: 'h-[22px] px-2 rounded-md text-[11.5px]',
  detail: 'h-[22px] px-[7px] rounded-[5px] text-[11.5px]',
};

interface TagProps {
  /** Background + text color classes. */
  colorClass: string;
  size?: TagSize;
  className?: string;
  children: ReactNode;
}

/** Small colored pill (area, priority, state). */
export function Tag({ colorClass, size = 'sm', className = '', children }: TagProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-bold ${sizeClass[size]} ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
