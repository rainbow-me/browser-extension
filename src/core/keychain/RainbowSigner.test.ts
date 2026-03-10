import { getDefaultProvider } from '@ethersproject/providers';
import { getAddress, isHex, recoverMessageAddress } from 'viem';
import { expect, test } from 'vitest';

import { TEST_ADDRESS_1, TEST_PK_1 } from '~/test/utils';

import { RainbowSigner } from './RainbowSigner';

test('[RainbowSigner] should correctly sign hex-encoded 32-byte messages as raw bytes', async () => {
  // This is what dapps like Polymarket send via personal_sign - a 32-byte Safe transaction hash
  const safeTransactionHash =
    '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658';

  const provider = getDefaultProvider();
  const signer = new RainbowSigner(provider, TEST_PK_1, TEST_ADDRESS_1);

  const signature = await signer.signMessage(safeTransactionHash);

  expect(isHex(signature)).toBe(true);

  // The dapp recovers the signer using the RAW bytes interpretation
  // This is the ground truth - if this doesn't recover to our address, the signature is wrong
  const recoveredAddress = await recoverMessageAddress({
    message: { raw: safeTransactionHash },
    signature,
  });

  expect(getAddress(recoveredAddress)).eq(getAddress(TEST_ADDRESS_1));
});

test('[RainbowSigner] should correctly sign plain text messages as UTF-8', async () => {
  const textMessage = 'Hello, World!';

  const provider = getDefaultProvider();
  const signer = new RainbowSigner(provider, TEST_PK_1, TEST_ADDRESS_1);

  const signature = await signer.signMessage(textMessage);

  expect(isHex(signature)).toBe(true);

  // For text messages, recover with plain string (UTF-8 encoding)
  const recoveredAddress = await recoverMessageAddress({
    message: textMessage,
    signature,
  });

  expect(getAddress(recoveredAddress)).eq(getAddress(TEST_ADDRESS_1));
});

test('[RainbowSigner] should produce different signatures for hex-as-bytes vs hex-as-text', async () => {
  // This test makes the bug crystal clear
  const hexMsg = '0xdeadbeef';

  const provider = getDefaultProvider();
  const signer = new RainbowSigner(provider, TEST_PK_1, TEST_ADDRESS_1);

  // Sign using RainbowSigner (should use raw bytes for hex)
  const signature = await signer.signMessage(hexMsg);

  // The correct signature for raw bytes should recover using { raw: ... }
  const recoveredAsRaw = await recoverMessageAddress({
    message: { raw: hexMsg },
    signature,
  });

  // If RainbowSigner's behavior is correct (treats hex as raw bytes), this should match
  expect(getAddress(recoveredAsRaw)).eq(getAddress(TEST_ADDRESS_1));
});
