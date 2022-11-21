import { useQuery } from '@tanstack/react-query';
import { Chain, chain } from 'wagmi';

import { meteorologyHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';

const getNetworkFromChainId = (chainId: Chain['id']) => {
  switch (chainId) {
    case chain.polygon.id:
      return chain.polygon.network;
    default:
      return chain.mainnet.network;
  }
};
// ///////////////////////////////////////////////
// Query Types

export type MeterologyResponse = {
  data: {
    baseFeeSuggestion: string;
    baseFeeTrend: number;
    blocksToConfirmationByBaseFee: {
      '4': string;
      '8': string;
      '40': string;
      '120': string;
      '240': string;
    };
    blocksToConfirmationByPriorityFee: {
      '1': string;
      '2': string;
      '3': string;
      '4': string;
    };
    confirmationTimeByPriorityFee: {
      '15': string;
      '30': string;
      '45': string;
      '60': string;
    };
    currentBaseFee: string;
    maxPriorityFeeSuggestions: {
      fast: string;
      normal: string;
      urgent: string;
    };
    meta: {
      blockNumber: number;
      provider: string;
    };
  };
};

export type MeterologyLegacyResponse = {
  data: {
    legacy: {
      fastGasPrice: string;
      proposeGasPrice: string;
      safeGasPrice: string;
    };
    meta: {
      blockNumber: number;
      provider: string;
    };
  };
};

export type MeteorologyArgs = {
  chainId: Chain['id'];
};

// ///////////////////////////////////////////////
// Query Key

const meteorologyQueryKey = ({ chainId }: MeteorologyArgs) =>
  createQueryKey('meteorology', { chainId }, { persisterVersion: 1 });

type MeteorologyQueryKey = ReturnType<typeof meteorologyQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function meteorologyQueryFunction({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof meteorologyQueryKey>) {
  const network = getNetworkFromChainId(chainId);
  if (!network) return undefined;
  const parsedResponse = await meteorologyHttp.get(`/${network}`);
  const meteorologyData = parsedResponse.data as
    | MeterologyResponse
    | MeterologyLegacyResponse;
  return meteorologyData;
}

type MeteorologyResult = QueryFunctionResult<typeof meteorologyQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchMeteorology(
  { chainId }: MeteorologyArgs,
  config: QueryConfig<
    MeteorologyResult,
    Error,
    MeteorologyResult,
    MeteorologyQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    meteorologyQueryKey({ chainId }),
    meteorologyQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useMeteorology(
  { chainId }: MeteorologyArgs,
  config: QueryConfig<
    MeteorologyResult,
    Error,
    MeteorologyResult,
    MeteorologyQueryKey
  > = {},
) {
  return useQuery(
    meteorologyQueryKey({ chainId }),
    meteorologyQueryFunction,
    config,
  );
}
