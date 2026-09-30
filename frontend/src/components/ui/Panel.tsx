import type { HTMLAttributes } from 'react';

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'aside';
}

/** White rounded card used for every dashboard block. */
export function Panel({ as: Tag = 'div', className = '', ...rest }: PanelProps) {
  return <Tag className={`panel box-border ${className}`} {...rest} />;
}
