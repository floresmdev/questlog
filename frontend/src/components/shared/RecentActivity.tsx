import type { ActivityItem } from '../../api/types';
import { clockTime, relativeTime } from '../../lib/format';
import { highlightToneClass } from '../../lib/styles';
import { Avatar } from '../ui/Avatar';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface RecentActivityProps {
  items: ActivityItem[];
  /**
   * 'clock': time column on the left + highlighted outcome (Tareas).
   * 'relative': "hace 2 h" on the right (Overview).
   */
  variant: 'clock' | 'relative';
}

export function RecentActivity({ items, variant }: RecentActivityProps) {
  const isClock = variant === 'clock';

  return (
    <Panel className={`flex flex-col px-5 py-[18px] ${isClock ? 'gap-3' : 'gap-[11px]'}`}>
      <SectionHeader title="Actividad reciente" size={isClock ? 15 : 16} link={{ label: 'Ver todo', to: '#actividad' }} />
      {items.map((item) =>
        isClock ? (
          <div key={item.id} className="flex items-center gap-2.5 text-xs">
            <span className="w-[38px] shrink-0 font-mono text-[11px] font-semibold text-ink-muted">
              {clockTime(item.createdAt)}
            </span>
            <Avatar user={item.actor} size="xs" />
            <span className="flex-grow leading-[1.35] text-ink-2">
              {item.text}{' '}
              {item.highlight && <b className={highlightToneClass[item.highlight.tone]}>{item.highlight.text}</b>}
            </span>
          </div>
        ) : (
          <div key={item.id} className="flex items-center gap-2.5 text-[12.5px]">
            <Avatar user={item.actor} size="sm" />
            <span className="flex-grow leading-[1.3] text-ink-2">{item.text}</span>
            <span className="whitespace-nowrap text-[11.5px] font-semibold text-ink-muted">
              {relativeTime(item.createdAt)}
            </span>
          </div>
        ),
      )}
    </Panel>
  );
}
