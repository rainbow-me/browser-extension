import {
  ensureHyperliquidReferral,
  isHyperliquidHost,
} from '~/core/hyperliquid/referral';

import type { DappHook } from './types';

const HYPERLIQUID_RELEVANT_APPROVED_METHODS = new Set([
  'eth_sendTransaction',
  'wallet_sendCalls',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'personal_sign',
]);

const isRelevantHyperliquidApprovedMethod = (method: string) =>
  HYPERLIQUID_RELEVANT_APPROVED_METHODS.has(method);

export const hyperliquidDappHook: DappHook = {
  matchesHost: isHyperliquidHost,
  async onApprovedProviderRequest({ address, request }) {
    if (!isRelevantHyperliquidApprovedMethod(request.method)) {
      return;
    }

    await ensureHyperliquidReferral({ address, poll: true });
  },
  async onSessionAdded({ address }) {
    await ensureHyperliquidReferral({ address });
  },
};
