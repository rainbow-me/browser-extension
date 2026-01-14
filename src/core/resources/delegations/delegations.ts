import { getDelegations } from '@rainbow-me/delegation';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import remoteConfig from '~/core/firebase/remoteConfig';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainDelegation } from '~/core/types/delegations';
import { RainbowError, logger } from '~/logger';

// ///////////////////////////////////////////////
// Query Types

type DelegationsQueryArgs = {
  address: Address;
};

// ///////////////////////////////////////////////
// Query Key

const delegationsQueryKey = ({ address }: DelegationsQueryArgs) =>
  createQueryKey('delegations', { address }, { persisterVersion: 2 });

type DelegationsQueryKey = ReturnType<typeof delegationsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function delegationsQueryFunction({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof delegationsQueryKey>): Promise<
  ChainDelegation[] | null
> {
  try {
    // getDelegations returns all delegations across all chains
    // It only returns chains where the wallet is actually delegated
    const results = await getDelegations({
      address,
    });

    if (!results || !results.length) {
      return [];
    }

    return results
      .filter(
        (result) =>
          result.delegationStatus === 'DELEGATION_STATUS_RAINBOW_DELEGATED' ||
          result.delegationStatus === 'DELEGATION_STATUS_THIRD_PARTY_DELEGATED',
      )
      .map((result) => ({
        chainId: result.chainId,
        contractAddress: result.currentContract || undefined,
        isThirdParty:
          result.delegationStatus === 'DELEGATION_STATUS_THIRD_PARTY_DELEGATED',
      }));
  } catch (e) {
    logger.error(new RainbowError('delegationsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return null;
  }
}

type DelegationsQueryResult = QueryFunctionResult<
  typeof delegationsQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

async function fetchDelegations(
  { address }: DelegationsQueryArgs,
  config: QueryConfig<
    DelegationsQueryResult,
    Error,
    DelegationsQueryResult,
    DelegationsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: delegationsQueryKey({ address }),
    queryFn: delegationsQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function useDelegations(
  { address }: DelegationsQueryArgs,
  config: QueryConfig<
    DelegationsQueryResult,
    Error,
    DelegationsQueryResult,
    DelegationsQueryKey
  > = {},
) {
  const { enabled: queryEnabled, ...restConfig } = config;

  // Fetch delegations regardless of smart wallet activation status
  // Delegations can exist on-chain even if smart wallet is disabled in Rainbow
  // (e.g., delegated by a third-party wallet)
  const enabled =
    remoteConfig.delegation_enabled && (queryEnabled ?? true) && !!address;

  return useQuery({
    queryKey: delegationsQueryKey({ address }),
    queryFn: delegationsQueryFunction,
    ...restConfig,
    enabled,
    // Refetch delegations periodically since they can change
    refetchInterval: enabled ? 30000 : false, // Only refetch when enabled
  });
}

export { fetchDelegations };
