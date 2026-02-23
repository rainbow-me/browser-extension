import { describe, expect, test } from 'vitest';

import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';

import { isLegacyMeteorologyFeeData } from './classification';

// Minimal fixtures matching meteorology types
const legacyPayload = {
  fastGasPrice: '45',
  proposeGasPrice: '38',
  safeGasPrice: '32',
};

const eip1559Payload = {
  baseFeeSuggestion: '30000000000',
  baseFeeTrend: 0,
  blocksToConfirmationByBaseFee: {
    '4': '1',
    '8': '1',
    '40': '1',
    '120': '1',
    '240': '1',
  },
  blocksToConfirmationByPriorityFee: { '1': '1', '2': '1', '3': '1', '4': '1' },
  currentBaseFee: '30000000000',
  maxPriorityFeeSuggestions: { fast: '2', normal: '1', urgent: '3' },
  secondsPerNewBlock: 2,
  meta: { blockNumber: 1, provider: 'polygon' },
};

type MeteorologyFixture = MeteorologyLegacyResponse | MeteorologyResponse;

describe('isLegacyMeteorologyFeeData', () => {
  describe('meta.feeType authoritative (overrides payload shape)', () => {
    test('meta.feeType=legacy with legacy payload → true', () => {
      const fixture: MeteorologyLegacyResponse = {
        meta: { feeType: 'legacy', blockNumber: 1, provider: 'test' },
        data: { legacy: legacyPayload },
      };
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });

    test('meta.feeType=legacy with mixed payload (legacy + eip1559 fields) → true', () => {
      const fixture = {
        meta: { feeType: 'legacy' as const, blockNumber: 1, provider: 'test' },
        data: { legacy: legacyPayload, ...eip1559Payload },
      } as MeteorologyLegacyResponse;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });

    test('meta.feeType=legacy with eip1559-only payload (malformed) → true', () => {
      const fixture = {
        meta: { feeType: 'legacy' as const, blockNumber: 1, provider: 'test' },
        data: eip1559Payload,
      } as unknown as MeteorologyLegacyResponse;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });

    test('meta.feeType=eip1559 with eip1559 payload → false', () => {
      const fixture: MeteorologyResponse = {
        meta: { feeType: 'eip1559', blockNumber: '1', provider: 'polygon' },
        data: eip1559Payload,
      };
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('meta.feeType=eip1559 with mixed payload (Polygon/BSC transition) → false', () => {
      const fixture = {
        meta: {
          feeType: 'eip1559' as const,
          blockNumber: '1',
          provider: 'polygon',
        },
        data: { legacy: legacyPayload, ...eip1559Payload },
      } as MeteorologyResponse;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('meta.feeType=eip1559 with legacy-only payload (malformed) → false', () => {
      const fixture = {
        meta: {
          feeType: 'eip1559' as const,
          blockNumber: '1',
          provider: 'bsc',
        },
        data: { legacy: legacyPayload },
      } as unknown as MeteorologyResponse;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });
  });

  describe('fallback when meta.feeType missing', () => {
    test('legacy-only payload (no baseFeeSuggestion) → true', () => {
      const fixture = {
        meta: {},
        data: { legacy: legacyPayload },
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });

    test('eip1559 payload (has baseFeeSuggestion) → false', () => {
      const fixture = {
        meta: {},
        data: eip1559Payload,
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('mixed payload (legacy + baseFeeSuggestion) → false', () => {
      const fixture = {
        meta: {},
        data: { legacy: legacyPayload, ...eip1559Payload },
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('meta exists but feeType undefined → fallback', () => {
      const fixture = {
        meta: { blockNumber: 1, provider: 'test' },
        data: { legacy: legacyPayload },
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });

    test('meta.feeType invalid/unknown → fallback to payload shape', () => {
      const fixture = {
        meta: {
          feeType: 'unknown' as 'legacy',
          blockNumber: 1,
          provider: 'test',
        },
        data: { legacy: legacyPayload },
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('empty data object → false (no legacy, no baseFeeSuggestion)', () => {
      const fixture = {
        meta: {},
        data: {},
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('data with only currentBaseFee (no baseFeeSuggestion) → false', () => {
      const fixture = {
        meta: {},
        data: { currentBaseFee: '30000000000' },
      } as unknown as MeteorologyFixture;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('provider gas fallback shape (legacy + feeType) → true', () => {
      const fixture: MeteorologyLegacyResponse = {
        meta: { feeType: 'legacy', blockNumber: 0, provider: 'provider' },
        data: {
          legacy: {
            fastGasPrice: '25',
            proposeGasPrice: '25',
            safeGasPrice: '25',
          },
        },
      };
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(true);
    });

    test('E2E mock meteorology shape (eip1559) → false', () => {
      const fixture = {
        meta: {
          feeType: 'eip1559' as const,
          blockNumber: '0',
          provider: 'anvil',
        },
        data: {
          baseFeeSuggestion: '100000000',
          baseFeeTrend: 0,
          blocksToConfirmationByBaseFee: {
            '4': '1',
            '8': '1',
            '40': '1',
            '120': '1',
            '240': '1',
          },
          blocksToConfirmationByPriorityFee: {
            '1': '1',
            '2': '1',
            '3': '1',
            '4': '1',
          },
          currentBaseFee: '100000000',
          maxPriorityFeeSuggestions: {
            fast: '2000000000',
            normal: '1000000000',
            urgent: '3000000000',
          },
          secondsPerNewBlock: 12,
          meta: { blockNumber: 0, provider: 'anvil' },
        },
      } as MeteorologyResponse;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });

    test('data with extra unknown fields does not affect classification', () => {
      const fixture = {
        meta: {
          feeType: 'eip1559' as const,
          blockNumber: '1',
          provider: 'test',
        },
        data: { ...eip1559Payload, extraField: 'ignored' },
      } as unknown as MeteorologyResponse;
      expect(isLegacyMeteorologyFeeData(fixture)).toBe(false);
    });
  });
});
