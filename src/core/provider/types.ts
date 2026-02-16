/**
 * Provider types - minimal types for browser extension provider
 *
 * Uses viem types where possible.
 */

import type { Chain } from 'viem';

/**
 * Request arguments for provider.request()
 */
export interface RequestArguments {
  method: string;
  params?: unknown[];
}

/**
 * Error response from provider
 */
export interface RequestError {
  name: string;
  message?: string;
  code?: number;
}

/**
 * Response from provider.request()
 */
export interface RequestResponse {
  id: number;
  error?: RequestError;
  jsonrpc?: string;
  result?: unknown;
}

/**
 * Tab info from browser extension
 */
export interface Tab {
  title?: string;
  id?: number;
}

/**
 * Message sender info
 */
export interface IMessageSender {
  url?: string;
  tab?: Tab;
}

/**
 * Callback options for message handlers
 */
export interface CallbackOptions {
  sender: IMessageSender;
  topic: string;
  id?: number | string;
}

/**
 * Provider request payload (extends RequestArguments with metadata)
 */
export interface ProviderRequestPayload extends RequestArguments {
  id: number;
  meta?: CallbackOptions;
}

/**
 * Chain ID as hex string
 */
export type ChainIdHex = `0x${string}`;

/**
 * Proposed chain for wallet_addEthereumChain
 */
export interface AddEthereumChainProposedChain extends Chain {
  chainId: string;
  chainName: string;
}
