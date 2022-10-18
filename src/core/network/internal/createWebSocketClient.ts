export function createWebSocketClient({ baseUrl }: { baseUrl: string }) {
  return new WebSocket(baseUrl);
}
