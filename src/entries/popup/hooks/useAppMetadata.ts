import { CallbackOptions } from '~/core/messengers/internal/createMessenger';
import {
  dappLogoOverride,
  dappNameOverride,
  getDappHostname,
} from '~/core/utils/connectedApps';

interface AppMetadata {
  meta?: CallbackOptions;
}

export function useAppMetadata({ meta }: AppMetadata) {
  const url = meta?.sender.url || '';
  const appHostName = getDappHostname(url);
  const appLogo = dappLogoOverride(url);
  const appName = dappNameOverride(url) || meta?.sender?.tab?.title;

  return {
    appHostName,
    appName,
    appLogo,
  };
}
