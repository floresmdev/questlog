import type { AreaColorKey, AvatarColor, DoneState, HighlightTone, LaneId, Priority, TaskStatus } from '../api/types';

// Full class strings (not interpolated) so Tailwind can see them.

export const areaTagClass: Record<AreaColorKey, string> = {
  programming: 'bg-area-programming-bg text-area-programming-text',
  art: 'bg-area-art-bg text-area-art-text',
  design: 'bg-area-design-bg text-area-design-text',
  audio: 'bg-area-audio-bg text-area-audio-text',
  uiux: 'bg-area-uiux-bg text-area-uiux-text',
  qa: 'bg-area-qa-bg text-area-qa-text',
  animation: 'bg-area-animation-bg text-area-animation-text',
  narrative: 'bg-area-narrative-bg text-area-narrative-text',
};

export const priorityLabel: Record<Priority, string> = { high: 'Alta', medium: 'Media', low: 'Baja' };

export const priorityTagClass: Record<Priority, string> = {
  high: 'bg-priority-high-bg text-priority-high-text',
  medium: 'bg-priority-medium-bg text-priority-medium-text',
  low: 'bg-priority-low-bg text-priority-low-text',
};

export const doneStateLabel: Record<DoneState, string> = {
  active: 'En el juego',
  modified: 'Modificada',
  removed: 'Eliminada',
};

export const doneStateTagClass: Record<DoneState, string> = {
  active: 'bg-done-active-bg text-done-active-text',
  modified: 'bg-done-modified-bg text-done-modified-text',
  removed: 'bg-done-removed-bg text-done-removed-text',
};

export const statusLabel: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  done: 'Terminada',
};

export const statusTagClass: Record<TaskStatus, string> = {
  pending: 'bg-lane-pending-head text-lane-pending-text',
  in_progress: 'bg-lane-progress-head text-lane-progress-text',
  done: 'bg-lane-active-head text-lane-active-text',
};

export const avatarBgClass: Record<AvatarColor, string> = {
  blue: 'bg-avatar-blue',
  violet: 'bg-avatar-violet',
  pink: 'bg-avatar-pink',
  teal: 'bg-avatar-teal',
  orange: 'bg-avatar-orange',
  red: 'bg-avatar-red',
  slate: 'bg-avatar-slate',
};

export const highlightToneClass: Record<HighlightTone, string> = {
  progress: 'text-warning',
  danger: 'text-danger',
  success: 'text-success',
};

export interface LaneStyle {
  title: string;
  lane: string;
  head: string;
  text: string;
  /** Set on lanes that show an "add task" button in the header. */
  addLabel?: string;
  moreHref: string;
}

export const laneStyle: Record<LaneId, LaneStyle> = {
  pending: {
    title: 'Pendiente',
    lane: 'bg-lane-pending-bg',
    head: 'bg-lane-pending-head',
    text: 'text-lane-pending-text',
    addLabel: 'Añadir tarea pendiente',
    moreHref: '#pendientes',
  },
  in_progress: {
    title: 'En proceso',
    lane: 'bg-lane-progress-bg',
    head: 'bg-lane-progress-head',
    text: 'text-lane-progress-text',
    addLabel: 'Añadir tarea en proceso',
    moreHref: '#proceso',
  },
  done_active: {
    title: 'Activas en el juego',
    lane: 'bg-lane-active-bg',
    head: 'bg-lane-active-head',
    text: 'text-lane-active-text',
    moreHref: '#activas',
  },
  done_changed: {
    title: 'Modificadas / eliminadas',
    lane: 'bg-lane-changed-bg',
    head: 'bg-lane-changed-head',
    text: 'text-lane-changed-text',
    moreHref: '#modificadas',
  },
};

