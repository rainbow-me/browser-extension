import { bytesToHex } from 'viem';
import { expect, test } from 'vitest';

import { joinSignature, personalSignMessageBytes } from './hex';

// Valid 32-byte (64 hex char) test values
const validR =
  'd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042';
const validS =
  '24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354';

test('[utils/hex -> joinSignature] :: should join r, s, v strings without 0x prefix', () => {
  const sig = { r: validR, s: validS, v: '1b' };
  expect(joinSignature(sig)).toBe(`0x${validR}${validS}1b`);
});

test('[utils/hex -> joinSignature] :: should join r, s, v strings with 0x prefix', () => {
  const sig = { r: `0x${validR}`, s: `0x${validS}`, v: '0x1b' };
  expect(joinSignature(sig)).toBe(`0x${validR}${validS}1b`);
});

test('[utils/hex -> joinSignature] :: should handle v as number', () => {
  const sig = { r: `0x${validR}`, s: `0x${validS}`, v: 27 };
  expect(joinSignature(sig)).toBe(`0x${validR}${validS}1b`);
});

test('[utils/hex -> joinSignature] :: should pad single digit v to two chars', () => {
  const sig = { r: `0x${validR}`, s: `0x${validS}`, v: 0 };
  expect(joinSignature(sig)).toBe(`0x${validR}${validS}00`);
});

test('[utils/hex -> joinSignature] :: should pad single char v string to two chars', () => {
  const sig = { r: `0x${validR}`, s: `0x${validS}`, v: 'a' };
  expect(joinSignature(sig)).toBe(`0x${validR}${validS}0a`);
});

test('[utils/hex -> joinSignature] :: should handle real Ledger signature format', () => {
  const sig = {
    r: '0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c042',
    s: '0x24e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b354',
    v: 28,
  };
  expect(joinSignature(sig)).toBe(
    '0xd693b532a80fed6392b428604171fb32fdbf953728a3a7ecc7d4062b1652c04224e9c602ac800b983b035700a14b23f78a253ab762deab5dc27e3555a750b3541c',
  );
});

test('[utils/hex -> joinSignature] :: should throw on empty r', () => {
  const sig = { r: '', s: validS, v: 27 };
  expect(() => joinSignature(sig)).toThrow('r and s are required');
});

test('[utils/hex -> joinSignature] :: should throw on empty s', () => {
  const sig = { r: validR, s: '', v: 27 };
  expect(() => joinSignature(sig)).toThrow('r and s are required');
});

test('[utils/hex -> joinSignature] :: should throw on invalid r length', () => {
  const sig = { r: 'aabbccdd', s: validS, v: 27 };
  expect(() => joinSignature(sig)).toThrow('r and s must be 32 bytes');
});

test('[utils/hex -> joinSignature] :: should throw on invalid s length', () => {
  const sig = { r: validR, s: '11223344', v: 27 };
  expect(() => joinSignature(sig)).toThrow('r and s must be 32 bytes');
});

test('[utils/hex -> joinSignature] :: should throw on non-hex r value', () => {
  const invalidR = 'ghijklmnopqrstuvwxyz'.repeat(3) + 'abcd'; // 64 chars but invalid hex
  const sig = { r: invalidR, s: validS, v: 27 };
  expect(() => joinSignature(sig)).toThrow('must be valid hex strings');
});

test('[utils/hex -> joinSignature] :: should throw on non-hex s value', () => {
  const invalidS = 'xyz!@#$%'.repeat(8); // 64 chars but invalid hex
  const sig = { r: validR, s: invalidS, v: 27 };
  expect(() => joinSignature(sig)).toThrow('must be valid hex strings');
});

test('[utils/hex -> joinSignature] :: should throw on non-hex v string', () => {
  const sig = { r: validR, s: validS, v: 'zz' };
  expect(() => joinSignature(sig)).toThrow('v must be a valid hex string');
});

// #2285: the Ledger path signed a hex personal_sign message as its UTF-8 text.
test('[utils/hex -> personalSignMessageBytes] :: a 0x hex string is raw bytes', () => {
  const safeTransactionHash =
    '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658';
  const bytes = personalSignMessageBytes(safeTransactionHash);
  expect(bytes.length).toBe(32);
  expect(bytesToHex(bytes)).toBe(safeTransactionHash);
});

test('[utils/hex -> personalSignMessageBytes] :: plain text is UTF-8', () => {
  expect(bytesToHex(personalSignMessageBytes('Hello'))).toBe('0x48656c6c6f');
  expect(personalSignMessageBytes('Sign in to example.com').length).toBe(22);
});

test('[utils/hex -> personalSignMessageBytes] :: hex without 0x stays text', () => {
  // Same rule as RainbowSigner: only a 0x-prefixed string is hex.
  expect(bytesToHex(personalSignMessageBytes('deadbeef'))).toBe(
    '0x6465616462656566',
  );
});
