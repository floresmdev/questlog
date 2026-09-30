import type { DoneState } from '../../api/types';
import { doneStateLabel, doneStateTagClass } from '../../lib/styles';
import { Tag, type TagSize } from './Tag';

interface DoneStateTagProps {
  state: DoneState;
  size?: TagSize;
}

export function DoneStateTag({ state, size }: DoneStateTagProps) {
  return (
    <Tag colorClass={doneStateTagClass[state]} size={size}>
      {doneStateLabel[state]}
    </Tag>
  );
}
