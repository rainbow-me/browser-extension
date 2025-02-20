import { ETH_ADDRESS } from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { networkStore } from '~/core/state/networks/networks';
import { AddressOrEth, ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';
import { getChain } from '~/core/utils/chains';
import { getProvider } from '~/core/wagmi/clientToProvider';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

export const getNativeAssetMock = ({ chainId }: { chainId: ChainId }) => {
  const chain = getChain({ chainId });
  const nativeAssetAddress =
    networkStore.getState().getChainsNativeAsset()[chainId]?.address ||
    ETH_ADDRESS;
  const chainLabel = networkStore.getState().getChainsLabel()[chainId];
  const nativeAssetMock = {
    address: nativeAssetAddress as AddressOrEth,
    balance: { amount: '', display: '' },
    chainId: chainId,
    chainName: chainLabel as ChainName,
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
    uniqueId: `${nativeAssetAddress}_${chain.id}`,
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
      !getChain({ chainId }).testnet &&
      chainId !== ChainId.hardhat &&
      chainId !== ChainId.hardhatOptimism
    ) {
      return null;
    }

    const nativeAsset = getNativeAssetMock({ chainId });
    const provider = getProvider({ chainId });
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
    ParsedUserAsset,
    UserTestnetNativeAssetQueryKey
  > = {},
) {
  return useQuery({
    queryKey: userTestnetNativeAssetQueryKey({
      address,
      currency,
      chainId,
    }),
    queryFn: userTestnetNativeAssetQueryFunction,
    ...config,
    refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
  });
}
