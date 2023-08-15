import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  getPublicAppIcon,
  isValidUrl,
} from '~/core/utils/connectedApps';

interface AppMetadataProps {
  url?: string;
  title?: string;
}

export interface AppMetadata {
  appHost: string;
  appHostName: string;
  appName: string;
  appLogo: string;
  appColor: string;
}

export function useAppMetadata({ url, title }: AppMetadataProps) {
  const appHostName = url && isValidUrl(url) ? getDappHostname(url) : '';
  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  const appLogo = appHost ? getPublicAppIcon(appHost) : '';
  const appName =
    url && isValidUrl(url)
      ? getHardcodedDappInformation(appHostName)?.name || title
      : '';

  return {
    appHost,
    appHostName,
    appName,
    appLogo,
  };
}
