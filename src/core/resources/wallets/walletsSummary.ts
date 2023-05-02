import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';

// ///////////////////////////////////////////////
// Query Types

export type WalletsSummaryArgs = {
  addresses: Address[];
};

// ///////////////////////////////////////////////
// Query Key

const walletsSummaryQueryKey = ({ addresses }: WalletsSummaryArgs) =>
  createQueryKey('walletsSummary', { addresses }, { persisterVersion: 1 });

type WalletsSummaryQueryKey = ReturnType<typeof walletsSummaryQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function walletsSummaryQueryFunction({
  queryKey: [{ addresses }],
}: QueryFunctionArgs<typeof walletsSummaryQueryKey>) {
  const summaryPromises = addresses?.map(async (address) => {
    const summaryResponse = await addysHttp.get(`/summary?=${address}`);
    return summaryResponse;
  });
  const summaries = await Promise.all(summaryPromises);
  return summaries;
}

type WalletsSumaryResult = QueryFunctionResult<
  typeof walletsSummaryQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useWalletsSummary(
  { addresses }: WalletsSummaryArgs,
  config: QueryConfig<
    WalletsSumaryResult,
    Error,
    WalletsSumaryResult,
    WalletsSummaryQueryKey
  > = {},
) {
  return useQuery(
    walletsSummaryQueryKey({ addresses }),
    walletsSummaryQueryFunction,
    {
      ...config,
    },
  );
}
