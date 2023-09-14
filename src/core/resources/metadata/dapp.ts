import { useQuery } from '@tanstack/react-query';

import { metadataClient } from '~/core/graphql';
import { QueryFunctionArgs, createQueryKey } from '~/core/react-query';

// ///////////////////////////////////////////////
// Query Types

export type ResolveEnsProfileArgs = {
  shortName: string;
  url: string;
};

// ///////////////////////////////////////////////
// Query Key

const AppMetadataQueryKey = ({ shortName, url }: ResolveEnsProfileArgs) =>
  createQueryKey('dappMetadata', { shortName, url }, { persisterVersion: 1 });

type AppMetadataQueryKey = ReturnType<typeof AppMetadataQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function dappMetadataQueryFunction({
  queryKey: [{ shortName, url }],
}: QueryFunctionArgs<typeof AppMetadataQueryKey>) {
  const response = await metadataClient.dApp({
    shortName,
    url,
  });

  return response;
}

// ///////////////////////////////////////////////
// Query Hook

export function useDappMetadata({ shortName, url }: ResolveEnsProfileArgs) {
  return useQuery(
    AppMetadataQueryKey({ shortName, url }),
    dappMetadataQueryFunction,
    {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  );
}
