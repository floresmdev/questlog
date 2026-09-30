import type { Priority } from '../../api/types';
import { priorityLabel, priorityTagClass } from '../../lib/styles';
import { Tag, type TagSize } from './Tag';

interface PriorityTagProps {
  priority: Priority;
  size?: TagSize;
  className?: string;
}

export function PriorityTag({ priority, size, className }: PriorityTagProps) {
  return (
    <Tag colorClass={priorityTagClass[priority]} size={size} className={className}>
      {priorityLabel[priority]}
    </Tag>
  );
}
