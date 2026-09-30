import type { Build, ISODate, ISODateTime } from '../api/types';
import { APP_NOW } from './now';

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_MS = 86_400_000;

/** Parses `YYYY-MM-DD` (or a full timestamp) as a local date. */
export function parseDate(value: ISODate | ISODateTime): Date {
  return value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  return daysBetween(a, b) === 0;
}

/** "03 oct" */
export function shortDate(value: ISODate | ISODateTime): string {
  const d = parseDate(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "3 ago" — unpadded, used on chart axes. */
export function axisDate(value: ISODate): string {
  const d = parseDate(value);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "Septiembre 2026" */
export function monthTitle(d: Date): string {
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** "14:20" */
export function clockTime(value: ISODateTime): string {
  const d = parseDate(value);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "hace 3 h" · "ayer" · "26 sep" */
export function relativeTime(value: ISODateTime, now: Date = APP_NOW): string {
  const d = parseDate(value);
  const days = daysBetween(d, now);
  if (days === 0) {
    const hours = Math.floor((now.getTime() - d.getTime()) / 3_600_000);
    return hours < 1 ? 'hace un momento' : `hace ${hours} h`;
  }
  if (days === 1) return 'ayer';
  return shortDate(value);
}

/** "v0.9.0 · #214" or "v0.9.1" while the build has no number. */
export function buildLabel(build: Build): string {
  return build.buildNumber === null ? build.version : `${build.version} · #${build.buildNumber}`;
}
