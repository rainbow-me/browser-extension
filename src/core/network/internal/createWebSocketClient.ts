import { io, ManagerOptions } from 'socket.io-client';

export function createWebSocketClient({
  baseUrl,
  headers,
  query,
}: {
  baseUrl: string;
  headers?: ManagerOptions['extraHeaders'];
  query?: ManagerOptions['query'];
}) {
  return io(baseUrl, {
    extraHeaders: headers,
    query,
    transports: ['websocket'],
  });
}
