import { ChevronDownIcon } from './icons';

interface FilterDropdownProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

/** Outlined button with a chevron; opens a filter menu (menu not built yet). */
export function FilterDropdown({ label, onClick, className = 'h-[34px] text-[12.5px]' }: FilterDropdownProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-line-control bg-surface px-3 font-semibold text-ink-2 ${className}`}
    >
      {label}
      <ChevronDownIcon size={14} />
    </button>
  );
}
