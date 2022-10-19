import { bridgeMessenger } from '../messengers';
import { createTransport } from './internal/createTransport';
import { BackgroundStoreState } from '../state/backgroundStore';

type backgroundStorePayload = BackgroundStoreState;
type backgroundStoreResponse = void;

export const backgroundStoreTransport = createTransport<
  backgroundStorePayload,
  backgroundStoreResponse
>({
  messenger: bridgeMessenger,
  topic: 'background-store',
});
