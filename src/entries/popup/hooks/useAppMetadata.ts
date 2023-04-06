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
  const hardcodedDappInfo = getHardcodedDappInformation(appHostName);
  const appHost = url ? getDappHost(url) : '';
  const appLogo = url
    ? hardcodedDappInfo?.uri || getPublicAppIcon(appHost)
    : '';
  const appName = url ? hardcodedDappInfo?.name || title : '';

  return {
    appHost,
    appHostName,
    appName,
    appLogo,
  };
}
