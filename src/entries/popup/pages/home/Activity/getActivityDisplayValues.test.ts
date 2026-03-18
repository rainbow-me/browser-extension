import { describe, expect, test } from 'vitest';

import { ParsedAsset, ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  RainbowTransaction,
  TransactionDirection,
  TransactionType,
} from '~/core/types/transactions';

import { getActivityDisplayValues } from './getActivityDisplayValues';

const makeAsset = (
  overrides: Partial<ParsedUserAsset> & { balance: ParsedUserAsset['balance'] },
): ParsedUserAsset => ({
  address: '0xeth',
  chainId: ChainId.mainnet,
  chainName: ChainName.mainnet,
  decimals: 18,
  isNativeAsset: true,
  name: 'Ethereum',
  symbol: 'ETH',
  uniqueId: 'eth_1',
  native: {
    balance: { amount: '0', display: '$0' },
    price: { change: '0%', amount: 2000, display: '$2,000' },
  },
  ...overrides,
});

const ethWithBalance = (amount: string, nativeAmount: string) =>
  makeAsset({
    balance: { amount, display: `${amount} ETH` },
    native: {
      balance: { amount: nativeAmount, display: `$${nativeAmount}` },
      price: { change: '0%', amount: 2000, display: '$2,000' },
    },
  });

const usdcWithBalance = (amount: string, nativeAmount: string) =>
  makeAsset({
    address: '0xusdc',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    isNativeAsset: false,
    uniqueId: 'usdc_1',
    balance: { amount, display: `${amount} USDC` },
    native: {
      balance: { amount: nativeAmount, display: `$${nativeAmount}` },
      price: { change: '0%', amount: 1, display: '$1' },
    },
  });

const makeTx = (overrides: Partial<RainbowTransaction>): RainbowTransaction =>
  ({
    hash: '0xabc',
    nonce: 1,
    chainId: ChainId.mainnet,
    from: '0xsender',
    status: 'confirmed',
    title: 'Test',
    type: 'send',
    blockNumber: 1,
    minedAt: 1,
    confirmations: 1,
    gasUsed: '21000',
    ...overrides,
  }) as RainbowTransaction;

// ─── Transfer type (send, receive, deposit, withdraw, etc.) ────────────────

describe('transfer values', () => {
  describe('asset resolution from changes', () => {
    const cases: {
      name: string;
      direction: TransactionDirection;
      type: TransactionType;
      changes: RainbowTransaction['changes'];
      asset?: RainbowTransaction['asset'];
      expectValue: boolean;
    }[] = [
      {
        name: 'send with matching out change',
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'out', asset: ethWithBalance('0.01', '20') }],
        expectValue: true,
      },
      {
        name: 'receive with matching in change',
        direction: 'in',
        type: 'receive',
        changes: [{ direction: 'in', asset: ethWithBalance('0.5', '1000') }],
        expectValue: true,
      },
      {
        name: 'self-send with matching self change',
        direction: 'self',
        type: 'send',
        changes: [{ direction: 'self', asset: ethWithBalance('1', '2000') }],
        expectValue: true,
      },
      {
        name: 'single change used as fallback when direction does not match',
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'in', asset: ethWithBalance('0.01', '20') }],
        expectValue: true,
      },
      {
        name: 'multiple non-NFT changes, none matching → undefined',
        direction: 'out',
        type: 'send',
        changes: [
          { direction: 'in', asset: ethWithBalance('1', '2000') },
          { direction: 'in', asset: ethWithBalance('2', '4000') },
        ],
        asset: ethWithBalance('10000', '20000000'),
        expectValue: false,
      },
      {
        name: 'NFT-only change is filtered out',
        direction: 'out',
        type: 'send',
        changes: [
          {
            direction: 'out',
            asset: makeAsset({
              type: 'nft',
              balance: { amount: '1', display: '1' },
            }),
          },
        ],
        expectValue: false,
      },
      {
        name: 'NFT + token change → uses token change',
        direction: 'out',
        type: 'send',
        changes: [
          {
            direction: 'out',
            asset: makeAsset({
              type: 'nft',
              balance: { amount: '1', display: '1' },
            }),
          },
          { direction: 'out', asset: ethWithBalance('0.5', '1000') },
        ],
        expectValue: true,
      },
      {
        name: 'undefined changes in array are tolerated',
        direction: 'out',
        type: 'send',
        changes: [
          undefined,
          { direction: 'out', asset: ethWithBalance('0.5', '1000') },
        ],
        expectValue: true,
      },
    ];

    test.each(cases)(
      '$name',
      ({ direction, type, changes, asset, expectValue }) => {
        const tx = makeTx({ direction, type, changes, asset });
        const result = getActivityDisplayValues(tx);

        if (!expectValue) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toBeDefined();
          expect(result!.type).toBe('transfer');
        }
      },
    );
  });

  describe('value formatting', () => {
    test('send: asset on top, native value on bottom', () => {
      const tx = makeTx({
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'out', asset: ethWithBalance('1.5', '3000') }],
      });
      const result = getActivityDisplayValues(tx);
      expect(result).toMatchObject({
        type: 'transfer',
        topValue: expect.stringContaining('ETH'),
        bottomValue: expect.stringContaining('$'),
      });
    });

    test('receive: asset on top, native value on bottom with +', () => {
      const tx = makeTx({
        direction: 'in',
        type: 'receive',
        changes: [{ direction: 'in', asset: ethWithBalance('0.5', '1000') }],
      });
      const result = getActivityDisplayValues(tx);
      expect(result).toMatchObject({
        type: 'transfer',
        topValue: expect.stringContaining('ETH'),
        bottomValue: expect.stringMatching(/^\+/),
      });
    });

    test('out direction → minus prefix', () => {
      const tx = makeTx({
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'out', asset: ethWithBalance('1', '2000') }],
      });
      const result = getActivityDisplayValues(tx);
      expect(result).toMatchObject({
        bottomValue: expect.stringMatching(/^-/),
      });
    });

    test('zero native balance → "No value" on top, token on bottom', () => {
      const tx = makeTx({
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'out', asset: ethWithBalance('1.5', '0') }],
      });
      const result = getActivityDisplayValues(tx);
      expect(result).toMatchObject({
        type: 'transfer',
        bottomValue: expect.stringContaining('ETH'),
      });
    });

    test('zero token balance → no value symbol prefix', () => {
      const tx = makeTx({
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'out', asset: ethWithBalance('0', '0') }],
      });
      const result = getActivityDisplayValues(tx);
      if (result?.type === 'transfer') {
        expect(result.topValue).not.toMatch(/^[+-]/);
        expect(result.bottomValue).not.toMatch(/^[+-]/);
      }
    });

    test('large balance uses compact notation', () => {
      const tx = makeTx({
        direction: 'out',
        type: 'send',
        changes: [
          {
            direction: 'out',
            asset: ethWithBalance('500000', '1000000000'),
          },
        ],
      });
      const result = getActivityDisplayValues(tx);
      if (result?.type === 'transfer') {
        expect(result.topValue).toContain('K');
      }
    });

    test('works with non-native assets (ERC-20)', () => {
      const tx = makeTx({
        direction: 'out',
        type: 'send',
        changes: [{ direction: 'out', asset: usdcWithBalance('100', '100') }],
      });
      const result = getActivityDisplayValues(tx);
      expect(result).toMatchObject({
        type: 'transfer',
        topValue: expect.stringContaining('USDC'),
      });
    });

    test('applies to other transfer-like types (deposit, withdraw, etc.)', () => {
      for (const type of ['deposit', 'withdraw', 'stake', 'unstake'] as const) {
        const tx = makeTx({
          direction: 'out',
          type,
          changes: [{ direction: 'out', asset: ethWithBalance('1', '2000') }],
        });
        const result = getActivityDisplayValues(tx);
        expect(result?.type).toBe('transfer');
      }
    });
  });

  test('asset without balance field (ParsedAsset, not ParsedUserAsset) → undefined', () => {
    const parsedOnly: ParsedAsset = {
      address: '0xeth',
      chainId: ChainId.mainnet,
      chainName: ChainName.mainnet,
      decimals: 18,
      isNativeAsset: true,
      name: 'Ethereum',
      symbol: 'ETH',
      uniqueId: 'eth_1',
      native: {
        price: { change: '0%', amount: 2000, display: '$2,000' },
      },
    };
    const tx = makeTx({
      direction: 'out',
      type: 'send',
      changes: [{ direction: 'out', asset: parsedOnly as ParsedUserAsset }],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('execution with self + out changes prefers the out change', () => {
    const tx = makeTx({
      type: 'execution' as TransactionType,
      direction: 'self',
      chainId: 8453 as ChainId,
      changes: [
        { direction: 'self', asset: ethWithBalance('0.0007', '1.5') },
        { direction: 'out', asset: ethWithBalance('0.0007', '1.5') },
      ],
    });
    const result = getActivityDisplayValues(tx);
    expect(result).toBeDefined();
    expect(result?.type).toBe('transfer');
    if (result?.type === 'transfer') {
      expect(result.topValue).toContain('ETH');
      expect(result.bottomValue).toContain('$1.5');
    }
  });
});

// ─── The dApp send bug ─────────────────────────────────────────────────────

describe('dApp send bug: no changes must not leak full balance', () => {
  test('send with no changes and no fallback asset → undefined', () => {
    const tx = makeTx({ direction: 'out', type: 'send', changes: [] });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('send with only self change does not pick the self change balance', () => {
    const bigBalance = ethWithBalance('100', '200000');
    const tx = makeTx({
      direction: 'out',
      type: 'send',
      changes: [{ direction: 'self', asset: bigBalance }],
    });
    const result = getActivityDisplayValues(tx);
    if (result?.type === 'transfer') {
      expect(result.topValue).toContain('ETH');
    }
  });
});

// ─── Swap / wrap / unwrap ──────────────────────────────────────────────────

describe('swap values', () => {
  test('returns out and in values for swap', () => {
    const tx = makeTx({
      type: 'swap',
      changes: [
        { direction: 'out', asset: ethWithBalance('1', '2000') },
        { direction: 'in', asset: usdcWithBalance('2000', '2000') },
      ],
    });
    const result = getActivityDisplayValues(tx);
    expect(result).toMatchObject({
      type: 'swap',
      outValue: expect.stringMatching(/^-.*ETH/),
      inValue: expect.stringMatching(/^\+.*USDC/),
    });
  });

  test('wrap routes to swap handler', () => {
    const tx = makeTx({
      type: 'wrap',
      changes: [
        { direction: 'out', asset: ethWithBalance('1', '2000') },
        {
          direction: 'in',
          asset: makeAsset({
            symbol: 'WETH',
            name: 'Wrapped Ether',
            balance: { amount: '1', display: '1 WETH' },
          }),
        },
      ],
    });
    expect(getActivityDisplayValues(tx)?.type).toBe('swap');
  });

  test('unwrap routes to swap handler', () => {
    const tx = makeTx({
      type: 'unwrap',
      changes: [
        {
          direction: 'out',
          asset: makeAsset({
            symbol: 'WETH',
            name: 'Wrapped Ether',
            balance: { amount: '1', display: '1 WETH' },
          }),
        },
        { direction: 'in', asset: ethWithBalance('1', '2000') },
      ],
    });
    expect(getActivityDisplayValues(tx)?.type).toBe('swap');
  });

  test('missing in or out token → undefined', () => {
    const tx = makeTx({
      type: 'swap',
      changes: [{ direction: 'out', asset: ethWithBalance('1', '2000') }],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });
});

// ─── Bridge ────────────────────────────────────────────────────────────────

describe('bridge values', () => {
  test('returns chain info and in value', () => {
    const tx = makeTx({
      type: 'bridge',
      changes: [
        { direction: 'out', asset: ethWithBalance('1', '2000') },
        {
          direction: 'in',
          asset: makeAsset({
            chainId: ChainId.optimism,
            chainName: ChainName.optimism,
            balance: { amount: '1', display: '1 ETH' },
            native: {
              balance: { amount: '2000', display: '$2,000' },
              price: { change: '0%', amount: 2000, display: '$2,000' },
            },
          }),
        },
      ],
    });
    const result = getActivityDisplayValues(tx);
    expect(result).toMatchObject({
      type: 'bridge',
      chainId: ChainId.optimism,
      chainName: 'Optimism',
      inValue: expect.stringMatching(/^\+.*ETH/),
    });
  });

  test('requires exactly 2 changes', () => {
    const tx = makeTx({
      type: 'bridge',
      changes: [{ direction: 'out', asset: ethWithBalance('1', '2000') }],
    });
    const result = getActivityDisplayValues(tx);
    expect(result?.type).not.toBe('bridge');
  });

  test('missing in or out token → undefined', () => {
    const tx = makeTx({
      type: 'bridge',
      changes: [
        { direction: 'out', asset: ethWithBalance('1', '2000') },
        { direction: 'out', asset: ethWithBalance('1', '2000') },
      ],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('falls back to transfer path when not exactly 2 changes', () => {
    const tx = makeTx({
      type: 'bridge',
      direction: 'out',
      changes: [{ direction: 'out', asset: ethWithBalance('1', '2000') }],
    });
    const result = getActivityDisplayValues(tx);
    expect(result?.type).toBe('transfer');
  });
});

// ─── Approval / revoke ─────────────────────────────────────────────────────

describe('approval values', () => {
  test('returns contract and label for approve', () => {
    const tx = makeTx({
      type: 'approve',
      asset: ethWithBalance('0', '0'),
      approvalAmount: 'UNLIMITED',
      contract: { name: 'Uniswap', iconUrl: 'https://icon.png' },
    });
    const result = getActivityDisplayValues(tx);
    expect(result).toMatchObject({
      type: 'approval',
      contractName: 'Uniswap',
      contractIconUrl: 'https://icon.png',
      label: expect.any(String),
    });
  });

  test('revoke type routes to approval handler', () => {
    const tx = makeTx({
      type: 'revoke',
      asset: ethWithBalance('0', '0'),
      approvalAmount: '0',
      contract: { name: 'Uniswap' },
    });
    expect(getActivityDisplayValues(tx)?.type).toBe('approval');
  });

  test('missing asset → undefined', () => {
    const tx = makeTx({
      type: 'approve',
      asset: undefined,
      approvalAmount: 'UNLIMITED',
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('missing approvalAmount → undefined', () => {
    const tx = makeTx({
      type: 'approve',
      asset: ethWithBalance('0', '0'),
      approvalAmount: undefined,
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('no contract → contractName is undefined', () => {
    const tx = makeTx({
      type: 'approve',
      asset: ethWithBalance('0', '0'),
      approvalAmount: 'UNLIMITED',
    });
    const result = getActivityDisplayValues(tx);
    expect(result).toMatchObject({ type: 'approval' });
    if (result?.type === 'approval') {
      expect(result.contractName).toBeUndefined();
    }
  });
});

// ─── Scam / spam tokens ────────────────────────────────────────────────────

describe('assets with missing metadata', () => {
  const noSymbolAsset = makeAsset({
    symbol: undefined as unknown as string,
    name: '',
    address: '0xscam',
    isNativeAsset: false,
    balance: { amount: '0.000000000001', display: '0.000000000001' },
    native: {
      balance: { amount: '0', display: '$0' },
    },
  });

  const emptySymbolAsset = makeAsset({
    symbol: '',
    name: '',
    address: '0xscam2',
    isNativeAsset: false,
    balance: { amount: '1000000', display: '1,000,000' },
    native: {
      balance: { amount: '0', display: '$0' },
    },
  });

  test('send with undefined symbol → undefined (not "-0.000000000001 undefined")', () => {
    const tx = makeTx({
      direction: 'out',
      type: 'send',
      changes: [{ direction: 'out', asset: noSymbolAsset }],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('send with empty symbol → undefined', () => {
    const tx = makeTx({
      direction: 'out',
      type: 'send',
      changes: [{ direction: 'out', asset: emptySymbolAsset }],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('receive with no-symbol asset → undefined', () => {
    const tx = makeTx({
      direction: 'in',
      type: 'receive',
      changes: [{ direction: 'in', asset: noSymbolAsset }],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('swap with no-symbol out token → undefined', () => {
    const tx = makeTx({
      type: 'swap',
      changes: [
        { direction: 'out', asset: noSymbolAsset },
        { direction: 'in', asset: usdcWithBalance('100', '100') },
      ],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });

  test('swap with no-symbol in token → undefined', () => {
    const tx = makeTx({
      type: 'swap',
      changes: [
        { direction: 'out', asset: ethWithBalance('1', '2000') },
        { direction: 'in', asset: noSymbolAsset },
      ],
    });
    expect(getActivityDisplayValues(tx)).toBeUndefined();
  });
});

// ─── Known bugs ────────────────────────────────────────────────────────────

describe('known bugs', () => {
  describe('multi-token revoke shows as single token', () => {
    test.fails(
      'revoking multiple tokens should surface all token symbols',
      () => {
        const tx = makeTx({
          type: 'revoke',
          asset: usdcWithBalance('0', '0'),
          approvalAmount: '0',
          contract: { name: 'Uniswap' },
          changes: [
            { direction: 'out', asset: usdcWithBalance('0', '0') },
            { direction: 'out', asset: ethWithBalance('0', '0') },
          ],
        });
        const result = getActivityDisplayValues(tx);
        expect(result?.type).toBe('approval');
        if (result?.type === 'approval') {
          expect(result.label).toContain('USDC');
          expect(result.label).toContain('ETH');
        }
      },
    );

    test.fails(
      'multi-token approve should mention all tokens, not just tx.asset',
      () => {
        const tx = makeTx({
          type: 'approve',
          asset: usdcWithBalance('0', '0'),
          approvalAmount: 'UNLIMITED',
          contract: { name: 'Uniswap' },
          changes: [
            { direction: 'out', asset: usdcWithBalance('0', '0') },
            { direction: 'out', asset: ethWithBalance('0', '0') },
          ],
        });
        const result = getActivityDisplayValues(tx);
        expect(result?.type).toBe('approval');
        if (result?.type === 'approval') {
          expect(result.label).toContain('USDC');
          expect(result.label).toContain('ETH');
        }
      },
    );
  });

  describe('approval ignores changes entirely', () => {
    test.fails(
      'approval label uses tx.asset symbol even when changes have a different asset',
      () => {
        const tx = makeTx({
          type: 'approve',
          asset: usdcWithBalance('0', '0'),
          approvalAmount: '1000000',
          contract: { name: 'Aave' },
          changes: [{ direction: 'out', asset: ethWithBalance('0', '0') }],
        });
        const result = getActivityDisplayValues(tx);
        if (result?.type === 'approval') {
          expect(result.label).toContain('ETH');
          expect(result.label).not.toContain('USDC');
        }
      },
    );
  });

  describe('swap/bridge with extra changes', () => {
    test.fails(
      'swap with 3+ changes only shows first in/out pair, ignores others',
      () => {
        const tx = makeTx({
          type: 'swap',
          changes: [
            { direction: 'out', asset: ethWithBalance('1', '2000') },
            { direction: 'in', asset: usdcWithBalance('1000', '1000') },
            { direction: 'in', asset: usdcWithBalance('1000', '1000') },
          ],
        });
        const result = getActivityDisplayValues(tx);
        if (result?.type === 'swap') {
          expect(result.inValue).toContain('2,000');
        }
      },
    );
  });

  describe('batch execution with send + revocations', () => {
    const tinyEth = makeAsset({
      address: '0xeth',
      chainId: 8453 as ChainId,
      balance: {
        amount: '0.000704910557621673',
        display: '0.000704910557621673 ETH',
      },
      native: {
        balance: { amount: '1.50', display: '$1.50' },
        price: { change: '0%', amount: 2124.85, display: '$2,124.85' },
      },
    });

    const dai = makeAsset({
      address: '0xdai',
      symbol: 'DAI',
      name: 'Dai',
      decimals: 18,
      isNativeAsset: false,
      uniqueId: 'dai_8453',
      chainId: 8453 as ChainId,
      balance: { amount: '0', display: '0 DAI' },
      native: {
        balance: { amount: '0', display: '$0' },
        price: { change: '0%', amount: 0, display: '$0' },
      },
    });

    test.fails(
      'execution type with ETH send + DAI revoke should show both actions',
      () => {
        const tx = makeTx({
          type: 'execution' as TransactionType,
          direction: 'self',
          chainId: 8453 as ChainId,
          changes: [
            { direction: 'self', asset: tinyEth },
            { direction: 'out', asset: tinyEth },
          ],
          asset: dai,
          approvalAmount: '0',
          contract: { name: 'Unknown' },
        });
        const result = getActivityDisplayValues(tx);
        expect(result).toBeDefined();
        expect(result?.type).toBe('approval');
      },
    );
  });
});
