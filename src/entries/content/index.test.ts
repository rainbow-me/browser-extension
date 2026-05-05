import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('~/core/messengers', () => ({
  initializeMessenger: vi.fn(() => ({ send: vi.fn() })),
}));

vi.mock('~/core/messengers/internal/bridge', () => ({
  setupBridgeMessengerRelay: vi.fn(),
}));

vi.mock('~/core/utils/lockdown', () => ({}));

describe('content script entry', () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    await chrome.storage.local.clear();
  });

  it('imports only the default-wallet store instead of the state barrel', () => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const entry = fs.readFileSync(path.join(dirname, 'index.ts'), 'utf8');

    expect(entry).toContain(
      "import { useIsDefaultWalletStore } from '~/core/state/currentSettings/isDefaultWallet';",
    );
    expect(entry).not.toContain("from '~/core/state'");
  });

  it('does not hydrate unrelated stores with stale versions', async () => {
    await chrome.storage.local.set({
      'rainbow.zustand.currentLanguage': {
        state: { currentLanguage: 'en_US' },
        version: 0,
      },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('./index');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        "State loaded from storage couldn't be migrated since no migrate function was provided",
      ),
    );
  });
});
