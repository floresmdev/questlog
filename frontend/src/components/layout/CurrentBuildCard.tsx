import type { CurrentBuild } from '../../api/types';
import { buildLabel, shortDate } from '../../lib/format';
import { LayersIcon } from '../ui/icons';

interface CurrentBuildCardProps {
  current: CurrentBuild;
}

export function CurrentBuildCard({ current: { build, newInGameCount } }: CurrentBuildCardProps) {
  return (
    <div className="mt-auto flex flex-col gap-3 rounded-[14px] bg-primary-soft p-[18px]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-surface text-primary">
          <LayersIcon size={20} strokeWidth={1.9} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-ink-3">Build actual</span>
          <span className="font-mono text-sm font-semibold text-ink">{buildLabel(build)}</span>
        </div>
      </div>
      <span className="text-xs leading-[1.45] text-ink-3">
        Integrada el {build.releasedAt && shortDate(build.releasedAt)} · {newInGameCount} tareas nuevas en el juego
      </span>
      <a
        href="#changelog"
        className="flex h-10 items-center justify-center rounded-[9px] bg-primary text-[13.5px] font-bold text-white hover:text-white"
      >
        Ver changelog
      </a>
    </div>
  );
}
