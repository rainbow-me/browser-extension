import { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';

const messenger = initializeMessenger({ connect: 'inpage' });

export function useAppSessions() {
  const appSessions = useAppSessionsStore.use.appSessions();
  const clearSessions = useAppSessionsStore.use.clearSessions();
  const removeAppSession = useAppSessionsStore.use.removeAppSession();
  const clearAppHasInteractedWithNudgeSheet =
    useAppConnectionWalletSwitcherStore.use.clearAppHasInteractedWithNudgeSheet();

  const disconnectAppSessions = useCallback(() => {
    Object.values(appSessions).map((session) => {
      removeAppSession({ host: session.host });
      clearAppHasInteractedWithNudgeSheet({
        host: session.host,
      });
      isValidUrl(session?.url) &&
        messenger.send(`disconnect:${getDappHost(session.url)}`, null);
    });
    clearSessions();
  }, [
    appSessions,
    clearAppHasInteractedWithNudgeSheet,
    clearSessions,
    removeAppSession,
  ]);

  return {
    appSessions,
    disconnectAppSessions,
  };
}
