import { bridgeMessenger } from '../messengers';
import {
  RequestArguments,
  RequestResponse,
} from '../providers/RainbowProvider';

import { createTransport } from './internal/createTransport';

type ProviderRequestPayload = RequestArguments & { id: number };
type ProviderResponse = RequestResponse;

/**
 * Creates a transport that can be used to send and receive RPC messages between
 * extension scripts (commonly inpage <-> background entries).
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#3b63e155df6a4b71b0e6e74f7a2c416b
 */
export const providerRequestTransport = createTransport<
  ProviderRequestPayload,
  ProviderResponse
>({
  messenger: bridgeMessenger,
  topic: 'providerRequest',
});
