import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber';
import { arrayify } from '@ethersproject/bytes';
import BigNumber from 'bignumber.js';
import { describe, expect, test } from 'vitest';

import {
  addHexPrefix,
  convertStringToHex,
  isHexStringIgnorePrefix,
  toHex,
  toHexNoLeadingZeros,
  toHexOrUndefined,
} from '../hex';

describe('hex', () => {
  describe('isHexStringIgnorePrefix', () => {
    test('should return true for valid hex strings with 0x prefix', () => {
      expect(isHexStringIgnorePrefix('0x123456')).toBe(true);
      expect(isHexStringIgnorePrefix('0xabcdef')).toBe(true);
      expect(isHexStringIgnorePrefix('0xABCDEF')).toBe(true);
      expect(isHexStringIgnorePrefix('0x000000')).toBe(true);
    });

    test('should return true for valid hex strings without 0x prefix', () => {
      expect(isHexStringIgnorePrefix('123456')).toBe(true);
      expect(isHexStringIgnorePrefix('abcdef')).toBe(true);
      expect(isHexStringIgnorePrefix('ABCDEF')).toBe(true);
      expect(isHexStringIgnorePrefix('000000')).toBe(true);
    });

    test('should return false for invalid hex strings', () => {
      expect(isHexStringIgnorePrefix('0x12345g')).toBe(false);
      expect(isHexStringIgnorePrefix('12345g')).toBe(false);
      expect(isHexStringIgnorePrefix('not hex')).toBe(false);
    });

    test('should return false for empty or falsy values', () => {
      expect(isHexStringIgnorePrefix('')).toBe(false);
      expect(isHexStringIgnorePrefix(null as unknown as string)).toBe(false);
      expect(isHexStringIgnorePrefix(undefined as unknown as string)).toBe(
        false,
      );
    });

    test('should handle whitespace', () => {
      expect(isHexStringIgnorePrefix('  0x123456  ')).toBe(true);
      expect(isHexStringIgnorePrefix('  123456  ')).toBe(true);
    });

    test('should handle single 0x prefix', () => {
      // The implementation adds 0x prefix and then checks if it's a valid hex string
      // '0x' becomes '0x' (already has prefix) which is a valid hex string
      expect(isHexStringIgnorePrefix('0x')).toBe(true);
    });

    test('should handle whitespace-only strings', () => {
      // The implementation trims whitespace and then adds 0x prefix
      // '   ' becomes '0x' (empty string trimmed, then 0x added) which is a valid hex string
      expect(isHexStringIgnorePrefix('   ')).toBe(true);
    });
  });

  describe('addHexPrefix', () => {
    test('should add 0x prefix when not present', () => {
      expect(addHexPrefix('123456')).toBe('0x123456');
      expect(addHexPrefix('abcdef')).toBe('0xabcdef');
      expect(addHexPrefix('ABCDEF')).toBe('0xABCDEF');
    });

    test('should not add 0x prefix when already present', () => {
      expect(addHexPrefix('0x123456')).toBe('0x123456');
      expect(addHexPrefix('0xabcdef')).toBe('0xabcdef');
      expect(addHexPrefix('0xABCDEF')).toBe('0xABCDEF');
    });

    test('should handle empty string', () => {
      expect(addHexPrefix('')).toBe('0x');
    });
  });

  describe('convertStringToHex', () => {
    test('should convert bigint to hex string', () => {
      expect(convertStringToHex(BigInt(123))).toBe('7b');
      expect(convertStringToHex(BigInt(0))).toBe('0');
      expect(convertStringToHex(BigInt(255))).toBe('ff');
    });

    test('should convert EthersBigNumber to hex string', () => {
      expect(convertStringToHex(EthersBigNumber.from(123))).toBe('0x7b');
      expect(convertStringToHex(EthersBigNumber.from(0))).toBe('0x00');
      expect(convertStringToHex(EthersBigNumber.from(255))).toBe('0xff');
    });

    test('should convert Bytes to hex string', () => {
      const bytes = arrayify('0x123456');
      expect(convertStringToHex(bytes)).toBe('0x123456');
    });

    test('should convert number to hex string', () => {
      expect(convertStringToHex(123)).toBe('7b');
      expect(convertStringToHex(0)).toBe('0');
      expect(convertStringToHex(255)).toBe('ff');
    });

    test('should convert string number to hex string', () => {
      expect(convertStringToHex('123')).toBe('7b');
      expect(convertStringToHex('0')).toBe('0');
      expect(convertStringToHex('255')).toBe('ff');
    });

    test('should convert BigNumber (bignumber.js) to hex string', () => {
      expect(convertStringToHex(new BigNumber(123))).toBe('7b');
      expect(convertStringToHex(new BigNumber(0))).toBe('0');
      expect(convertStringToHex(new BigNumber(255))).toBe('ff');
    });

    test('should throw error for invalid number', () => {
      expect(() => convertStringToHex('invalid')).toThrow(
        'Invalid number invalid',
      );
      expect(() => convertStringToHex('not-a-number')).toThrow(
        'Invalid number not-a-number',
      );
    });
  });

  describe('toHex', () => {
    test('should convert values to hex with 0x prefix', () => {
      expect(toHex(123)).toBe('0x7b');
      expect(toHex('123')).toBe('0x7b');
      expect(toHex(BigInt(123))).toBe('0x7b');
      expect(toHex(EthersBigNumber.from(123))).toBe('0x7b');
      expect(toHex(new BigNumber(123))).toBe('0x7b');
    });

    test('should handle zero values', () => {
      expect(toHex(0)).toBe('0x0');
      expect(toHex('0')).toBe('0x0');
      expect(toHex(BigInt(0))).toBe('0x0');
      expect(toHex(EthersBigNumber.from(0))).toBe('0x00');
      expect(toHex(new BigNumber(0))).toBe('0x0');
    });

    test('should handle large numbers', () => {
      expect(toHex(1000000)).toBe('0xf4240');
      expect(toHex('1000000')).toBe('0xf4240');
    });
  });

  describe('toHexOrUndefined', () => {
    test('should return hex string for valid values', () => {
      expect(toHexOrUndefined(123)).toBe('0x7b');
      expect(toHexOrUndefined('123')).toBe('0x7b');
      expect(toHexOrUndefined(BigInt(123))).toBe('0x7b');
    });

    test('should return undefined for null and undefined', () => {
      expect(toHexOrUndefined(null)).toBeUndefined();
      expect(toHexOrUndefined(undefined)).toBeUndefined();
    });

    test('should handle zero values', () => {
      expect(toHexOrUndefined(0)).toBe('0x0');
      expect(toHexOrUndefined('0')).toBe('0x0');
    });
  });

  describe('toHexNoLeadingZeros', () => {
    test('should remove leading zeros from hex string', () => {
      expect(toHexNoLeadingZeros('0x000000123')).toBe('0x123');
      expect(toHexNoLeadingZeros('0x00123456')).toBe('0x123456');
    });

    test('should handle hex strings without leading zeros', () => {
      expect(toHexNoLeadingZeros('0x123')).toBe('0x123');
      expect(toHexNoLeadingZeros('0xabcdef')).toBe('0xabcdef');
    });

    test('should handle single zero', () => {
      expect(toHexNoLeadingZeros('0x0')).toBe('0x');
    });

    test('should handle multiple zeros', () => {
      expect(toHexNoLeadingZeros('0x000000000')).toBe('0x');
    });

    test('should handle empty hex string', () => {
      // This will throw an error because toHex('0x') tries to convert '0x' to a number
      expect(() => toHexNoLeadingZeros('0x')).toThrow('Invalid number 0x');
    });
  });
});
