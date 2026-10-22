import { describe, expect, it, vi } from 'vitest';

describe('config', () => {
  it('treats empty variables as unset', async () => {
    vi.stubEnv('APP_NOW', '');
    vi.resetModules();
    const { config } = await import('../src/config');
    expect(config.APP_NOW).toBeUndefined();
    vi.unstubAllEnvs();
  });

  it('fails fast with a readable message on invalid values', async () => {
    vi.stubEnv('APP_TIMEZONE', 'Mars/Olympus');
    vi.resetModules();
    await expect(import('../src/config')).rejects.toThrow(/APP_TIMEZONE/);
    vi.unstubAllEnvs();
  });
});
