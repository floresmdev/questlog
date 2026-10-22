import type { QuestlogApi } from './client';
import { httpApi } from './httpClient';
import { mockApi } from './mockClient';

// The single switch point. Vite inlines VITE_API_MODE at build time, so the
// unused client (and the mock data) is dropped from the bundle.
export const api: QuestlogApi = import.meta.env.VITE_API_MODE === 'http' ? httpApi : mockApi;

export type { QuestlogApi } from './client';
export * from './types';
