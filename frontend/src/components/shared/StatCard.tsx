import type { ReactNode } from 'react';
import { Panel } from '../ui/Panel';

export type StatTone = 'blue' | 'amber' | 'green' | 'violet';

const toneClass: Record<StatTone, string> = {
  blue: 'bg-primary-tint text-primary',
  amber: 'bg-warning-tint text-warning',
  green: 'bg-success-tint text-success',
  violet: 'bg-violet-tint text-violet',
};

interface StatCardProps {
  icon: ReactNode;
  tone: StatTone;
  label: string;
  value: ReactNode;
  /** 'mono' renders the value as a build number (22px JetBrains Mono). */
  valueStyle?: 'number' | 'mono';
  footnote: ReactNode;
  /** Text color class for the footnote. */
  footnoteClass?: string;
}

export function StatCard({ icon, tone, label, value, valueStyle = 'number', footnote, footnoteClass = 'text-ink-3' }: StatCardProps) {
  return (
    <Panel className="flex h-[104px] items-center gap-4 px-5 py-[18px]">
      <div className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl ${toneClass[tone]}`}>{icon}</div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold text-ink-2">{label}</span>
        <span
          className={
            valueStyle === 'mono'
              ? 'font-mono text-[22px] font-semibold leading-[1.3] text-ink'
              : 'text-[28px] font-extrabold leading-[1.1] text-ink'
          }
        >
          {value}
        </span>
        <span className={`text-xs font-semibold ${footnoteClass}`}>{footnote}</span>
      </div>
    </Panel>
  );
}
