import { expect, test } from 'vitest';

import { maskInput } from './utils';

test('should mask simple inputs', async () => {
  const masked1 = maskInput({ inputValue: '' });
  expect(masked1).toBe('');
  const masked2 = maskInput({ inputValue: '0' });
  expect(masked2).toBe('0');
  const masked3 = maskInput({ inputValue: '.' });
  expect(masked3).toBe('0.');
  const masked4 = maskInput({ inputValue: '09' });
  expect(masked4).toBe('9');
});

test('should mask invalid inputs', async () => {
  const masked1 = maskInput({ inputValue: '1i' });
  expect(masked1).toBe('1');
  const masked2 = maskInput({ inputValue: '-1' });
  expect(masked2).toBe('1');
  const masked3 = maskInput({ inputValue: '-o' });
  expect(masked3).toBe('');
});

test('should mask valid inputs with decimals', async () => {
  const masked1 = maskInput({ inputValue: '0.1', decimals: 18 });
  expect(masked1).toBe('0.1');
  const masked2 = maskInput({ inputValue: '0.123456789', decimals: 6 });
  expect(masked2).toBe('0.123456');
  const masked3 = maskInput({ inputValue: '123456789', decimals: 6 });
  expect(masked3).toBe('123456789');
});
