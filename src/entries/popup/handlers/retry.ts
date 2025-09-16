type AllowPromise<T> = T | Promise<T>;

export const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function retry<T>(
  fn: () => AllowPromise<T>,
  maxTimes: number,
  wait: (retry: number) => Promise<void>,
): Promise<T> {
  let error;
  for (let i = 0; i < maxTimes; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (e) {
      error = e;
      // eslint-disable-next-line no-await-in-loop
      await wait(1 + i);
    }
  }
  throw error;
}

type AllowCleanUpFunction = void | (() => void);

/**
 * Creates a port and recreates a new port if the old one disconnects
 *
 * @param createPort - function to create a port
 * @param onConnect - callback when connected
 */
export async function autoConnect(
  createPort: () => chrome.runtime.Port,
  onConnect: (port: chrome.runtime.Port) => AllowCleanUpFunction,
) {
  const port = await retry(
    createPort,
    3, // 3 retries plus the initial try, so 4 total tries
    (retry) => wait(retry * 100), // 100ms, 200ms, 300ms, max total wait 600ms
  );
  console.log('Port connected');
  const cleanUp = onConnect(port);
  const handler = () => {
    cleanUp?.();
    console.log('Port disconnected, reconnecting...');
    port.onDisconnect.removeListener(handler);
    void autoConnect(createPort, onConnect);
  };
  port.onDisconnect.addListener(handler);
}

/**
 * Reconnects a port if it disconnects
 * @param port - port to reconnect
 * @param createPort - function to create a port
 * @param onConnect - callback when connected
 */
export function autoReconnect(
  port: chrome.runtime.Port,
  createPort: () => chrome.runtime.Port,
  onReconnect: (port: chrome.runtime.Port) => AllowCleanUpFunction,
) {
  const handler = () => {
    console.log('Port disconnected, reconnecting...');
    port.onDisconnect.removeListener(handler);
    void autoConnect(createPort, onReconnect);
  };
  port.onDisconnect.addListener(handler);
}
