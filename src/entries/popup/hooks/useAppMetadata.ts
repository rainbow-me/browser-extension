import { useDappMetadata } from '~/core/resources/metadata/dapp';
import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  getPublicAppIcon,
  isValidUrl,
} from '~/core/utils/connectedApps';
import { capitalize } from '~/core/utils/strings';

interface AppMetadataProps {
  url?: string;
  title?: string;
}

export interface AppMetadata {
  appHost: string;
  appHostName: string;
  appName: string;
  appShortName: string;
  appLogo: string;
  url?: string;
}

export function useAppMetadata({ url, title }: AppMetadataProps): AppMetadata {
  const appHostName = url && isValidUrl(url) ? getDappHostname(url) : '';
  const appName =
    url && isValidUrl(url)
      ? getHardcodedDappInformation(appHostName)?.name || title || ''
      : '';
  const { data: dappMetadata } = useDappMetadata({
    shortName: appName?.toLowerCase(),
    url: url || '',
  });

  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  const appLogo = appHost ? getPublicAppIcon(appHost) : '';

  return {
    url,
    appHost,
    appHostName,
    appName: dappMetadata?.dApp?.name
      ? capitalize(dappMetadata?.dApp?.name)
      : appName,
    appShortName: dappMetadata?.dApp?.name
      ? capitalize(dappMetadata?.dApp?.shortName)
      : appName,
    appLogo: dappMetadata?.dApp?.iconURL || appLogo,
  };
}
