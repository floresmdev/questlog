import { createHash } from 'node:crypto';

/**
 * Deterministic UUID for a mock id ('t-142' → always the same UUID), so
 * reseeding keeps URLs stable and tests can map API ids back to mock ids.
 */
export function seedUuid(mockId: string): string {
  const hex = createHash('sha1').update(`questlog-seed:${mockId}`).digest('hex');
  // Shape it like a version-5 UUID (name-based, SHA-1).
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
