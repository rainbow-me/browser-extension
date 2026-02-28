/**
 * Inpage Events - Event forwarding from background to inpage via viem-portal
 *
 * Uses viem-portal's push method to send events to inpage.
 * This replaces the old chrome.tabs.sendMessage approach.
 */

import type { Address } from 'viem';
import type { PortalHost } from 'viem-portal';

import type { ProviderSchema } from '~/core/provider/handleProviderPortal';

/**
 * Get the portal host instance for pushing events
 */
function getPortalHost(): PortalHost<ProviderSchema> | null {
  try {
    const {
      startPortalHost,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require('~/entries/background/handlers/handlePortalHost');
    return startPortalHost();
  } catch {
    return null;
  }
}

/**
 * Send accountsChanged event to inpage via viem-portal
 */
export async function sendAccountsChangedEvent(
  _host: string,
  accounts: Address[],
): Promise<void> {
  const host = getPortalHost();
  if (!host) return;

  try {
    host.push('accountsChanged', accounts);
  } catch {
    // Portal host not available, ignore
  }
}

/**
 * Send chainChanged event to inpage via viem-portal
 */
export async function sendChainChangedEvent(
  _host: string,
  chainId: number,
): Promise<void> {
  const host = getPortalHost();
  if (!host) return;

  try {
    host.push('chainChanged', `0x${chainId.toString(16)}`);
  } catch {
    // Portal host not available, ignore
  }
}

/**
 * Send connect event to inpage via viem-portal
 */
export async function sendConnectEvent(
  _host: string,
  chainId: number,
): Promise<void> {
  const host = getPortalHost();
  if (!host) return;

  try {
    host.push('connect', { chainId: `0x${chainId.toString(16)}` });
  } catch {
    // Portal host not available, ignore
  }
}

/**
 * Send disconnect event to inpage via viem-portal
 */
export async function sendDisconnectEvent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _host: string,
): Promise<void> {
  const host = getPortalHost();
  if (!host) return;

  try {
    host.push('disconnect', []);
  } catch {
    // Portal host not available, ignore
  }
}

/**
 * Send setDefaultProvider event to all tabs
 * Note: This still uses chrome.tabs as it's broadcast to all tabs
 */
export async function sendSetDefaultProviderEvent(
  rainbowAsDefault: boolean,
): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({});
    const sendMessagePromises = [];
    for (const tab of tabs) {
      if (tab.id && tab.url?.startsWith('http')) {
        try {
          sendMessagePromises.push(
            chrome.tabs.sendMessage(tab.id, {
              type: 'rainbow_setDefaultProvider',
              data: { rainbowAsDefault },
            }),
          );
        } catch {
          // Tab might not have content script, ignore
        }
      }
    }
    await Promise.allSettled(sendMessagePromises);
  } catch {
    // Chrome API not available
  }
}

/**
 * Send ethereumChainEvent to inpage via viem-portal
 */
export async function sendEthereumChainEvent(
  _host: string,
  event: {
    host: string;
    chainId: number;
    chainName: string;
    status: string;
    extensionUrl: string;
  },
): Promise<void> {
  const host = getPortalHost();
  if (!host) return;

  try {
    host.push('ethereumChainEvent', event);
  } catch {
    // Portal host not available, ignore
  }
}
