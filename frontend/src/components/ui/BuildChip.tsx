import type { ReactNode } from 'react';
import { LayersIcon } from './icons';

interface BuildChipProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'detail';
  /** Show the layers glyph before the label (Kanban cards). */
  withIcon?: boolean;
  /** Override the default grey colors. */
  colorClass?: string;
  className?: string;
}

const sizeClass = {
  sm: 'h-5 px-[7px] rounded-[5px] text-[10.5px]',
  md: 'h-[22px] px-2 rounded-md text-[11.5px]',
  detail: 'h-[22px] px-[7px] rounded-[5px] text-[10.5px]',
};

/** Monospace chip for task IDs and build numbers. */
export function BuildChip({ children, size = 'sm', withIcon, colorClass = 'bg-chip text-ink-2', className = '' }: BuildChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] whitespace-nowrap font-mono font-semibold ${sizeClass[size]} ${colorClass} ${className}`}
    >
      {withIcon && <LayersIcon size={11} strokeWidth={2.2} />}
      {children}
    </span>
  );
}
