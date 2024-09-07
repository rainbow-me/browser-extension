import { describe, expect, test } from 'vitest';

import { isExceedingMaxCharacters, truncateNumber } from '../numbers';

describe('numbers', () => {
  describe('truncateNumber', () => {
    test('should return maximum 10 characters from amount', () => {
      const numbers = [
        {
          input: 123456789.1234567,
          output: '123456789.1',
        },
        {
          input: 123456.123456789,
          output: '123456.1234',
        },
        {
          input: 1.111111111111111,
          output: '1.111111111',
        },
        {
          input: 33.33333333333333,
          output: '33.33333333',
        },
        {
          input: 10000000000000000,
          output: '1000000000',
        },
        {
          input: 9000000000000000000,
          output: '9000000000',
        },
      ];

      for (const { input, output } of numbers) {
        // Check both number and string number
        expect(truncateNumber(input)).toBe(output);
        expect(truncateNumber(input.toString())).toBe(output);
      }
    });

    test('should return existing number if not exceeding 10 character limit', () => {
      const numbers = [
        {
          input: 33.33,
          output: '33.33',
        },
        {
          input: 20.22,
          output: '20.22',
        },
        {
          input: 45555.9999,
          output: '45555.9999',
        },
        {
          input: 2000.0,
          output: '2000',
        },
        {
          input: 3999.999,
          output: '3999.999',
        },
        {
          input: 123456789.123,
          output: '123456789.1',
        },
      ];

      for (const { input, output } of numbers) {
        // Check both number and string number
        expect(truncateNumber(input)).toBe(output);
        expect(truncateNumber(input.toString())).toBe(output);
      }
    });

    test('should handle decimal points', () => {
      expect(truncateNumber('33.')).toBe('33.');
      expect(truncateNumber('333.333')).toBe('333.333');
      expect(truncateNumber('.')).toBe('0.');
    });

    test('should handle empty string', () => {
      expect(truncateNumber('')).toBe('');
    });
  });

  describe('isExceedingMaxCharacters', () => {
    test('should return false if max characters exceeded', () => {
      const MAX_CHARS = 5;

      expect(isExceedingMaxCharacters('1.123', MAX_CHARS)).toBe(false);
      expect(isExceedingMaxCharacters('12.12', MAX_CHARS)).toBe(false);
      expect(isExceedingMaxCharacters('123.1', MAX_CHARS)).toBe(false);
    });

    test('should return true if max characters exceeded', () => {
      const MAX_CHARS = 6;

      expect(isExceedingMaxCharacters('123.4567', MAX_CHARS)).toBe(true);
      expect(isExceedingMaxCharacters('1234567', MAX_CHARS)).toBe(true);
      expect(isExceedingMaxCharacters('12345.67', MAX_CHARS)).toBe(true);
    });
  });
});
