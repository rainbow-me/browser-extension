import { isAddress } from '@ethersproject/address';
import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';

import { metadataClient } from '~/core/graphql';
import { QueryFunctionArgs, createQueryKey } from '~/core/react-query';

// ///////////////////////////////////////////////
// Query Types

export type ResolveEnsProfileArgs = {
  addressOrName: Address | string | undefined;
};

// ///////////////////////////////////////////////
// Query Key

const ResolveEnsProfileQueryKey = ({ addressOrName }: ResolveEnsProfileArgs) =>
  createQueryKey(
    'resolveEnsProfile',
    { addressOrName },
    { persisterVersion: 1 },
  );

type ResolveEnsProfileQueryKey = ReturnType<typeof ResolveEnsProfileQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function reverseResolve(address: Address) {
  try {
    const response = await metadataClient.reverseResolveENSProfile({
      chainId: 1,
      address,
      fields: ['avatar'],
    });

    if (response?.reverseResolveENSProfile?.fields?.length) {
      return response.reverseResolveENSProfile.fields[0].value;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function resolve(name: string) {
  try {
    const response = await metadataClient.resolveENSProfile({
      chainId: 1,
      name,
      fields: ['avatar'],
    });

    if (response?.resolveENSProfile?.fields?.length) {
      return response.resolveENSProfile.fields[0].value;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const resolveEnsAvatar = ({
  addressOrName,
}: {
  addressOrName?: string;
}) => {
  if (!addressOrName) return null;
  return isAddress(addressOrName)
    ? reverseResolve(addressOrName)
    : resolve(addressOrName);
};

export async function resolveEnsProfileQueryFunction({
  queryKey: [{ addressOrName }],
}: QueryFunctionArgs<typeof ResolveEnsProfileQueryKey>) {
  return resolveEnsAvatar({ addressOrName });
}

// ///////////////////////////////////////////////
// Query Hook

export function useENSAvatar({ addressOrName }: ResolveEnsProfileArgs) {
  return useQuery(
    ResolveEnsProfileQueryKey({ addressOrName }),
    resolveEnsProfileQueryFunction,
    {
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );
}
