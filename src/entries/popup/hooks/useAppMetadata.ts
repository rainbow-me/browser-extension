import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  getPublicAppIcon,
  isValidUrl,
} from '~/core/utils/connectedApps';

// import { useDominantColor } from './useDominantColor';

interface AppMetadata {
  url?: string;
  title?: string;
}

export function useAppMetadata({ url, title }: AppMetadata) {
  const appHostName = url && isValidUrl(url) ? getDappHostname(url) : '';
  const appHost = url && isValidUrl(url) ? getDappHost(url) : '';
  const appLogo = appHost ? getPublicAppIcon(appHost) : '';
  const appName = appHostName
    ? getHardcodedDappInformation(appHostName)?.name || title
    : '';
  // const { data: appColor } = useDominantColor({
  //   imageUrl: appLogo ?? undefined,
  // });

  return {
    appHost,
    appHostName,
    appName,
    appLogo,
    // appColor,
  };
}
