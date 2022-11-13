import {
  dappLogoOverride,
  dappNameOverride,
  getDappHost,
  getDappHostname,
} from '~/core/utils/connectedApps';

interface AppMetadata {
  url: string;
  title?: string;
}

export function useAppMetadata({ url, title }: AppMetadata) {
  const appHostName = url ? getDappHostname(url) : '';
  const host = url ? getDappHost(url) : '';
  const appLogo = url ? dappLogoOverride(url) : '';
  const appName = url ? dappNameOverride(url) || title : '';

  return {
    host,
    appHostName,
    appName,
    appLogo,
  };
}
