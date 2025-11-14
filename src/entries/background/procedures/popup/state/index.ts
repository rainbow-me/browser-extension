import { rainbowRouter } from './rainbow';
import { requestsRouter } from './requests';
import { sessionsRouter } from './sessions';
import { viemRouter } from './viem';

export const stateRouter = {
  rainbow: rainbowRouter,
  requests: requestsRouter,
  sessions: sessionsRouter,
  viem: viemRouter,
};
