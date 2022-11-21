import { useQuery } from '@tanstack/react-query';

import { meteorologyHttp } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainName } from '~/core/types/chains';

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
  network: ChainName;
};

// ///////////////////////////////////////////////
// Query Key

const meteorologyQueryKey = ({ network }: MeteorologyArgs) =>
  createQueryKey('meteorology', { network }, { persisterVersion: 1 });

type MeteorologyQueryKey = ReturnType<typeof meteorologyQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function meteorologyQueryFunction({
  queryKey: [{ network }],
}: QueryFunctionArgs<typeof meteorologyQueryKey>) {
  if (!network) return undefined;
  const parsedResponse = await meteorologyHttp.get(`/${network}`, {
    params: {},
  });
  const meteorologyData = parsedResponse.data;
  return meteorologyData;
}

type MeteorologyResult = QueryFunctionResult<typeof meteorologyQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchMeteorology(
  { network }: MeteorologyArgs,
  config: QueryConfig<
    MeteorologyResult,
    Error,
    MeteorologyResult,
    MeteorologyQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    meteorologyQueryKey({ network }),
    meteorologyQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useMeteorology(
  { network }: MeteorologyArgs,
  config: QueryConfig<
    MeteorologyResult,
    Error,
    MeteorologyResult,
    MeteorologyQueryKey
  > = {},
) {
  return useQuery(
    meteorologyQueryKey({ network }),
    meteorologyQueryFunction,
    config,
  );
}
