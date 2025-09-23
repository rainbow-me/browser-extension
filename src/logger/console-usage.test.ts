import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { describe, expect, it } from 'vitest';

describe('Console Usage Validation', () => {
  it('should not use console.log or console.error in production code', () => {
    // Use grep for efficient searching (same as CI)
    const command = `
      grep -r "console\\.(log|error)" \
        src/entries/popup \
        src/entries/background \
        src/entries/content \
        src/core \
        src/analytics \
        --include="*.ts" \
        --include="*.tsx" \
        --exclude="*.test.ts" \
        --exclude="*.spec.ts" \
        --exclude="*.test.tsx" \
        2>/dev/null || true
    `;

    let output = '';
    try {
      output = execSync(command, { encoding: 'utf8' });
    } catch {
      // grep returns non-zero when no matches, which is good
    }

    if (output) {
      // Filter out allowed files
      const allowedFiles = [
        'src/core/state/internal/signal.ts',
        'src/core/state/internal/createQueryStore.ts',
      ];

      const violations = output
        .split('\n')
        .filter(Boolean)
        .filter(
          (line) => !allowedFiles.some((allowed) => line.includes(allowed)),
        );

      if (violations.length > 0) {
        const sample = violations.slice(0, 5).join('\n');
        throw new Error(
          `Found console.log/error in production code:\n${sample}\n\nUse logger instead:\nimport { logger } from '~/logger';\nlogger.info('message');`,
        );
      }
    }
  });

  it('should have debug flags disabled', () => {
    // Check signal.ts
    const signalPath = path.join(
      'src',
      'core',
      'state',
      'internal',
      'signal.ts',
    );
    if (fs.existsSync(signalPath)) {
      const signalContent = fs.readFileSync(signalPath, 'utf8');
      expect(signalContent).toContain('const ENABLE_LOGS = false');
    }

    // Check createQueryStore.ts
    const queryStorePath = path.join(
      'src',
      'core',
      'state',
      'internal',
      'createQueryStore.ts',
    );
    if (fs.existsSync(queryStorePath)) {
      const queryStoreContent = fs.readFileSync(queryStorePath, 'utf8');
      expect(queryStoreContent).toContain('debugMode = false');
    }
  });
});
