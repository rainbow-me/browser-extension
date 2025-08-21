import { rainbowRouter } from './rainbow';
import { requestsRouter } from './requests';
import { sessionsRouter } from './sessions';
import { wagmiRouter } from './wagmi';

export const stateRouter = {
  rainbow: rainbowRouter,
  requests: requestsRouter,
  sessions: sessionsRouter,
  wagmi: wagmiRouter,
};
