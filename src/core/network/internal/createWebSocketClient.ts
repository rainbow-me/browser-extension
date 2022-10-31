import { ManagerOptions, io } from 'socket.io-client';

export function createWebSocketClient({
  baseUrl,
  query,
}: {
  baseUrl: string;
  query?: ManagerOptions['query'];
}) {
  return io(baseUrl, {
    query,
    transports: ['websocket'],
  });
}
