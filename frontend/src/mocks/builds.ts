import type { Build } from '../api/types';

export const builds: Build[] = [
  { id: 'b-091', version: 'v0.9.1', buildNumber: null, releasedAt: '2026-10-03', notes: '' },
  { id: 'b-090', version: 'v0.9.0', buildNumber: 214, releasedAt: '2026-09-26', notes: '' },
  { id: 'b-087', version: 'v0.8.7', buildNumber: 198, releasedAt: '2026-09-12', notes: '' },
  { id: 'b-085', version: 'v0.8.5', buildNumber: 181, releasedAt: '2026-08-29', notes: '' },
];

export const currentBuildId = 'b-090';
