import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('content script entry', () => {
  it('imports only the default-wallet store instead of the state barrel', () => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const entry = fs.readFileSync(path.join(dirname, 'index.ts'), 'utf8');

    expect(entry).toContain(
      "import { useIsDefaultWalletStore } from '~/core/state/currentSettings/isDefaultWallet';",
    );
    expect(entry).not.toContain("from '~/core/state'");
  });
});
