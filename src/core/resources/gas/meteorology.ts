import { useQuery } from '@tanstack/react-query';

import { meteorologyHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { ChainId } from '~/core/types/chains';

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
    confirmationTimeByPriorityFee?: {
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
    secondsPerNewBlock: number;
    meta: {
      blockNumber: number;
      provider: string;
    };
  };
  meta: {
    feeType: 'legacy' | 'eip1559';
    blockNumber: string;
    provider: string;
  };
};

export type MeteorologyLegacyResponse = {
  data: {
    legacy: {
      fastGasPrice: string;
      proposeGasPrice: string;
      safeGasPrice: string;
    };
  };
  meta: {
    feeType: 'legacy' | 'eip1559';
    blockNumber: number;
    provider: string;
  };
};

export type MeteorologyArgs = {
  chainId: ChainId;
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
  const network = useBackendNetworksStore.getState().getChainsName()[chainId];
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
  return await queryClient.fetchQuery({
    queryKey: meteorologyQueryKey({ chainId }),
    queryFn: meteorologyQueryFunction,
    ...config,
  });
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
  return useQuery({
    queryKey: meteorologyQueryKey({ chainId }),
    queryFn: meteorologyQueryFunction,
    ...config,
  });
}
