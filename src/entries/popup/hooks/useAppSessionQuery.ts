import { useQuery } from '@tanstack/react-query';

import { popupClientQueryUtils } from '~/entries/popup/handlers/background';

export const useAppSessionsQuery = () => {
  return useQuery(
    popupClientQueryUtils.state.sessions.getAppSessions.queryOptions({}),
  );
};

export const useActiveSessionQuery = (host: string) => {
  return useQuery(
    popupClientQueryUtils.state.sessions.getActiveSession.queryOptions({
      input: { host },
    }),
  );
};

export const useAppSessionQuery = (host: string) => {
  const sessions = useAppSessionsQuery();
  return sessions.data?.[host];
};
