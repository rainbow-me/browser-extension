import { useLocation } from 'react-router-dom';
import { type Address, isAddress } from 'viem';

import { useCurrentAddressStore } from '~/core/state';

function extractAddressFromLocationState(state: unknown): Address | undefined {
  if (state === null || typeof state !== 'object') return undefined;
  const address = 'address' in state ? state.address : undefined;
  if (typeof address !== 'string' || !isAddress(address)) return undefined;
  return address;
}

/**
 * Resolves the address for the delegation flow.
 * Uses address from navigation state when present (e.g. from Wallet Details),
 * otherwise falls back to the store (e.g. from Settings menu).
 */
export function useDelegationAddress(): Address | undefined {
  const { state: locationState } = useLocation();
  const storeAddress = useCurrentAddressStore((s) => s.currentAddress);

  return extractAddressFromLocationState(locationState) ?? storeAddress;
}
