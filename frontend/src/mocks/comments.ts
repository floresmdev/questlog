import type { Comment, Id } from '../api/types';
import { tasks } from './tasks';

/** Comments written out in full (the ones the design shows). */
const written: Comment[] = [
  {
    id: 'c-142-a',
    taskId: 't-142',
    authorId: 'u-lp',
    body: 'Reproducido en #214: se atoran en el túnel del checkpoint 2.',
    createdAt: '2026-09-28T13:20:00-06:00',
  },
  {
    id: 'c-142-b',
    taskId: 't-142',
    authorId: 'u-dr',
    body: 'El grafo de nodos ya está. Falta la evasión; lo subo a la rama hoy.',
    createdAt: '2026-09-28T15:20:00-06:00',
  },
  {
    id: 'c-139-a',
    taskId: 't-139',
    authorId: 'u-lp',
    body: 'Pasa solo con partidas creadas antes de la v0.8.7. Adjunto el save.',
    createdAt: '2026-09-28T13:20:00-06:00',
  },
];

/** Total comments per task in the design; tasks not listed get `code % 3`. */
const designCounts: Record<Id, number> = {
  't-151': 3,
  't-148': 1,
  't-149': 5,
  't-153': 0,
  't-142': 4,
  't-139': 6,
  't-144': 2,
  't-145': 3,
  't-131': 7,
  't-118': 2,
  't-104': 1,
  't-122': 9,
  't-127': 4,
  't-112': 2,
  't-154': 0,
  't-155': 0,
  't-156': 0,
  't-166': 0,
  't-167': 0,
};

const FILLER_BODIES = [
  'Revisado, se ve bien en la última build.',
  '¿Podemos verlo en la reunión de mañana?',
  'Subí una versión nueva a la carpeta compartida.',
  'Bloqueado hasta que se cierre la tarea anterior.',
  'Probado en Switch y PC, sin problemas.',
];
const FILLER_AUTHORS = ['u-lm', 'u-lp', 'u-gm'];
const HOUR_MS = 3_600_000;

/** Filler comments, every 6 h after the task was created, before the written ones. */
function fillers(): Comment[] {
  return tasks.flatMap((task) => {
    const total = designCounts[task.id] ?? Number(task.code.slice(3)) % 3;
    const count = total - written.filter((c) => c.taskId === task.id).length;
    const start = new Date(task.createdAt).getTime();
    return Array.from({ length: count }, (_, i) => ({
      id: `c-${task.id.slice(2)}-${i + 1}`,
      taskId: task.id,
      authorId: i % 2 === 0 ? (task.assigneeId ?? 'u-lm') : FILLER_AUTHORS[i % 3],
      body: FILLER_BODIES[(i + Number(task.code.slice(3))) % FILLER_BODIES.length],
      createdAt: new Date(start + (i + 1) * 6 * HOUR_MS).toISOString(),
    }));
  });
}

export const comments: Comment[] = [...written, ...fillers()];
