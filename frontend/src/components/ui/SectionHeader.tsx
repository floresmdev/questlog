import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  /** Heading size: 15px on Tareas widgets, 16px on Overview, 17px for the board. */
  size?: 15 | 16 | 17;
  /** Right-aligned "Ver …" link; internal paths use the router. */
  link?: { label: string; to: string };
  /** Anything else to place on the right. */
  children?: ReactNode;
  className?: string;
}

const sizeClass = { 15: 'text-[15px]', 16: 'text-base', 17: 'text-[17px]' };

export function SectionHeader({ title, size = 16, link, children, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h2 className={`m-0 flex-grow whitespace-nowrap font-extrabold text-ink ${sizeClass[size]}`}>{title}</h2>
      {children}
      {link &&
        (link.to.startsWith('/') ? (
          <Link to={link.to} className="text-[12.5px] font-bold">
            {link.label}
          </Link>
        ) : (
          <a href={link.to} className="text-[12.5px] font-bold">
            {link.label}
          </a>
        ))}
    </div>
  );
}
