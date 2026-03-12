import { expect, test } from 'vitest';

import { getSigningRequestDisplayDetails } from './signMessages';

test('[getSigningRequestDisplayDetails] preserves short hex (0x80) for signing', () => {
  const result = getSigningRequestDisplayDetails({
    method: 'personal_sign',
    params: ['0x80', '0x0000000000000000000000000000000000000001'],
    meta: {},
  } as Parameters<typeof getSigningRequestDisplayDetails>[0]);

  expect(result.message).not.toBeNull();
  expect(result.message?.type).toBe('personal_sign');
  // Must preserve original hex for signing—not decode to UTF-8 replacement char
  expect(
    result.message?.type === 'personal_sign' && result.message.message,
  ).toBe('0x80');
});

test('[getSigningRequestDisplayDetails] preserves 32-byte hex for signing', () => {
  const hash =
    '0x7f8c9a80deadbeef1234567890abcdef1234567890abcdef1234567890abcdef';
  const result = getSigningRequestDisplayDetails({
    method: 'personal_sign',
    params: [hash, '0x0000000000000000000000000000000000000001'],
    meta: {},
  } as Parameters<typeof getSigningRequestDisplayDetails>[0]);

  expect(result.message).not.toBeNull();
  expect(
    result.message?.type === 'personal_sign' && result.message.message,
  ).toBe(hash);
});

test('[getSigningRequestDisplayDetails] decodes plain text for display', () => {
  const result = getSigningRequestDisplayDetails({
    method: 'personal_sign',
    params: ['hello world', '0x0000000000000000000000000000000000000001'],
    meta: {},
  } as Parameters<typeof getSigningRequestDisplayDetails>[0]);

  expect(result.message).not.toBeNull();
  expect(
    result.message?.type === 'personal_sign' && result.message.message,
  ).toBe('hello world');
});
