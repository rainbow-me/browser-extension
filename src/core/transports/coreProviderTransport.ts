import { bridgeMessenger } from '../messengers';
import {
  RequestArguments,
  RequestResponse,
} from '../providers/RainbowProvider';
import { createTransport } from './internal/createTransport';

type ProviderRequestPayload = RequestArguments & { id: number };
type ProviderResponse = RequestResponse;

export const coreProviderTransport = createTransport<
  ProviderRequestPayload,
  ProviderResponse
>({
  messenger: bridgeMessenger,
  topic: 'coreProviderTransport',
});
