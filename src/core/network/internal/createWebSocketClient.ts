import io from 'socket.io-client';

export function createWebSocketClient({
  baseUrl,
  headers,
  query,
}: {
  baseUrl: string;
  headers?: SocketIOClient.ConnectOpts['transportOptions'];
  query?: SocketIOClient.ConnectOpts['query'];
}) {
  return io(baseUrl, {
    extraHeaders: headers,
    query,
    transports: ['websocket'],
  } as SocketIOClient.ConnectOpts);
}
