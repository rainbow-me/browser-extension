import { useAppSessionsStore } from '~/core/state';

export const useAppSessionsQuery = () => {
  return useAppSessionsStore((s) => s.appSessions);
};

export const useActiveSessionQuery = (host: string) => {
  return useAppSessionsStore((s) => s.getActiveSession({ host }));
};

export const useAppSessionQuery = (host: string) => {
  const sessions = useAppSessionsQuery();
  return sessions?.[host];
};
