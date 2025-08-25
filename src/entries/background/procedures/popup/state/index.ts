import { requestsRouter } from './requests';
import { sessionsRouter } from './sessions';

export const stateRouter = {
  requests: requestsRouter,
  sessions: sessionsRouter,
};
