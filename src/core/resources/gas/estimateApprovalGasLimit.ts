import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { estimateApprove } from '~/core/raps/actions';
import { estimateERC721Approval } from '~/core/raps/actions/unlock';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EstimateAprovalGasLimitArgs = {
  chainId: ChainId;
  ownerAddress: Address;
  assetAddress?: Address;
  spenderAddress?: Address;
  assetType: 'erc20' | 'nft';
};

// ///////////////////////////////////////////////
// Query Key

const estimateApprovalGasLimitQueryKey = ({
  chainId,
  ownerAddress,
  assetAddress,
  spenderAddress,
  assetType,
}: EstimateAprovalGasLimitArgs) =>
  createQueryKey(
    'estimateApprovalGasLimitQueryKey',
    { chainId, ownerAddress, assetAddress, spenderAddress, assetType },
    { persisterVersion: 1 },
  );

type EstimateApprovalGasLimitQueryKey = ReturnType<
  typeof estimateApprovalGasLimitQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function estimateApprovalGasLimitQueryFunction({
  queryKey: [
    { chainId, ownerAddress, assetAddress, spenderAddress, assetType },
  ],
}: QueryFunctionArgs<typeof estimateApprovalGasLimitQueryKey>) {
  if (!assetAddress || !spenderAddress) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return chainGasUnits.basic.approval;
  }
  if (assetType === 'erc20') {
    const gasLimit = await estimateApprove({
      owner: ownerAddress,
      tokenAddress: assetAddress,
      spender: spenderAddress,
      chainId,
    });
    return gasLimit;
  } else {
    const gasLimit = await estimateERC721Approval({
      owner: ownerAddress,
      tokenAddress: assetAddress,
      spender: spenderAddress,
      chainId,
    });
    return gasLimit;
  }
}

type EstimateApprovalGasLimitResult = QueryFunctionResult<
  typeof estimateApprovalGasLimitQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchEstimateSwapGasLimit(
  {
    chainId,
    ownerAddress,
    assetAddress,
    spenderAddress,
    assetType,
  }: EstimateAprovalGasLimitArgs,
  config: QueryConfig<
    EstimateApprovalGasLimitResult,
    Error,
    EstimateApprovalGasLimitResult,
    EstimateApprovalGasLimitQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: estimateApprovalGasLimitQueryKey({
      chainId,
      ownerAddress,
      assetAddress,
      spenderAddress,
      assetType,
    }),
    queryFn: estimateApprovalGasLimitQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useEstimateApprovalGasLimit(
  {
    chainId,
    ownerAddress,
    assetAddress,
    spenderAddress,
    assetType,
  }: EstimateAprovalGasLimitArgs,
  config: QueryConfig<
    EstimateApprovalGasLimitResult,
    Error,
    EstimateApprovalGasLimitResult,
    EstimateApprovalGasLimitQueryKey
  > = {},
) {
  return useQuery({
    queryKey: estimateApprovalGasLimitQueryKey({
      chainId,
      ownerAddress,
      assetAddress,
      spenderAddress,
      assetType,
    }),
    queryFn: estimateApprovalGasLimitQueryFunction,
    ...config,
    placeholderData: (previousData) => previousData,
  });
}
