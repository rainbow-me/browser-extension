/**
 * Types for provider request handling (replacing @rainbow-me/provider)
 */

/** Message sender from chrome.runtime / window.postMessage (url, tab) */
export type IMessageSender = {
  url?: string;
  tab?: { id?: number; title?: string };
};

export type AddEthereumChainProposedChain = {
  chainId: string;
  rpcUrls: string[];
  chainName: string;
  iconUrls?: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
};

export type ProviderRequestMeta = {
  sender: {
    url?: string;
    tab?: { id?: number; title?: string };
  };
  topic?: string;
  id?: number | string;
};

export type ProviderRequestPayload = {
  id: number;
  method: string;
  params?: unknown[];
  meta?: ProviderRequestMeta;
};

export type ProviderResponse =
  | { id: number; result: unknown }
  | { id: number; error: { name: string; message: string; code: number } };
