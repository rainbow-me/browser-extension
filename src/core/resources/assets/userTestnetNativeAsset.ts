import { useQuery } from '@tanstack/react-query';
import { getPublicClient } from 'wagmi/actions';
import { type Address } from 'viem';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import {
  NATIVE_ASSETS_PER_CHAIN,
  SupportedCurrencyKey,
} from '~/core/references';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName, ChainNameDisplay } from '~/core/types/chains';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';
import { getChain, isTestnetChainId } from '~/core/utils/chains';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

export const getNativeAssetMock = ({ chainId }: { chainId: ChainId }) => {
  const chain = getChain({ chainId });
  const nativeAssetMock = {
    address: NATIVE_ASSETS_PER_CHAIN[chainId],
    balance: { amount: '', display: '' },
    chainId: chainId,
    chainName: ChainNameDisplay[chainId] as ChainName,
    colors: { primary: '#808088', fallback: '#E8EAF5' },
    decimals: chain.nativeCurrency.decimals,
    icon_url: '',
    isNativeAsset: true,
    mainnetAddress: undefined,
    name: chain.nativeCurrency.name,
    native: {
      balance: { amount: '', display: '' },
      price: { change: '', amount: 0, display: '' },
    },
    price: {
      value: 0,
      relative_change_24h: 0,
    },
    symbol: chain.nativeCurrency.symbol,
    uniqueId: `native_asset_${chain.id}`,
  } satisfies ParsedUserAsset;
  return nativeAssetMock;
};

// ///////////////////////////////////////////////
// Query Types

type UserTestnetNativeAssetArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  chainId: ChainId;
};

// ///////////////////////////////////////////////
// Query Key

export const userTestnetNativeAssetQueryKey = ({
  address,
  currency,
  chainId,
}: UserTestnetNativeAssetArgs) =>
  createQueryKey(
    'userTestnetNativeAsset',
    { address, currency, chainId },
    { persisterVersion: 1 },
  );

type UserTestnetNativeAssetQueryKey = ReturnType<
  typeof userTestnetNativeAssetQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function userTestnetNativeAssetQueryFunction({
  queryKey: [{ address, currency, chainId }],
}: QueryFunctionArgs<typeof userTestnetNativeAssetQueryKey>) {
  try {
    // Don't do anything unless it's a testnet
    if (
      !isTestnetChainId({ chainId }) &&
      chainId !== ChainId.hardhat &&
      chainId !== ChainId.hardhatOptimism
    )
      return null;

    const provider = getPublicClient({ chainId });
    const nativeAsset = getNativeAssetMock({ chainId });
    const parsedAsset = await fetchAssetBalanceViaProvider({
      parsedAsset: nativeAsset,
      currentAddress: address,
      currency,
      provider,
    });
    return parsedAsset;
  } catch (e) {
    return null;
  }
}

type UserAssetsResult = QueryFunctionResult<
  typeof userTestnetNativeAssetQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserTestnetNativeAsset(
  { address, currency, chainId }: UserTestnetNativeAssetArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    UserAssetsResult,
    UserTestnetNativeAssetQueryKey
  > = {},
) {
  return useQuery(
    userTestnetNativeAssetQueryKey({
      address,
      currency,
      chainId,
    }),
    userTestnetNativeAssetQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
