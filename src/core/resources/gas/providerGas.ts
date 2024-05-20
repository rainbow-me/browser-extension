import { useQuery } from '@tanstack/react-query';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { weiToGwei } from '~/core/utils/ethereum';
import { multiply } from '~/core/utils/numbers';
import { getProvider } from '~/core/wagmi/clientToProvider';

import { MeteorologyLegacyResponse, MeteorologyResponse } from './meteorology';

export const BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS = {
  120: 0.75,
  240: 0.72,
  4: 0.92,
  40: 0.79,
  8: 0.88,
};

// ///////////////////////////////////////////////
// Query Types

export type ProviderGasArgs = {
  chainId: ChainId;
};

// ///////////////////////////////////////////////
// Query Key

const providerGasQueryKey = ({ chainId }: ProviderGasArgs) =>
  createQueryKey('providerGas', { chainId }, { persisterVersion: 1 });

type ProviderGasQueryKey = ReturnType<typeof providerGasQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function providerGasQueryFunction({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof providerGasQueryKey>) {
  const provider = getProvider({ chainId });
  try {
    const feeData = await provider.getFeeData();
    const parsedResponse = {
      data: {
        currentBaseFee: feeData.lastBaseFeePerGas?._hex,
        baseFeeSuggestion: feeData.maxFeePerGas?._hex,
        baseFeeTrend: 0,
        blocksToConfirmationByBaseFee: {
          '120': multiply(
            feeData.maxFeePerGas?._hex || '0',
            BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[120],
          ),
          '240': multiply(
            feeData.maxFeePerGas?._hex || '0',
            BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[240],
          ),
          '4': multiply(
            feeData.maxFeePerGas?._hex || '0',
            BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[4],
          ),
          '40': multiply(
            feeData.maxFeePerGas?._hex || '0',
            BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[40],
          ),
          '8': multiply(
            feeData.maxFeePerGas?._hex || '0',
            BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[8],
          ),
        },
        blocksToConfirmationByPriorityFee: {
          '1': '1000000000',
          '2': '1000000000',
          '3': '1000000000',
          '4': '1000000000',
        },
        maxPriorityFeeSuggestions: {
          fast: '1000000000',
          lowest: '1000000000',
          normal: '1000000000',
          urgent: '1000000000',
        },
        secondsPerNewBlock: 12,
        meta: {
          feeType: 'eip1559',
          blockNumber: 0,
          provider: 'rpc',
        },
      },
    };

    const providerGasData = parsedResponse as MeteorologyResponse;
    return providerGasData;
  } catch (e) {
    const gasPrice = await provider.getGasPrice();
    const gweiGasPrice = weiToGwei(gasPrice.toString());

    const parsedResponse = {
      data: {
        legacy: {
          fastGasPrice: gweiGasPrice,
          proposeGasPrice: gweiGasPrice,
          safeGasPrice: gweiGasPrice,
        },
        meta: {
          blockNumber: 0,
          provider: 'provider',
        },
      },
    };

    const providerGasData = parsedResponse as MeteorologyLegacyResponse;
    return providerGasData;
  }
}

type ProviderGasResult = QueryFunctionResult<typeof providerGasQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function getProviderGas(
  { chainId }: ProviderGasArgs,
  config: QueryConfig<
    ProviderGasResult,
    Error,
    ProviderGasResult,
    ProviderGasQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: providerGasQueryKey({ chainId }),
    queryFn: providerGasQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useProviderGas(
  { chainId }: ProviderGasArgs,
  config: QueryConfig<
    ProviderGasResult,
    Error,
    ProviderGasResult,
    ProviderGasQueryKey
  > = {},
) {
  return useQuery({
    queryKey: providerGasQueryKey({ chainId }),
    queryFn: providerGasQueryFunction,
    ...config,
  });
}
