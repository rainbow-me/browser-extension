import { FeeData } from '@ethersproject/providers';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Chain } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { weiToGwei } from '~/core/utils/ethereum';

import { MeteorologyLegacyResponse, MeteorologyResponse } from './meteorology';

// ///////////////////////////////////////////////
// Query Types

export type ProviderGasArgs = {
  chainId: Chain['id'];
};

// ///////////////////////////////////////////////
// Query Key

const providerGasQueryKey = ({ chainId }: ProviderGasArgs) =>
  createQueryKey('providerGas', { chainId }, { persisterVersion: 1 });

type ProviderGasQueryKey = ReturnType<typeof providerGasQueryKey>;

// ///////////////////////////////////////////////
// Query Function

type ParsedFeeData =
  | Omit<MeteorologyLegacyResponse['data'], 'meta'>
  | (Pick<
      MeteorologyResponse['data'],
      'currentBaseFee' | 'baseFeeSuggestion'
    > & {
      maxPriorityFeeSuggestions: { normal: string };
      secondsPerNewBlock: undefined;
      blocksToConfirmationByBaseFee: undefined;
      blocksToConfirmationByPriorityFee: undefined;
    });

const parseFeeData = ({
  gasPrice,
  maxPriorityFeePerGas,
  lastBaseFeePerGas,
}: FeeData): ParsedFeeData => {
  if (!lastBaseFeePerGas && gasPrice) {
    return {
      legacy: {
        safeGasPrice: weiToGwei(gasPrice.toString()),
      },
    };
  }

  if (lastBaseFeePerGas && maxPriorityFeePerGas) {
    console.log(maxPriorityFeePerGas);
    return {
      currentBaseFee: weiToGwei(lastBaseFeePerGas.toString()),
      maxPriorityFeeSuggestions: {
        normal: weiToGwei(maxPriorityFeePerGas.toString()),
      },
      baseFeeSuggestion: weiToGwei(lastBaseFeePerGas.toString()),
      secondsPerNewBlock: undefined,
      blocksToConfirmationByBaseFee: undefined,
      blocksToConfirmationByPriorityFee: undefined,
    };
  }

  throw new Error('Invalid fee data');
};

async function providerGasQueryFunction({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof providerGasQueryKey>) {
  const provider = getProvider({ chainId });
  const feeData = await provider.getFeeData();

  const data = parseFeeData(feeData);

  return {
    data: {
      ...data,
      meta: {
        provider: 'provider',
        blockNumber: 0,
      },
    },
  };
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
  return await queryClient.fetchQuery(
    providerGasQueryKey({ chainId }),
    providerGasQueryFunction,
    config,
  );
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
  return useQuery(
    providerGasQueryKey({ chainId }),
    providerGasQueryFunction,
    config,
  );
}
