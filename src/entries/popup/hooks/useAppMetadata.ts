import {
  dappLogoOverride,
  dappNameOverride,
  getDappHostname,
} from '~/core/utils/connectedApps';

interface AppMetadata {
  url: string;
}

export function useAppMetadata({ url }: AppMetadata) {
  const appHostName = getDappHostname(url);
  const appLogo = dappLogoOverride(url);
  const appName = dappNameOverride(url);

  return {
    appHostName,
    appName,
    appLogo,
  };
}
