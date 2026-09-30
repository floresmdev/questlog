import type { BuildHistoryItem } from '../../api/types';
import { buildLabel, shortDate } from '../../lib/format';
import { BuildChip } from '../ui/BuildChip';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface BuildHistoryProps {
  items: BuildHistoryItem[];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Summary({ item }: { item: BuildHistoryItem }) {
  const parts = [
    item.integrated > 0 && <b key="i" className="text-success">+{plural(item.integrated, 'integrada', 'integradas')}</b>,
    item.modified > 0 && <b key="m" className="text-violet">{plural(item.modified, 'modificada', 'modificadas')}</b>,
    item.removed > 0 && <b key="r" className="text-danger">{plural(item.removed, 'eliminada', 'eliminadas')}</b>,
  ].filter(Boolean);
  return <>{parts.flatMap((p, i) => (i === 0 ? [p] : [' · ', p]))}</>;
}

/** Vertical timeline: the build in preparation first, then released builds. */
export function BuildHistory({ items }: BuildHistoryProps) {
  return (
    <Panel className="flex flex-col gap-2.5 px-5 py-[18px]">
      <SectionHeader title="Historial de builds" link={{ label: 'Ver todas', to: '#builds' }} />
      <div className="flex flex-col">
        {items.map((item, i) => {
          const planned = item.build.buildNumber === null;
          const isLast = i === items.length - 1;
          return (
            <div key={item.build.id} className="flex gap-3">
              <div className="flex w-3.5 flex-col items-center">
                <span
                  className={`mt-[3px] h-3 w-3 shrink-0 rounded-full ${
                    planned ? 'border-2 border-dashed border-primary' : 'bg-success'
                  }`}
                />
                {!isLast && <span className="w-0.5 flex-grow bg-border" />}
              </div>
              <div className={`flex flex-grow flex-col gap-[3px] ${isLast ? '' : 'pb-3'}`}>
                <div className="flex items-center gap-2">
                  <BuildChip size="md" colorClass={planned ? 'bg-primary-tint text-primary-hover' : undefined}>
                    {buildLabel(item.build)}
                  </BuildChip>
                  <span className="text-xs font-semibold text-ink-muted">
                    {item.build.releasedAt && shortDate(item.build.releasedAt)}
                    {planned && ' · en preparación'}
                  </span>
                </div>
                <span className="text-xs text-ink-2">
                  {planned ? `${item.assigned} tareas asignadas a esta build` : <Summary item={item} />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
