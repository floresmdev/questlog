/**
 * The app's notion of "now". Fixed to the moment the design mocks were drawn
 * (Monday 28 Sep 2026, 16:20 in Mexico City) so relative dates match the
 * references and the seeded data. The backend uses the same instant via its
 * `APP_NOW` env var. Switch to `new Date()` in phase 3.
 */
export const APP_NOW = new Date('2026-09-28T16:20:00-06:00');

/** The studio's timezone: days and weeks are counted here (backend: `APP_TIMEZONE`). */
export const APP_TIMEZONE = 'America/Mexico_City';
