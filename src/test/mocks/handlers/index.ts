import { ahaHandlers } from './aha';
import { swapHandlers } from './swap';

export const handlers = [...swapHandlers, ...ahaHandlers];
