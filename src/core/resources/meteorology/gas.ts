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
      return 'polygon';
    default:
      return 'mainnet';
  }
};
// ///////////////////////////////////////////////
// Query Types

export type MeteorologyResponse = {
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

export type MeteorologyLegacyResponse = {
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
  console.log('meteorology query function ', chainId);
  const network = getNetworkFromChainId(chainId);
  console.log('meteorology query function network', network);
  if (!network) return undefined;
  const parsedResponse = await meteorologyHttp.get(`/${network}`);
  const meteorologyData = parsedResponse.data as
    | MeteorologyResponse
    | MeteorologyLegacyResponse;
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
  console.log('-- IINNNNNN useMeteorology', chainId);
  return useQuery(
    meteorologyQueryKey({ chainId }),
    meteorologyQueryFunction,
    config,
  );
}
