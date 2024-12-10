import { getSlippage } from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { BigNumberish } from 'ethers';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export interface SwapSlippage {
  slippagePercent: number;
}

// ///////////////////////////////////////////////
// Query Types

export type SwapSlippageArgs = {
  chainId: ChainId | undefined;
  toChainId: ChainId | undefined;
  sellTokenAddress: AddressOrEth | undefined;
  buyTokenAddress: AddressOrEth | undefined;
  sellAmount: BigNumberish;
  buyAmount: BigNumberish;
};

// ///////////////////////////////////////////////
// Query Key

const swapSlippageQueryKey = ({
  chainId,
  toChainId,
  sellTokenAddress,
  buyTokenAddress,
  sellAmount,
  buyAmount,
}: SwapSlippageArgs) =>
  createQueryKey(
    'swapSlippage',
    {
      chainId,
      toChainId,
      sellTokenAddress,
      buyTokenAddress,
      sellAmount,
      buyAmount,
    },
    { persisterVersion: 1 },
  );

type SwapSlippageQueryKey = ReturnType<typeof swapSlippageQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function swapSlippageQueryFunction({
  queryKey: [
    {
      chainId,
      toChainId,
      sellTokenAddress,
      buyTokenAddress,
      sellAmount,
      buyAmount,
    },
  ],
}: QueryFunctionArgs<typeof swapSlippageQueryKey>) {
  if (!chainId || !sellTokenAddress || !buyTokenAddress)
    throw new Error('Invalid params');

  const slippage = await getSlippage({
    chainId,
    toChainId,
    sellTokenAddress,
    buyTokenAddress,
    sellAmount,
    buyAmount,
  });
  return slippage as SwapSlippage;
}

type SwapSlippageResult = QueryFunctionResult<typeof swapSlippageQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useSwapSlippage(
  {
    chainId,
    toChainId,
    sellTokenAddress,
    buyTokenAddress,
    sellAmount,
    buyAmount,
  }: SwapSlippageArgs,
  config: QueryConfig<
    SwapSlippageResult,
    Error,
    SwapSlippageResult,
    SwapSlippageQueryKey
  > = {},
) {
  return useQuery({
    queryKey: swapSlippageQueryKey({
      chainId,
      toChainId,
      sellTokenAddress,
      buyTokenAddress,
      sellAmount,
      buyAmount,
    }),
    queryFn: swapSlippageQueryFunction,
    enabled: !!chainId && !!sellTokenAddress && !!buyTokenAddress,
    ...config,
    retry: true,
    staleTime: 10 * 60 * 1_000, // 10 min
  });
}
