import { Address, isAddress, zeroAddress } from 'viem';

import { ETH_ADDRESS, NATIVE_ASSET_ADDRESS } from '../references';

/**
 * Checks if an address represents a native asset in any of the known formats:
 * - 'eth' (legacy Rainbow internal format)
 * - '0x0000...0000' (zero address, used for L2s and custom chains)
 * - '0xEeee...eEEE' (industry standard native asset address)
 */
export const isNativeAssetAddress = (
  address: string | undefined | null,
): boolean => {
  if (!address) {
    return false;
  }
  const lower = address.toLowerCase();
  return (
    lower === ETH_ADDRESS ||
    lower === zeroAddress.toLowerCase() ||
    lower === NATIVE_ASSET_ADDRESS.toLowerCase()
  );
};

/**
 * Normalizes any native asset address format to the standard NATIVE_ASSET_ADDRESS.
 * Use this when parsing API responses to ensure consistent internal representation.
 *
 * @param address - The address to normalize (can be 'eth', zero address, or 0xEeee...)
 * @returns The normalized address (NATIVE_ASSET_ADDRESS for native assets, original otherwise), or undefined if input was null/undefined
 */
export function normalizeNativeAssetAddress<
  T extends string | undefined | null,
>(
  address: T,
): T extends null | undefined
  ? undefined
  : T extends string
  ? Address
  : Address | undefined {
  if (!address) {
    return undefined as T extends null | undefined
      ? undefined
      : T extends string
      ? Address
      : Address | undefined;
  }
  if (isNativeAssetAddress(address)) {
    return NATIVE_ASSET_ADDRESS as T extends null | undefined
      ? undefined
      : T extends string
      ? Address
      : Address | undefined;
  }
  return address as Address as T extends null | undefined
    ? undefined
    : T extends string
    ? Address
    : Address | undefined;
}

/**
 * Formats for different API requirements
 */
export type NativeAddressFormat = 'eth' | 'zero' | 'standard';

/**
 * Converts a native asset address to the format required by a specific API.
 * Use this when making outbound API requests that expect a specific format.
 *
 * @param address - The address to convert
 * @param format - The target format ('eth', 'zero', or 'standard')
 * @returns The address in the requested format, or the original if not a native asset
 */
export const toNativeAddressFormat = (
  address: Address | string | undefined | null,
  format: NativeAddressFormat,
): string => {
  if (!address) {
    return format === 'eth' ? ETH_ADDRESS : zeroAddress;
  }
  if (isNativeAssetAddress(address)) {
    switch (format) {
      case 'eth':
        return ETH_ADDRESS;
      case 'zero':
        return zeroAddress;
      case 'standard':
        return NATIVE_ASSET_ADDRESS;
    }
  }
  return address;
};

/**
 * Converts an address to the format expected by the GraphQL metadata API.
 * The API expects 'eth' string for native assets, not NATIVE_ASSET_ADDRESS.
 *
 * @param address - The address to convert (can be AddressOrEth)
 * @returns The address in API format ('eth' for native assets, original otherwise)
 */
export const toMetadataApiAddress = (
  address: Address | string | undefined | null,
): string => {
  if (!address) {
    return ETH_ADDRESS;
  }
  // If already 'eth', return as-is
  if (address === ETH_ADDRESS) {
    return ETH_ADDRESS;
  }
  // Convert native asset addresses to 'eth' format
  if (isNativeAssetAddress(address)) {
    return ETH_ADDRESS;
  }
  return address;
};

/**
 * Type guard that checks if a string is a valid asset address.
 * This includes both regular Ethereum addresses and native asset identifiers.
 */
export const isValidAssetAddress = (
  value: string | undefined | null,
): value is Address => {
  if (!value) {
    return false;
  }
  return isAddress(value) || isNativeAssetAddress(value);
};
