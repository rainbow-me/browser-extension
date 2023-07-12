import {
  getDappHost,
  getDappHostname,
  getHardcodedDappInformation,
  getPublicAppIcon,
} from '~/core/utils/connectedApps';

// import { useDominantColor } from './useDominantColor';

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
