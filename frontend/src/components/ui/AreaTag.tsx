import type { Area } from '../../api/types';
import { areaTagClass } from '../../lib/styles';
import { Tag, type TagSize } from './Tag';

interface AreaTagProps {
  area: Area;
  size?: TagSize;
  className?: string;
}

export function AreaTag({ area, size, className }: AreaTagProps) {
  return (
    <Tag colorClass={areaTagClass[area.colorKey]} size={size} className={className}>
      {area.name}
    </Tag>
  );
}
