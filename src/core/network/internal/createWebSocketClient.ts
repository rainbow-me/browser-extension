import { io } from 'socket.io-client';

export function createWebSocketClient({ baseUrl }: { baseUrl: string }) {
  return io(baseUrl);
}
