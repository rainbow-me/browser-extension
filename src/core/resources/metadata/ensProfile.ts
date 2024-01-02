import { isAddress } from '@ethersproject/address';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { metadataClient } from '~/core/graphql';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';

type EnsProfileField =
  | 'avatar'
  | 'header'
  | 'com.twitter'
  | 'description'
  | 'url';
type EnsProfileResponseFieldsValue =
  | {
      key: string;
      value: string;
    }[]
  | undefined;
const ensProfileFields: EnsProfileField[] = [
  'avatar',
  'com.twitter',
  'description',
  'header',
  'url',
];

// ///////////////////////////////////////////////
// Query Types

export type EnsProfileArgs = {
  addressOrName: Address | string | undefined;
};

// ///////////////////////////////////////////////
// Query Key

const EnsProfileQueryKey = ({ addressOrName }: EnsProfileArgs) =>
  createQueryKey('ensProfile', { addressOrName }, { persisterVersion: 1 });

type EnsProfileQueryKey = ReturnType<typeof EnsProfileQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function reverseResolveEnsProfile(address: Address) {
  try {
    const response = await metadataClient.reverseResolveENSProfile({
      chainId: 1,
      address,
      fields: ensProfileFields,
    });
    const fields: EnsProfileResponseFieldsValue =
      response?.reverseResolveENSProfile?.fields;

    // keys that are not set in the profile will be returned as empty strings
    if (fields && fields.length) {
      return fields.reduce(
        (returnValue, field) => {
          if (field.value !== '') {
            returnValue[field.key] = field.value;
          }
          return returnValue;
        },
        {} as Record<string, string>,
      );
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function resolveEnsProfile(name: string) {
  try {
    const response = await metadataClient.resolveENSProfile({
      chainId: 1,
      name,
      fields: ensProfileFields,
    });
    const fields = response.resolveENSProfile?.fields;

    // keys that are not set in the profile will be returned as empty strings
    if (fields && fields.length) {
      return fields.reduce(
        (returnValue, field) => {
          if (field.value !== '') {
            returnValue[field.key] = field.value;
          }
          return returnValue;
        },
        {} as Record<string, string>,
      );
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const fetchEnsProfile = ({
  addressOrName,
}: {
  addressOrName?: string;
}) => {
  if (!addressOrName) return null;
  return isAddress(addressOrName)
    ? reverseResolveEnsProfile(addressOrName)
    : resolveEnsProfile(addressOrName);
};

type EnsProfileResult = QueryFunctionResult<typeof fetchEnsProfile>;

export async function resolveEnsProfileQueryFunction({
  queryKey: [{ addressOrName }],
}: QueryFunctionArgs<typeof EnsProfileQueryKey>) {
  return fetchEnsProfile({ addressOrName });
}

// ///////////////////////////////////////////////
// Query Hook

export function useENSProfile<TSelectResult = EnsProfileResult>(
  { addressOrName }: EnsProfileArgs,
  config: QueryConfig<
    EnsProfileResult,
    Error,
    TSelectResult,
    EnsProfileQueryKey
  > = {},
) {
  return useQuery(
    EnsProfileQueryKey({ addressOrName }),
    resolveEnsProfileQueryFunction,
    {
      ...config,
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );
}
