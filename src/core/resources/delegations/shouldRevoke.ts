import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { useDelegationEnabled } from '~/core/resources/delegations/featureStatus';
import { popupClient } from '~/entries/popup/handlers/background';
import { RainbowError, logger } from '~/logger';

// ///////////////////////////////////////////////
// Query Types

type ShouldRevokeDelegationArgs = {
  address: Address;
};

type ShouldRevokeDelegationData = {
  shouldRevoke: boolean;
  revokes: ReadonlyArray<{ address: Address; chainId: number }>;
};

// ///////////////////////////////////////////////
// Query Key

const shouldRevokeDelegationQueryKey = ({
  address,
}: ShouldRevokeDelegationArgs) =>
  createQueryKey(
    'shouldRevokeDelegation',
    { address },
    { persisterVersion: 1 },
  );

type ShouldRevokeDelegationQueryKey = ReturnType<
  typeof shouldRevokeDelegationQueryKey
>;

// ///////////////////////////////////////////////
// Query Function

async function shouldRevokeDelegationQueryFunction({
  queryKey: [{ address }],
}: QueryFunctionArgs<
  typeof shouldRevokeDelegationQueryKey
>): Promise<ShouldRevokeDelegationData> {
  try {
    const result = await popupClient.wallet.shouldRevokeDelegation({
      userAddress: address,
    });
    return {
      shouldRevoke: result.shouldRevoke,
      revokes: result.revokes as ReadonlyArray<{
        address: Address;
        chainId: number;
      }>,
    };
  } catch (e) {
    logger.error(
      new RainbowError('shouldRevokeDelegationQueryFunction: failed'),
      { message: (e as Error)?.message },
    );
    return { shouldRevoke: false, revokes: [] };
  }
}

type ShouldRevokeDelegationResult = QueryFunctionResult<
  typeof shouldRevokeDelegationQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useShouldRevokeDelegation(
  { address }: ShouldRevokeDelegationArgs,
  config: QueryConfig<
    ShouldRevokeDelegationResult,
    Error,
    ShouldRevokeDelegationResult,
    ShouldRevokeDelegationQueryKey
  > = {},
) {
  const { enabled: queryEnabled, ...restConfig } = config;
  const delegationEnabled = useDelegationEnabled();
  const enabled = delegationEnabled && (queryEnabled ?? true) && !!address;

  return useQuery({
    queryKey: shouldRevokeDelegationQueryKey({ address }),
    queryFn: shouldRevokeDelegationQueryFunction,
    ...restConfig,
    enabled,
    refetchInterval: enabled ? 30000 : false,
  });
}
