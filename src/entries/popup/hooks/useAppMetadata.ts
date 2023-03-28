import {
  getConnectedAppIcon,
  getDappHost,
  getDappHostname,
} from '~/core/utils/connectedApps';

interface AppMetadata {
  url?: string;
  title?: string;
}

export function useAppMetadata({ url, title }: AppMetadata) {
  const appHostName = url ? getDappHostname(url) : '';
  const appHost = url ? getDappHost(url) : '';
  const appLogo = url ? getConnectedAppIcon(appHost) : '';
  const appName = url ? title : '';

  return {
    appHost,
    appHostName,
    appName,
    appLogo,
  };
}
