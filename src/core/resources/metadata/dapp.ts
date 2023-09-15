import { useQuery } from '@tanstack/react-query';

import { metadataClient } from '~/core/graphql';
import { QueryFunctionArgs, createQueryKey } from '~/core/react-query';
import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  getPublicAppIcon,
  isValidUrl,
} from '~/core/utils/connectedApps';
import { capitalize } from '~/core/utils/strings';

export interface DappMetadata {
  url: string;
  appHost: string;
  appHostName: string;
  appName: string;
  appShortName: string;
  appLogo: string;
}

// ///////////////////////////////////////////////
// Query Types

export type DappMetadataArgs = {
  url?: string;
};

// ///////////////////////////////////////////////
// Query Key

const AppMetadataQueryKey = ({ url }: DappMetadataArgs) =>
  createQueryKey('dappMetadata', { url }, { persisterVersion: 1 });

type AppMetadataQueryKey = ReturnType<typeof AppMetadataQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function dappMetadataQueryFunction({
  queryKey: [{ url }],
}: QueryFunctionArgs<
  typeof AppMetadataQueryKey
>): Promise<DappMetadata | null> {
  if (!url) return null;
  const appHostName = url && isValidUrl(url) ? getDappHostname(url) : '';
  const appName =
    url && isValidUrl(url)
      ? getHardcodedDappInformation(appHostName)?.name || ''
      : '';
  const response = await metadataClient.dApp({
    shortName: appName,
    url,
  });

  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  const appLogo = appHost ? getPublicAppIcon(appHost) : '';

  return {
    url,
    appHost,
    appHostName,
    appName: response?.dApp?.name ? capitalize(response?.dApp?.name) : appName,
    appShortName: response?.dApp?.name
      ? capitalize(response?.dApp?.shortName)
      : appName,
    appLogo: response?.dApp?.iconURL || appLogo,
  };
}

// ///////////////////////////////////////////////
// Query Hook

export function useDappMetadata({ url }: DappMetadataArgs) {
  return useQuery(AppMetadataQueryKey({ url }), dappMetadataQueryFunction, {
    cacheTime: 1000 * 60 * 60 * 24,
  });
}
