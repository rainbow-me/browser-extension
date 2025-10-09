import { AddressOrEth, AssetApiResponse } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import type { Asset as PlatformAsset } from '~/core/types/gen/plattform/common/asset';

const SECONDS_IN_MILLISECOND = 1000;

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (value === '<nil>') return 0;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return 0;
};

const normalizeTimestamp = (value?: string | Date) => {
  if (!value) return undefined;
  if (value instanceof Date) {
    const timestamp = value.getTime();
    if (Number.isNaN(timestamp)) return undefined;
    return Math.floor(timestamp / SECONDS_IN_MILLISECOND);
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.floor(timestamp / SECONDS_IN_MILLISECOND);
};

const convertCommonNetworks = (
  networks: Record<string, { address: string; decimals: number }> | undefined,
) =>
  Object.entries(networks ?? {}).reduce<
    Record<number, { address: string; decimals: number }>
  >((acc, [key, value]) => {
    const chainId = Number(key);
    if (Number.isNaN(chainId)) {
      return acc;
    }
    acc[chainId] = {
      address: value.address,
      decimals: value.decimals,
    };
    return acc;
  }, {});

const convertCommonBridgingNetworks = (
  networks: Record<string, { bridgeable: boolean }> | undefined,
) =>
  Object.entries(networks ?? {}).reduce<
    Record<number, { bridgeable: boolean }>
  >((acc, [key, value]) => {
    const chainId = Number(key);
    if (Number.isNaN(chainId)) {
      return acc;
    }
    acc[chainId] = { bridgeable: Boolean(value?.bridgeable) };
    return acc;
  }, {});

const convertCommonColors = (colors: PlatformAsset['colors']) =>
  colors
    ? {
        primary: colors.primary,
        fallback: colors.fallback,
        shadow: (colors as { shadow?: string }).shadow,
      }
    : undefined;

export function convertPlatformAssetToAssetApiResponse(
  asset: PlatformAsset,
): AssetApiResponse {
  const networks = convertCommonNetworks(asset.networks);

  const bridgingNetworks = convertCommonBridgingNetworks(
    asset.bridging?.networks,
  );

  const bridgeable =
    asset.bridging?.bridgeable ??
    Object.values(bridgingNetworks).some((network) => network.bridgeable);

  const price = asset.price
    ? {
        value: toNumber(asset.price.value),
        changed_at: normalizeTimestamp(asset.price.changedAt),
        relative_change_24h: toNumber(asset.price.relativeChange24h),
      }
    : undefined;

  const colors = convertCommonColors(asset.colors);

  return {
    asset_code: asset.address as AddressOrEth,
    chain_id: asset.chainId,
    name: asset.name,
    symbol: asset.symbol,
    decimals: asset.decimals,
    icon_url: asset.iconUrl,
    type: asset.type as AssetApiResponse['type'],
    network: asset.network as ChainName | undefined,
    colors,
    price,
    networks: networks as AssetApiResponse['networks'],
    bridging: {
      bridgeable,
      networks: bridgingNetworks as AssetApiResponse['bridging']['networks'],
    },
    transferable: asset.transferable,
  } as AssetApiResponse;
}
