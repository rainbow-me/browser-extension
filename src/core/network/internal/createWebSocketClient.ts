import { ManagerOptions, io } from 'socket.io-client';

export function createWebSocketClient({
  baseUrl,
  headers,
  path,
  query,
}: {
  baseUrl: string;
  headers: ManagerOptions['extraHeaders'];
  path: ManagerOptions['path'];
  query?: ManagerOptions['query'];
}) {
  return io(baseUrl, {
    query,
    extraHeaders: headers,
    path,
    transports: ['websocket'],
  });
}
