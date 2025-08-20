import { EventPublisher } from '@orpc/server';

// Types for the event publishers
interface HWRequest {
  requestId: string;
  action: 'signTransaction' | 'signMessage' | 'signTypedData';
  vendor: 'Ledger' | 'Trezor';
  payload: unknown;
}

interface HWResponse {
  requestId: string;
  result: string | { error: string };
}

// Global event publishers for hardware wallet communication
export const hwRequestPublisher = new EventPublisher<{
  'hw-request': HWRequest;
}>();

export const hwResponsePublisher = new EventPublisher<{
  'hw-response': HWResponse;
}>();
