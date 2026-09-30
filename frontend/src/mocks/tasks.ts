import type { Id, Task } from '../api/types';

type TaskSeed = Pick<Task, 'id' | 'code' | 'title' | 'areaId' | 'assigneeId' | 'status' | 'priority' | 'dueDate'> &
  Partial<Task>;

const base = {
  description: '',
  doneState: null,
  changeNote: null,
  startDate: '2026-09-15',
  completedAt: null,
  targetBuildId: null,
  integratedBuildId: null,
  createdBy: 'u-lm',
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-28T10:00:00Z',
} satisfies Partial<Task>;

const make = (seed: TaskSeed, position: number): Task => ({ ...base, position, ...seed });

/** Cards visible on the board (the rest of each lane is behind "Ver N más"). */
export const tasks: Task[] = [
  // Pendiente
  make({ id: 't-151', code: 'QL-151', title: 'Guardado en la nube (Steam Cloud)', areaId: 'area-prog', assigneeId: 'u-dr', status: 'pending', priority: 'high', dueDate: '2026-10-12', targetBuildId: 'b-091' }, 0),
  make({ id: 't-148', code: 'QL-148', title: 'Concept art: jefe del nivel 3', areaId: 'area-art', assigneeId: 'u-mr', status: 'pending', priority: 'medium', dueDate: '2026-10-08' }, 1),
  make({ id: 't-149', code: 'QL-149', title: 'Balance de economía de la tienda', areaId: 'area-design', assigneeId: 'u-st', status: 'pending', priority: 'high', dueDate: '2026-10-10' }, 2),
  make({ id: 't-153', code: 'QL-153', title: 'SFX de pasos por superficie', areaId: 'area-audio', assigneeId: 'u-vg', status: 'pending', priority: 'low', dueDate: '2026-10-15' }, 3),

  // En proceso
  make({
    id: 't-142',
    code: 'QL-142',
    title: 'Pathfinding de enemigos voladores',
    description:
      'Los murciélagos y drones del nivel 2 atraviesan paredes al perseguir al jugador. Implementar navegación por nodos con evasión de obstáculos y recálculo de ruta cada 0.5 s.',
    areaId: 'area-prog',
    assigneeId: 'u-dr',
    status: 'in_progress',
    priority: 'high',
    startDate: '2026-09-22',
    dueDate: '2026-10-03',
    targetBuildId: 'b-091',
  }, 0),
  make({ id: 't-139', code: 'QL-139', title: 'Crash al cargar partida en Switch', areaId: 'area-qa', assigneeId: 'u-lp', status: 'in_progress', priority: 'high', dueDate: '2026-09-30', targetBuildId: 'b-091' }, 1),
  make({ id: 't-144', code: 'QL-144', title: 'Animaciones de combate del jugador', areaId: 'area-anim', assigneeId: 'u-mr', status: 'in_progress', priority: 'medium', dueDate: '2026-10-06', targetBuildId: 'b-091' }, 2),
  make({ id: 't-145', code: 'QL-145', title: 'Menú de pausa y opciones', areaId: 'area-ui', assigneeId: 'u-ac', status: 'in_progress', priority: 'medium', dueDate: '2026-10-09', targetBuildId: 'b-091' }, 3),

  // Terminadas · activas en el juego
  make({ id: 't-131', code: 'QL-131', title: 'Doble salto y coyote time', areaId: 'area-design', assigneeId: 'u-st', status: 'done', doneState: 'active', priority: 'high', dueDate: '2026-09-26', completedAt: '2026-09-26T09:15:00', integratedBuildId: 'b-090' }, 0),
  make({ id: 't-118', code: 'QL-118', title: 'Tileset del bosque', areaId: 'area-art', assigneeId: 'u-mr', status: 'done', doneState: 'active', priority: 'medium', dueDate: '2026-09-12', completedAt: '2026-09-12T12:00:00', integratedBuildId: 'b-087' }, 1),
  make({ id: 't-104', code: 'QL-104', title: 'Música del menú principal', areaId: 'area-audio', assigneeId: 'u-vg', status: 'done', doneState: 'active', priority: 'low', dueDate: '2026-08-29', completedAt: '2026-08-29T12:00:00', integratedBuildId: 'b-085' }, 2),

  // Terminadas · modificadas / eliminadas
  make({ id: 't-122', code: 'QL-122', title: 'Sistema de stamina', areaId: 'area-design', assigneeId: 'u-st', status: 'done', doneState: 'removed', changeNote: 'Retirada tras el playtest', priority: 'medium', dueDate: '2026-09-26', completedAt: '2026-09-26T10:40:00', integratedBuildId: 'b-090' }, 0),
  make({ id: 't-127', code: 'QL-127', title: 'HUD de vida', areaId: 'area-ui', assigneeId: 'u-ac', status: 'done', doneState: 'modified', changeNote: 'Barra reemplazada por corazones', priority: 'medium', dueDate: '2026-09-26', completedAt: '2026-09-26T12:00:00', integratedBuildId: 'b-090' }, 1),
  make({ id: 't-112', code: 'QL-112', title: 'Diálogos del tutorial', areaId: 'area-narr', assigneeId: 'u-sf', status: 'done', doneState: 'modified', changeNote: 'Texto reescrito y acortado', priority: 'low', dueDate: '2026-09-12', completedAt: '2026-09-12T12:00:00', integratedBuildId: 'b-087' }, 2),
];

/** Equivalent of `SELECT task_id, count(*) FROM comments GROUP BY task_id`. */
export const commentCounts: Record<Id, number> = {
  't-151': 3, 't-148': 1, 't-149': 5, 't-153': 0,
  't-142': 4, 't-139': 6, 't-144': 2, 't-145': 3,
  't-131': 7, 't-118': 2, 't-104': 1,
  't-122': 9, 't-127': 4, 't-112': 2,
};
