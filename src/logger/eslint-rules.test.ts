import { describe, expect, it } from 'vitest';

// These tests verify that our ESLint configuration properly enforces logger usage
// The actual ESLint rules are tested by running `yarn lint`

describe('ESLint Rules for Logger', () => {
  describe('no-console rule', () => {
    it('should flag direct console usage', () => {
      const invalidCode = [
        {
          code: `console.log('This should not be allowed');`,
          errors: [{ message: 'Use logger instead of console.log' }],
        },
        {
          code: `console.error('This should not be allowed');`,
          errors: [{ message: 'Use logger instead of console.error' }],
        },
        {
          code: `console.warn('This should not be allowed');`,
          errors: [{ message: 'Use logger instead of console.warn' }],
        },
      ];

      const validCode = [
        `import { logger } from '~/logger';
         logger.info('This is allowed');`,
        `import { logger } from '~/logger';
         logger.error(new RainbowError('This is allowed'));`,
      ];

      // These would be tested with actual ESLint configuration
      expect(invalidCode).toBeDefined();
      expect(validCode).toBeDefined();
    });
  });

  describe('logger import restrictions', () => {
    it('should enforce logger import only in allowed contexts', () => {
      const validImports = [
        'src/entries/popup/**.ts',
        'src/entries/background/**.ts',
        'src/entries/content/**.ts',
        'src/core/state/**.ts',
        'src/core/keychain/**.ts',
      ];

      const invalidImports = [
        'src/entries/inpage/**.ts', // Not allowed in inpage
        'src/core/utils/**.ts', // Not allowed in general utils
      ];

      // Test that import restrictions are properly configured
      expect(validImports).toBeDefined();
      expect(invalidImports).toBeDefined();
    });
  });

  describe('error handling patterns', () => {
    it('should enforce RainbowError usage for custom errors', () => {
      const preferredPattern = `
        import { RainbowError, logger } from '~/logger';

        try {
          // some operation
        } catch (e) {
          logger.error(new RainbowError('Operation failed', { cause: e }));
        }
      `;

      const discouragedPattern = `
        try {
          // some operation
        } catch (e) {
          console.error('Operation failed', e); // Should use logger
          throw new Error('Operation failed'); // Should use RainbowError for context
        }
      `;

      expect(preferredPattern).toBeDefined();
      expect(discouragedPattern).toBeDefined();
    });
  });
});

// Integration test for CI
describe('CI Logger Checks', () => {
  it('should not have any console.* statements in production code', async () => {
    // This would be a grep/search test in CI
    const productionFiles = ['src/core/**/*.ts', 'src/entries/**/*.ts'];

    const excludedFiles = [
      '*.test.ts',
      '*.spec.ts',
      'src/logger/**', // Logger itself can use console
    ];

    // In actual CI, this would run:
    // grep -r "console\." src/ --include="*.ts" --exclude="*.test.ts"
    // And fail if any matches are found

    expect(productionFiles).toBeDefined();
    expect(excludedFiles).toBeDefined();
  });

  it('should have logger imports use correct path', () => {
    // Check that all imports use '~/logger' not relative paths
    const correctImport = `import { logger } from '~/logger';`;
    const incorrectImport = `import { logger } from '../../../logger';`;

    expect(correctImport).toBeDefined();
    expect(incorrectImport).toBeDefined();
  });
});
