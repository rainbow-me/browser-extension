import { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';

const messenger = initializeMessenger({ connect: 'inpage' });

export function useAppSessions() {
  const { appSessions, clearSessions } = useAppSessionsStore();

  const disconnectAppSessions = useCallback(() => {
    Object.values(appSessions).map(
      (session) =>
        isValidUrl(session?.url) &&
        messenger.send(`disconnect:${getDappHost(session.url)}`, null),
    );
    clearSessions();
  }, [appSessions, clearSessions]);

  return {
    appSessions,
    disconnectAppSessions,
  };
}
