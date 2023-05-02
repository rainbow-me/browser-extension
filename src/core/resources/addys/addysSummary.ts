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

export type AddysSummaryArgs = {
  addresses: Address[];
};

// ///////////////////////////////////////////////
// Query Key

const addysSummaryQueryKey = ({ addresses }: AddysSummaryArgs) =>
  createQueryKey('addysSummary', { addresses }, { persisterVersion: 1 });

type AddysSummaryQueryKey = ReturnType<typeof addysSummaryQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function addysSummaryQueryFunction({
  queryKey: [{ addresses }],
}: QueryFunctionArgs<typeof addysSummaryQueryKey>) {
  const summaryPromises = addresses?.map(async (address) => {
    const summaryResponse = await addysHttp.get(`/summary?=${address}`);
    return summaryResponse;
  });
  const summaries = await Promise.all(summaryPromises);
  return summaries;
}

type AddysSumaryResult = QueryFunctionResult<typeof addysSummaryQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useAddysSummary(
  { addresses }: AddysSummaryArgs,
  config: QueryConfig<
    AddysSumaryResult,
    Error,
    AddysSumaryResult,
    AddysSummaryQueryKey
  > = {},
) {
  return useQuery(
    addysSummaryQueryKey({ addresses }),
    addysSummaryQueryFunction,
    {
      ...config,
    },
  );
}
