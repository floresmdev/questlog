import type { ActivityItem } from '../api/types';

type ActivitySeed = Omit<ActivityItem, 'actor'> & { actorId: string };

/** Feed shown on the Tareas screen (time + highlighted outcome). */
export const taskActivity: ActivitySeed[] = [
  { id: 'a-1', actorId: 'u-dr', createdAt: '2026-09-28T14:20:00', text: 'Diego movió «Pathfinding» a', highlight: { text: 'En proceso', tone: 'progress' } },
  { id: 'a-2', actorId: 'u-lp', createdAt: '2026-09-28T12:05:00', text: 'Luis subió la prioridad del crash en Switch a', highlight: { text: 'Alta', tone: 'danger' } },
  { id: 'a-3', actorId: 'u-st', createdAt: '2026-09-28T10:40:00', text: 'Sofía marcó «Sistema de stamina» como', highlight: { text: 'Eliminada', tone: 'danger' } },
  { id: 'a-4', actorId: 'u-st', createdAt: '2026-09-28T09:15:00', text: 'Sofía integró «Doble salto» en', highlight: { text: 'v0.9.0 #214', tone: 'success' } },
];

/** Feed shown on the Overview screen (relative time). */
export const overviewActivity: ActivitySeed[] = [
  { id: 'a-1', actorId: 'u-dr', createdAt: '2026-09-28T14:20:00', text: 'Diego movió «Pathfinding» a En proceso' },
  { id: 'a-5', actorId: 'u-lp', createdAt: '2026-09-28T13:20:00', text: 'Luis comentó en «Crash en Switch»' },
  { id: 'a-3', actorId: 'u-st', createdAt: '2026-09-28T10:40:00', text: 'Sofía eliminó «Sistema de stamina» del juego' },
  { id: 'a-6', actorId: 'u-ac', createdAt: '2026-09-27T17:00:00', text: 'Ana modificó «HUD de vida» en v0.9.0' },
  { id: 'a-7', actorId: 'u-lm', createdAt: '2026-09-26T18:00:00', text: 'Laura publicó la build v0.9.0 · #214' },
];
