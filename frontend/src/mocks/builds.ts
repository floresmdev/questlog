import type { Build } from '../api/types';

export const builds: Build[] = [
  {
    id: 'b-091',
    version: 'v0.9.1',
    buildNumber: null,
    plannedFor: '2026-10-03',
    releasedAt: null,
    notes: '',
  },
  {
    id: 'b-090',
    version: 'v0.9.0',
    buildNumber: 214,
    plannedFor: null,
    releasedAt: '2026-09-26T18:00:00-06:00',
    notes: '',
  },
  {
    id: 'b-087',
    version: 'v0.8.7',
    buildNumber: 198,
    plannedFor: null,
    releasedAt: '2026-09-12T18:00:00-06:00',
    notes: '',
  },
  {
    id: 'b-085',
    version: 'v0.8.5',
    buildNumber: 181,
    plannedFor: null,
    releasedAt: '2026-08-29T18:00:00-06:00',
    notes: '',
  },
];

export const currentBuildId = 'b-090';
