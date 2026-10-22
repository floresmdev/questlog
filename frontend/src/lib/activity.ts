import type { ActivityItem, HighlightTone, TaskRef } from '../api/types';
import { buildLabel } from './format';
import { doneStateLabel, priorityLabel, statusLabel } from './styles';

export interface ActivityText {
  text: string;
  /** Outcome shown in bold after `text` (Tareas feed only). */
  highlight?: { text: string; tone: HighlightTone };
}

const PRIORITY_RANK = { low: 0, medium: 1, high: 2 } as const;

const firstName = (item: ActivityItem) => item.actor.fullName.split(' ')[0];
const quoted = (task: TaskRef | null) => (task ? `«${task.title}»` : 'una tarea');

/**
 * Spanish sentence for an activity event. 'clock' (Tareas) splits the outcome
 * into a coloured highlight; 'relative' (Overview) is one plain sentence.
 */
export function renderActivity(item: ActivityItem, variant: 'clock' | 'relative'): ActivityText {
  const who = firstName(item);
  const task = quoted(item.task);
  const split = (text: string, highlight: string, tone: HighlightTone): ActivityText =>
    variant === 'clock'
      ? { text, highlight: { text: highlight, tone } }
      : { text: `${text} ${highlight}` };

  switch (item.action) {
    case 'task.moved':
      return split(`${who} movió ${task} a`, statusLabel[item.payload.to], 'progress');
    case 'task.priority_changed': {
      const { from, to } = item.payload;
      const verb = PRIORITY_RANK[to] > PRIORITY_RANK[from] ? 'subió' : 'bajó';
      return split(`${who} ${verb} la prioridad de ${task} a`, priorityLabel[to], 'danger');
    }
    case 'task.completed': {
      const { doneState, build } = item.payload;
      if (variant === 'clock') {
        return doneState === 'active' && build
          ? split(`${who} integró ${task} en`, buildLabel(build), 'success')
          : split(`${who} marcó ${task} como`, doneStateLabel[doneState], 'danger');
      }
      if (doneState === 'removed') return { text: `${who} eliminó ${task} del juego` };
      const verb = doneState === 'active' ? 'integró' : 'modificó';
      return { text: `${who} ${verb} ${task}${build ? ` en ${build.version}` : ''}` };
    }
    case 'comment.created':
      return { text: `${who} comentó en ${task}` };
    case 'build.released':
      return { text: `${who} publicó la build ${buildLabel(item.payload.build)}` };
  }
}
