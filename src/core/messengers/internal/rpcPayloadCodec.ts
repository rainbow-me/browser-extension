import {
  StandardRPCJsonSerializer,
  StandardRPCSerializer,
} from '@orpc/client/standard';

/**
 * Chrome extension messaging (`runtime.sendMessage`, `tabs.sendMessage`, etc.)
 * only reliably carries JSON-serializable data. This codec uses the same
 * bigint/Date/Map/Set/… handling as oRPC's standard RPC serializer.
 */
const serializer = new StandardRPCSerializer(new StandardRPCJsonSerializer());

function isEncodedRpcEnvelope(
  data: unknown,
): data is { json: unknown; meta?: unknown } {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  if (!('json' in record)) return false;
  for (const key of Object.keys(record)) {
    if (key !== 'json' && key !== 'meta') return false;
  }
  return true;
}

export function encodeExtensionRpcPayload<T>(data: T) {
  const encoded = serializer.serialize(data);
  if (encoded instanceof FormData) {
    throw new Error(
      'Messenger payloads that include Blob (FormData) are not supported',
    );
  }
  return encoded;
}

export function decodeExtensionRpcPayload<T>(data: unknown): T {
  if (!isEncodedRpcEnvelope(data)) {
    return data as T;
  }
  return serializer.deserialize(data) as T;
}
