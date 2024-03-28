import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';
import { getProvider } from '@wagmi/core';

import { i18n } from '~/core/languages';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { methodRegistryLookupAndParse } from '~/core/utils/methodRegistry';
import { RainbowError, logger } from '~/logger';

// ///////////////////////////////////////////////
// Query Types

export type RegistryLookupArgs = {
  data: string | null;
  to: string | null;
  chainId: ChainId;
  hash: string | null;
};

// ///////////////////////////////////////////////
// Query Key

const registryLookupQueryKey = ({
  data,
  to,
  chainId,
  hash,
}: RegistryLookupArgs) =>
  createQueryKey(
    'registryLookup',
    { data, to, chainId, hash },
    { persisterVersion: 1 },
  );

type RegistryLookupQueryKey = ReturnType<typeof registryLookupQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function registryLookupQueryFunction({
  queryKey: [{ data, to, chainId, hash }],
}: QueryFunctionArgs<typeof registryLookupQueryKey>) {
  try {
    let dataToLookup = data;
    if (!to) {
      return i18n.t('approve_request.contract_deployment');
    }
    if ((!data || data === '0x') && hash) {
      const provider = getProvider({ chainId });
      const tx = await provider.getTransaction(hash);
      dataToLookup = tx?.data;
    }
    if (!dataToLookup || dataToLookup === '0x' || dataToLookup.length < 10) {
      return '';
    }
    const methodSignaturePrefix = dataToLookup?.substr(0, 10);

    const { name } = await methodRegistryLookupAndParse(
      methodSignaturePrefix,
      to as Address,
    );
    return name;
  } catch (e) {
    logger.error(new RainbowError('registryLookUpQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return '';
  }
}

type RegistryLookupResult = QueryFunctionResult<
  typeof registryLookupQueryFunction
>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchRegistryLookup(
  { data, to, chainId, hash }: RegistryLookupArgs,
  config: QueryConfig<
    RegistryLookupResult,
    Error,
    RegistryLookupResult,
    RegistryLookupQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    registryLookupQueryKey({ data, to, chainId, hash }),
    registryLookupQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useRegistryLookup(
  { data, to, chainId, hash }: RegistryLookupArgs,
  config: QueryConfig<
    RegistryLookupResult,
    Error,
    RegistryLookupResult,
    RegistryLookupQueryKey
  > = {},
) {
  return useQuery(
    registryLookupQueryKey({ data, to, chainId, hash }),
    registryLookupQueryFunction,
    config,
  );
}
