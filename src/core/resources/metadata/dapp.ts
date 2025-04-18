import { useQuery } from '@tanstack/react-query';

import { metadataClient } from '~/core/graphql';
import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import {
  QueryFunctionArgs,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { useDappMetadataStore } from '~/core/state/dappMetadata';
import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  isValidUrl,
} from '~/core/utils/connectedApps';
import { capitalize } from '~/core/utils/strings';

export interface DappMetadata {
  url: string;
  appHost: string;
  appHostName: string;
  appName: string;
  appShortName: string;
  appLogo?: string;
  timestamp?: number;
  status?: DAppStatus;
}

// ///////////////////////////////////////////////
// Query Types

type DappMetadataArgs = {
  url?: string;
};

// ///////////////////////////////////////////////
// Query Key

const DappMetadataQueryKey = ({ url }: DappMetadataArgs) =>
  createQueryKey('dappMetadata', { url }, { persisterVersion: 1 });

type DappMetadataQueryKey = ReturnType<typeof DappMetadataQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function fetchDappMetadata({
  url,
  status,
}: {
  url: string;
  status: boolean;
}) {
  const appHostName = url && isValidUrl(url) ? getDappHostname(url) : '';
  const hardcodedAppName =
    url && isValidUrl(url)
      ? getHardcodedDappInformation(appHostName)?.name || ''
      : '';

  const response = await metadataClient.dApp({
    shortName: hardcodedAppName,
    url,
    status,
  });

  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  const appName = response?.dApp?.name
    ? capitalize(response?.dApp?.name)
    : hardcodedAppName || appHost;
  const appShortName = response?.dApp?.shortName
    ? capitalize(response?.dApp?.shortName)
    : appName;
  const dappMetadata = {
    url,
    appHost,
    appHostName,
    appName,
    appShortName,
    appLogo: response?.dApp?.iconURL,
    status: response.dApp?.status,
  };
  return dappMetadata;
}

export async function dappMetadataQueryFunction({
  queryKey: [{ url }],
}: QueryFunctionArgs<
  typeof DappMetadataQueryKey
>): Promise<DappMetadata | null> {
  if (!url) return null;
  const { setDappMetadata } = useDappMetadataStore.getState();
  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  const dappMetadata = await fetchDappMetadata({ url, status: true });
  setDappMetadata({ host: appHost, dappMetadata });
  return dappMetadata;
}

export async function prefetchDappMetadata({ url }: { url: string }) {
  const { dappMetadata } = useDappMetadataStore.getState();
  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  if (!dappMetadata[appHost]) {
    queryClient.prefetchQuery({
      queryKey: DappMetadataQueryKey({ url }),
      queryFn: () => fetchDappMetadata({ url, status: false }),
      staleTime: 60000,
    });
  }
}

// ///////////////////////////////////////////////
// Query Hook

export function useDappMetadata({ url }: DappMetadataArgs) {
  return useQuery({
    queryKey: DappMetadataQueryKey({ url }),
    queryFn: dappMetadataQueryFunction,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: () => {
      const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
      const { getDappMetadata } = useDappMetadataStore.getState();
      return getDappMetadata({ host: appHost });
    },
    enabled: !!url,
  });
}
