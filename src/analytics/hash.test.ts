import { Hex } from 'viem';
import { describe, expect, it } from 'vitest';

import { hmacSha256 } from './hash';

const SECURE_WALLET_HASH_KEY = process.env.SECURE_WALLET_HASH_KEY as Hex;

const matrix: Array<{ input: [Hex, Hex]; expected: Hex }> = [
  {
    input: [
      SECURE_WALLET_HASH_KEY,
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    ],
    expected:
      '0x1995969460753920073f48653cded8c7ad5af451fb351ee277b0d192514705b6',
  },
  {
    input: [
      SECURE_WALLET_HASH_KEY,
      '0x894c49Ec8B9cf64d1D89D517DB5D356ed3743133',
    ],
    expected:
      '0x066701a856e9fcc08001432c3482c3a8ab7557308d74bf433cde33a4dc51b403',
  },
  {
    input: [
      SECURE_WALLET_HASH_KEY,
      '0x6312116C18156013063680e6CC183C460Df8e035',
    ],
    expected:
      '0x62ad8f4df2fc3910da68856ef6825ed58ce1132d69cbb951b6dedfd9d726ebaa',
  },
];

describe('hmacSha256', () => {
  matrix.forEach(({ input: [a, b], expected }) => {
    it(`should hash ${a} + ${b} to ${expected}`, () => {
      expect(hmacSha256(a, b)).toBe(expected);
    });
  });
});
