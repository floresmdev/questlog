import type { TaskDetail } from '../../api/types';
import { buildLabel, daysBetween, parseDate, shortDate } from '../../lib/format';
import { APP_NOW } from '../../lib/now';
import { statusLabel, statusTagClass } from '../../lib/styles';
import { AreaTag } from '../ui/AreaTag';
import { Avatar } from '../ui/Avatar';
import { BuildChip } from '../ui/BuildChip';
import { Panel } from '../ui/Panel';
import { PriorityTag } from '../ui/PriorityTag';
import { Tag } from '../ui/Tag';
import { CloseIcon } from '../ui/icons';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import { TaskFieldRow } from './TaskFieldRow';

interface TaskDetailPanelProps {
  task: TaskDetail;
  onClose?: () => void;
}

function DaysLeft({ due }: { due: string }) {
  const days = daysBetween(APP_NOW, parseDate(due));
  if (days < 0) return <span className="text-[11px] font-semibold text-danger">(vencida)</span>;
  return (
    <span className="text-[11px] font-semibold text-warning">
      ({days} {days === 1 ? 'día' : 'días'})
    </span>
  );
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  return (
    <Panel as="aside" aria-label="Detalle de tarea" className="flex w-[330px] shrink-0 flex-col gap-3.5 p-5">
      {/* Pinned header */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex-grow text-xs font-bold tracking-[0.4px] text-ink-muted">DETALLE DE TAREA</span>
        <BuildChip>{task.code}</BuildChip>
        <button
          type="button"
          aria-label="Cerrar detalle"
          onClick={onClose}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] border-0 bg-chip text-ink-3"
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {/* Scrollable middle */}
      <div className="-mx-1 flex min-h-0 flex-grow flex-col gap-3.5 overflow-y-auto px-1">
        <h3 className="m-0 text-[19px] font-extrabold leading-[1.25] text-ink">{task.title}</h3>

        <div className="flex flex-col gap-0.5 border-b border-line-divider pb-3">
          <TaskFieldRow label="Estado">
            <Tag colorClass={statusTagClass[task.status]} size="detail">
              ● {statusLabel[task.status]}
            </Tag>
          </TaskFieldRow>
          <TaskFieldRow label="Prioridad">
            <PriorityTag priority={task.priority} size="detail" />
          </TaskFieldRow>
          <TaskFieldRow label="Responsable">
            <Avatar user={task.assignee} />
            {task.assignee.fullName}
          </TaskFieldRow>
          <TaskFieldRow label="Área">
            <AreaTag area={task.area} size="detail" />
          </TaskFieldRow>
          <TaskFieldRow label="Fechas">
            {shortDate(task.startDate)} <span className="text-ink-faint">→</span> {shortDate(task.dueDate)}
            {task.status !== 'done' && <DaysLeft due={task.dueDate} />}
          </TaskFieldRow>
          <TaskFieldRow label="Build">
            {task.integratedBuild ? (
              <BuildChip size="detail">{buildLabel(task.integratedBuild)}</BuildChip>
            ) : (
              <>
                {task.targetBuild && <BuildChip size="detail">{task.targetBuild.version} · objetivo</BuildChip>}
                <span className="text-[11px] font-medium text-ink-muted">sin integrar</span>
              </>
            )}
          </TaskFieldRow>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-extrabold text-ink">Descripción</span>
          <p className="m-0 text-[12.5px] leading-[1.55] text-ink-2">{task.description}</p>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-line-divider pt-3">
          <div className="flex items-center">
            <span className="flex-grow text-[13px] font-extrabold text-ink">Comentarios ({task.commentCount})</span>
            <a href="#comentarios" className="text-xs font-bold">
              Ver todos
            </a>
          </div>
          {task.comments.map((c) => (
            <CommentItem key={c.id} comment={c} showJobTitle={c.authorId !== task.assigneeId} />
          ))}
          <CommentComposer />
        </div>
      </div>

      {/* Pinned actions */}
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="h-[42px] flex-grow cursor-pointer rounded-[10px] border border-line-control bg-surface text-[13px] font-bold text-ink-2"
        >
          Editar
        </button>
        <button
          type="button"
          className="h-[42px] flex-grow-[2] cursor-pointer rounded-[10px] border-0 bg-success text-[13px] font-bold text-white"
        >
          Marcar como terminada
        </button>
      </div>
    </Panel>
  );
}
