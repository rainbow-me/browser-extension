import { logger } from '~/logger';

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
 * @param id - identifier for debug context
 * @param createPort - function to create a port
 * @param onConnect - callback when connected
 */
export async function autoConnect(
  id: string,
  createPort: () => chrome.runtime.Port,
  onConnect: (port: chrome.runtime.Port) => AllowCleanUpFunction,
) {
  const port = await retry(
    createPort,
    3, // 3 retries plus the initial try, so 4 total tries
    (retry) => wait(retry * 100), // 100ms, 200ms, 300ms, max total wait 600ms
  );
  logger.info(`[${id}] Port ${port} connected`);
  const cleanUp = onConnect(port);
  const handler = () => {
    cleanUp?.();
    logger.info(`[${id}] Port ${port} disconnected, reconnecting...`);
    port.onDisconnect.removeListener(handler);
    void autoConnect(id, createPort, onConnect);
  };
  port.onDisconnect.addListener(handler);
}

/**
 * Reconnects a port if it disconnects
 * @param id - identifier for debug context
 * @param port - port to reconnect
 * @param createPort - function to create a port
 * @param onConnect - callback when connected
 */
export function autoReconnect(
  id: string,
  port: chrome.runtime.Port,
  createPort: () => chrome.runtime.Port,
  onReconnect: (port: chrome.runtime.Port) => AllowCleanUpFunction,
) {
  const handler = () => {
    logger.info(`[${id}] Port ${port} disconnected, reconnecting...`);
    port.onDisconnect.removeListener(handler);
    void autoConnect(id, createPort, onReconnect);
  };
  port.onDisconnect.addListener(handler);
}
