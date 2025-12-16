import { delegationPreference } from '@rainbow-me/rainbow-delegation';
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
import { RainbowError, logger } from '~/logger';

// ///////////////////////////////////////////////
// Query Types

type ActivationStatusQueryArgs = {
  address: Address;
};

// ///////////////////////////////////////////////
// Query Key

const activationStatusQueryKey = ({ address }: ActivationStatusQueryArgs) =>
  createQueryKey('activationStatus', { address }, { persisterVersion: 1 });

type ActivationStatusQueryKey = ReturnType<typeof activationStatusQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function activationStatusQueryFunction({
  queryKey: [{ address }],
}: QueryFunctionArgs<typeof activationStatusQueryKey>): Promise<boolean> {
  try {
    const preference = delegationPreference({ address });
    return preference.enabled;
  } catch (e) {
    logger.error(new RainbowError('activationStatusQueryFunction: '), {
      message: (e as Error)?.message,
    });
    // Default to false if there's an error
    return false;
  }
}

type ActivationStatusQueryResult = QueryFunctionResult<
  typeof activationStatusQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useActivationStatus(
  { address }: ActivationStatusQueryArgs,
  config: QueryConfig<
    ActivationStatusQueryResult,
    Error,
    ActivationStatusQueryResult,
    ActivationStatusQueryKey
  > = {},
) {
  const { enabled: queryEnabled, ...restConfig } = config;
  const enabled =
    remoteConfig.delegation_enabled && (queryEnabled ?? true) && !!address;

  return useQuery({
    queryKey: activationStatusQueryKey({ address }),
    queryFn: activationStatusQueryFunction,
    ...restConfig,
    enabled,
  });
}

// ///////////////////////////////////////////////
// Mutation Function

export async function toggleSmartWalletActivation({
  address,
}: {
  address: Address;
}): Promise<boolean> {
  try {
    // Get current preference and toggle it
    const preference = delegationPreference({ address });
    const newStatus = !preference.enabled;
    preference.setPreference(newStatus);
    // Invalidate the activation status query to refetch
    await queryClient.invalidateQueries({
      queryKey: activationStatusQueryKey({ address }),
    });
    return newStatus;
  } catch (e) {
    logger.error(new RainbowError('toggleSmartWalletActivation: '), {
      message: (e as Error)?.message,
    });
    throw e;
  }
}
