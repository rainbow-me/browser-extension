import { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { getDappHost } from '~/core/utils/connectedApps';

const messenger = initializeMessenger({ connect: 'inpage' });

export function useAppSessions() {
  const { appSessions, clearSessions } = useAppSessionsStore();

  const disconnectAppSessions = useCallback(() => {
    Object.values(appSessions).map((session) =>
      messenger.send(`disconnect:${getDappHost(session.url)}`, null),
    );
    clearSessions();
  }, [appSessions, clearSessions]);

  return {
    appSessions,
    disconnectAppSessions,
  };
}
