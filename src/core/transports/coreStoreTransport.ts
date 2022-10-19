import { bridgeMessenger } from '../messengers';
import { createTransport } from './internal/createTransport';
import { CoreStoreState } from '../state/coreStore';

type coreStorePayload = CoreStoreState;
type coreStoreResponse = void;

export const coreStoreTransport = createTransport<
  coreStorePayload,
  coreStoreResponse
>({
  messenger: bridgeMessenger,
  topic: 'coreStore',
});
