import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { estimateApprove } from '~/core/raps/actions';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { gasUnits } from '~/core/references/gasUnits';
import { ChainId } from '~/core/types/chains';

// ///////////////////////////////////////////////
// Query Types

export type EstimateAprovalGasLimitArgs = {
  chainId: ChainId;
  ownerAddress: Address;
  assetAddress?: Address;
  spenderAddress?: Address;
};

// ///////////////////////////////////////////////
// Query Key

const estimateApprovalGasLimitQueryKey = ({
  chainId,
  ownerAddress,
  assetAddress,
  spenderAddress,
}: EstimateAprovalGasLimitArgs) =>
  createQueryKey(
    'estimateApprovalGasLimitQueryKey',
    { chainId, ownerAddress, assetAddress, spenderAddress },
    { persisterVersion: 1 },
  );

type EstimateApprovalGasLimitQueryKey = ReturnType<
  typeof estimateApprovalGasLimitQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function estimateApprovalGasLimitQueryFunction({
  queryKey: [{ chainId, ownerAddress, assetAddress, spenderAddress }],
}: QueryFunctionArgs<typeof estimateApprovalGasLimitQueryKey>) {
  if (!assetAddress || !spenderAddress) return gasUnits.basic_approval[chainId];
  const gasLimit = await estimateApprove({
    owner: ownerAddress,
    tokenAddress: assetAddress,
    spender: spenderAddress,
    chainId,
  });
  if (!gasLimit) {
    return gasUnits.basic_approval[chainId];
  }
  return gasLimit;
}

type EstimateApprovalGasLimitResult = QueryFunctionResult<
  typeof estimateApprovalGasLimitQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchEstimateSwapGasLimit(
  {
    chainId,
    ownerAddress,
    assetAddress,
    spenderAddress,
  }: EstimateAprovalGasLimitArgs,
  config: QueryConfig<
    EstimateApprovalGasLimitResult,
    Error,
    EstimateApprovalGasLimitResult,
    EstimateApprovalGasLimitQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    estimateApprovalGasLimitQueryKey({
      chainId,
      ownerAddress,
      assetAddress,
      spenderAddress,
    }),
    estimateApprovalGasLimitQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useEstimateApprovalGasLimit(
  {
    chainId,
    ownerAddress,
    assetAddress,
    spenderAddress,
  }: EstimateAprovalGasLimitArgs,
  config: QueryConfig<
    EstimateApprovalGasLimitResult,
    Error,
    EstimateApprovalGasLimitResult,
    EstimateApprovalGasLimitQueryKey
  > = {},
) {
  return useQuery(
    estimateApprovalGasLimitQueryKey({
      chainId,
      ownerAddress,
      assetAddress,
      spenderAddress,
    }),
    estimateApprovalGasLimitQueryFunction,
    { keepPreviousData: true, ...config },
  );
}
