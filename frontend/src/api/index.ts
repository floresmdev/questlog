import type { QuestlogApi } from './client';
import { mockApi } from './mockClient';

// Swap for an HTTP implementation of QuestlogApi once /backend exists.
export const api: QuestlogApi = mockApi;

export type { QuestlogApi } from './client';
export * from './types';
