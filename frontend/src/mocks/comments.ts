import type { Comment } from '../api/types';

export const comments: Comment[] = [
  {
    id: 'c-1',
    taskId: 't-142',
    authorId: 'u-lp',
    body: 'Reproducido en #214: se atoran en el túnel del checkpoint 2.',
    createdAt: '2026-09-28T13:20:00',
  },
  {
    id: 'c-2',
    taskId: 't-142',
    authorId: 'u-dr',
    body: 'El grafo de nodos ya está. Falta la evasión; lo subo a la rama hoy.',
    createdAt: '2026-09-28T15:20:00',
  },
];
