import { config } from './config';

/** "Now" for every query: frozen by APP_NOW in dev/test, the real clock otherwise. */
export const now = (): Date => (config.APP_NOW ? new Date(config.APP_NOW) : new Date());
