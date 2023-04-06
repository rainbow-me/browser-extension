import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  getPublicAppIcon,
} from '~/core/utils/connectedApps';

interface AppMetadata {
  url?: string;
  title?: string;
}

export function useAppMetadata({ url, title }: AppMetadata) {
  const appHostName = url ? getDappHostname(url) : '';
  const appHost = url ? getDappHost(url) : '';
  const appLogo = url ? getPublicAppIcon(appHost) : '';
  const appName = url
    ? getHardcodedDappInformation(appHostName)?.name || title
    : '';

  return {
    appHost,
    appHostName,
    appName,
    appLogo,
  };
}
