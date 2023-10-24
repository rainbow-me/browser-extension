import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { fetchNftHistory } from '~/core/network/nfts';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { ChainName } from '~/core/types/chains';
import { getSupportedChains } from '~/core/utils/chains';

// ///////////////////////////////////////////////
// Query Types

export type NftsHistoryArgs = {
  address: Address;
};

// ///////////////////////////////////////////////
// Query Key

const nftsHistoryQueryKey = ({ address }: NftsHistoryArgs) =>
  createQueryKey('nftsHistory', { address }, { persisterVersion: 1 });

type NftsHistoryQueryKey = ReturnType<typeof nftsHistoryQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function nftsHistoryQueryFunction({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof nftsHistoryQueryKey>) {
  const chains = getSupportedChains()
    .map((chain) => chain.name.toLowerCase() as ChainName)
    .filter((name) => name !== 'polygon');
  const history = await fetchNftHistory({ address, chains });
  return history;
}

type NftsHistoryResult = QueryFunctionResult<typeof nftsHistoryQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useNftsHistory<TSelectResult = NftsHistoryResult>(
  { address }: NftsHistoryArgs,
  config: QueryConfig<
    NftsHistoryResult,
    Error,
    TSelectResult,
    NftsHistoryQueryKey
  > = {},
) {
  return useQuery(
    nftsHistoryQueryKey({ address }),
    nftsHistoryQueryFunction,
    config,
  );
}
