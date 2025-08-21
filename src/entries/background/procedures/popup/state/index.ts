import { requestsRouter } from './requests';
import { sessionsRouter } from './sessions';
import { wagmiRouter } from './wagmi';

export const stateRouter = {
  requests: requestsRouter,
  sessions: sessionsRouter,
  wagmi: wagmiRouter,
};
