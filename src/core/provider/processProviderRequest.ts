/**
 * Process provider requests for viem-portal migration.
 * Replicates logic from @rainbow-me/provider's handleProviderRequest.
 */
import type { Provider } from '@ethersproject/providers';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { isAddress, isHex } from 'viem';

import { getDappHost, isValidUrl } from '~/core/utils/connectedApps';
import { deriveChainIdByHostname } from '~/core/utils/deriveChainIdByHostname';
import { normalizeTransactionResponsePayload } from '~/core/utils/ethereum';
import { toHex } from '~/core/utils/hex';

import type {
  AddEthereumChainProposedChain,
  ProviderRequestMeta,
} from './types';

// EIP-1474 error codes
export const ProviderErrorCodes = {
  PARSE_ERROR: { code: -32700, name: 'Parse error' },
  INVALID_REQUEST: { code: -32600, name: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, name: 'Method not found' },
  INVALID_PARAMS: { code: -32602, name: 'Invalid params' },
  INTERNAL_ERROR: { code: -32603, name: 'Internal error' },
  INVALID_INPUT: { code: -32000, name: 'Invalid input' },
  TRANSACTION_REJECTED: { code: -32003, name: 'Transaction rejected' },
  METHOD_NOT_SUPPORTED: { code: -32004, name: 'Method not supported' },
  LIMIT_EXCEEDED: { code: -32005, name: 'Limit exceeded' },
} as const;

export type ProviderRequestInput = {
  id: number;
  method: string;
  params?: unknown[];
  meta?: ProviderRequestMeta;
};

export type ProviderSuccessResponse = { id: number; result: unknown };
export type ProviderErrorResponse = {
  id: number;
  error: { code: number; message: string; name?: string };
};
export type ProviderResponse = ProviderSuccessResponse | ProviderErrorResponse;

function buildError(
  id: number,
  message: string,
  errorCode: (typeof ProviderErrorCodes)[keyof typeof ProviderErrorCodes],
): ProviderErrorResponse {
  return {
    id,
    error: {
      name: errorCode.name,
      message,
      code: errorCode.code,
    },
  };
}

export type ProcessProviderRequestConfig = {
  getProvider: (opts: { chainId?: number }) => Provider;
  getActiveSession: (opts: {
    host: string;
  }) => { address: string; chainId: number } | null;
  getChainNativeCurrency: (chainId: number) => { symbol?: string } | undefined;
  isSupportedChain: (chainId: number) => boolean;
  getFeatureFlags: () => { custom_rpc?: boolean };
  checkRateLimit: (opts: {
    id: number;
    meta?: ProviderRequestMeta;
    method: string;
  }) => Promise<ProviderErrorResponse | undefined>;
  messengerProviderRequest: (request: ProviderRequestInput) => Promise<unknown>;
  onAddEthereumChain: (opts: {
    proposedChain: AddEthereumChainProposedChain;
    callbackOptions?: ProviderRequestMeta;
  }) => { chainAlreadyAdded: boolean };
  onSwitchEthereumChainNotSupported: (opts: {
    proposedChain: AddEthereumChainProposedChain;
    callbackOptions?: ProviderRequestMeta;
  }) => void;
  onSwitchEthereumChainSupported: (opts: {
    proposedChain: AddEthereumChainProposedChain;
    callbackOptions?: ProviderRequestMeta;
  }) => void;
  removeAppSession: (opts: { host: string }) => void;
};

export async function processProviderRequest(
  input: ProviderRequestInput,
  config: ProcessProviderRequestConfig,
): Promise<ProviderResponse> {
  const { id, method, params, meta } = input;
  const {
    getProvider,
    getActiveSession,
    getChainNativeCurrency,
    isSupportedChain,
    getFeatureFlags,
    checkRateLimit,
    messengerProviderRequest,
    onAddEthereumChain,
    onSwitchEthereumChainNotSupported,
    onSwitchEthereumChainSupported,
    removeAppSession,
  } = config;

  try {
    const rateLimited = await checkRateLimit({ id, meta, method });
    if (rateLimited) return rateLimited;

    const url = meta?.sender?.url ?? '';
    const host = (isValidUrl(url) && getDappHost(url)) || '';
    const activeSession = getActiveSession({ host });

    let response: unknown = null;

    switch (method) {
      case 'eth_chainId': {
        response = activeSession ? toHex(activeSession.chainId) : '0x1';
        break;
      }
      case 'eth_coinbase': {
        response = activeSession?.address?.toLowerCase() ?? '';
        break;
      }
      case 'eth_accounts': {
        response = activeSession ? [activeSession.address.toLowerCase()] : [];
        break;
      }
      case 'eth_blockNumber': {
        const provider = getProvider({ chainId: activeSession?.chainId });
        const blockNumber = await provider.getBlockNumber();
        response = toHex(blockNumber);
        break;
      }
      case 'eth_getBalance': {
        const p = params;
        const provider = getProvider({ chainId: activeSession?.chainId });
        const balance = await provider.getBalance(p?.[0] as string);
        response = toHex(balance);
        break;
      }
      case 'eth_getTransactionByHash': {
        const p = params;
        const provider = getProvider({ chainId: activeSession?.chainId });
        const transaction = await provider.getTransaction(p?.[0] as string);
        if (transaction) {
          const normalized = normalizeTransactionResponsePayload(transaction);
          response = {
            ...normalized,
            gasLimit: toHex(normalized.gasLimit),
            gasPrice: normalized.gasPrice
              ? toHex(normalized.gasPrice)
              : undefined,
            maxFeePerGas: normalized.maxFeePerGas
              ? toHex(normalized.maxFeePerGas)
              : undefined,
            maxPriorityFeePerGas: normalized.maxPriorityFeePerGas
              ? toHex(normalized.maxPriorityFeePerGas)
              : undefined,
            value: toHex(normalized.value),
          };
        } else {
          response = null;
        }
        break;
      }
      case 'eth_call':
      case 'eth_estimateGas':
      case 'eth_gasPrice':
      case 'eth_getCode': {
        const p = params;
        const provider = getProvider({
          chainId: activeSession?.chainId,
        }) as unknown as {
          send: (method: string, params?: unknown[]) => Promise<unknown>;
        };
        const result = await provider.send(method, p ?? []);
        response = result;
        break;
      }
      case 'eth_sendTransaction':
      case 'eth_signTransaction':
      case 'personal_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4': {
        if (method === 'eth_signTypedData_v4') {
          const p = params;
          const dataParam = !isAddress(p?.[0] as string) ? p?.[0] : p?.[1];
          const data = (
            typeof dataParam === 'string'
              ? JSON.parse(dataParam as string)
              : dataParam
          ) as { domain?: { chainId?: unknown } };
          const chainId = data?.domain?.chainId;
          if (
            chainId !== undefined &&
            Number(chainId) !== Number(activeSession?.chainId)
          ) {
            return buildError(
              id,
              'Chain Id mismatch',
              ProviderErrorCodes.INVALID_REQUEST,
            );
          }
        }
        response = await messengerProviderRequest({ id, method, params, meta });
        break;
      }
      case 'wallet_addEthereumChain': {
        const p = params;
        const proposedChain = p?.[0] as
          | AddEthereumChainProposedChain
          | undefined;
        if (!proposedChain) {
          return buildError(
            id,
            'Invalid params',
            ProviderErrorCodes.INVALID_PARAMS,
          );
        }
        const proposedChainId = Number(proposedChain.chainId);
        const featureFlags = getFeatureFlags();

        if (!featureFlags.custom_rpc) {
          const supportedChain = isSupportedChain(proposedChainId);
          if (!supportedChain) {
            return buildError(
              id,
              'Chain Id not supported',
              ProviderErrorCodes.INVALID_REQUEST,
            );
          }
        } else {
          const { chainId, rpcUrls, nativeCurrency, blockExplorerUrls } =
            proposedChain;
          const rpcUrl = rpcUrls?.[0];
          const { name, symbol, decimals } = nativeCurrency ?? {};
          const blockExplorerUrl = blockExplorerUrls?.[0];

          if (!isHex(chainId)) {
            return buildError(
              id,
              `Expected 0x-prefixed, unpadded, non-zero hexadecimal string "chainId". Received: ${chainId}`,
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
          if (Number(chainId) > Number.MAX_SAFE_INTEGER) {
            return buildError(
              id,
              `Invalid chain ID "${chainId}": numerical value greater than max safe value. Received: ${chainId}`,
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
          if (!rpcUrl) {
            return buildError(
              id,
              `Expected non-empty array[string] "rpcUrls". Received: ${rpcUrl}`,
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
          if (!name || !symbol) {
            return buildError(
              id,
              'Expected non-empty string "nativeCurrency.name", "nativeCurrency.symbol"',
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
          if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
            return buildError(
              id,
              `Expected non-negative integer "nativeCurrency.decimals" less than 37. Received: ${decimals}`,
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
          if (symbol.length < 1 || symbol.length > 6) {
            return buildError(
              id,
              `Expected 1-6 character string 'nativeCurrency.symbol'. Received: ${symbol}`,
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
          if (isSupportedChain(Number(chainId))) {
            const knownChainNativeCurrency = getChainNativeCurrency(
              Number(chainId),
            );
            if (knownChainNativeCurrency?.symbol !== symbol) {
              return buildError(
                id,
                `nativeCurrency.symbol does not match currency symbol for a network the user already has added with the same chainId. Received: ${symbol}`,
                ProviderErrorCodes.INVALID_INPUT,
              );
            }
          } else if (!blockExplorerUrl) {
            return buildError(
              id,
              `Expected null or array with at least one valid string HTTPS URL 'blockExplorerUrl'. Received: ${blockExplorerUrl}`,
              ProviderErrorCodes.INVALID_INPUT,
            );
          }
        }

        const { chainAlreadyAdded } = onAddEthereumChain({
          proposedChain,
          callbackOptions: meta,
        });

        if (!chainAlreadyAdded) {
          response = await messengerProviderRequest({
            id,
            method,
            params,
            meta,
          });
        }

        if (response === undefined || response === null) {
          return buildError(
            id,
            'User rejected the request.',
            ProviderErrorCodes.TRANSACTION_REJECTED,
          );
        }
        response = null;
        break;
      }
      case 'wallet_switchEthereumChain': {
        const p = params;
        const proposedChain = p?.[0] as
          | AddEthereumChainProposedChain
          | undefined;
        if (!proposedChain) {
          return buildError(
            id,
            'Invalid params',
            ProviderErrorCodes.INVALID_PARAMS,
          );
        }
        const supportedChainId = isSupportedChain(
          Number(proposedChain.chainId),
        );

        if (!activeSession) {
          await messengerProviderRequest({
            id,
            method: 'eth_requestAccounts',
            params,
            meta,
          });
        } else if (!supportedChainId) {
          onSwitchEthereumChainNotSupported({
            proposedChain,
            callbackOptions: meta,
          });
          return buildError(
            id,
            'Chain Id not supported',
            ProviderErrorCodes.INVALID_REQUEST,
          );
        } else {
          onSwitchEthereumChainSupported({
            proposedChain,
            callbackOptions: meta,
          });
        }
        response = null;
        break;
      }
      case 'wallet_watchAsset': {
        const featureFlags = getFeatureFlags();
        if (!featureFlags.custom_rpc) {
          return buildError(
            id,
            'Method not supported',
            ProviderErrorCodes.METHOD_NOT_SUPPORTED,
          );
        }

        const p = params;
        const options = (Array.isArray(p) ? p[0] : p) as {
          type?: string;
          options?: { address?: string; symbol?: string; decimals?: number };
        };
        const type = options?.type;
        const { address, symbol, decimals } = options?.options ?? {};

        if (type !== 'ERC20') {
          return buildError(
            id,
            'Method supported only for ERC20',
            ProviderErrorCodes.METHOD_NOT_SUPPORTED,
          );
        }
        if (!address) {
          return buildError(
            id,
            'Address is required',
            ProviderErrorCodes.INVALID_INPUT,
          );
        }

        let chainId: number | null = null;
        if (activeSession) {
          chainId = activeSession.chainId;
        } else {
          chainId = deriveChainIdByHostname(host);
        }

        const watchResponse = await messengerProviderRequest({
          id,
          method,
          params: [{ address, symbol, decimals, chainId }],
          meta,
        });
        response = !!watchResponse;
        break;
      }
      case 'eth_requestAccounts': {
        if (activeSession) {
          response = [activeSession.address.toLowerCase()];
        } else {
          const result = (await messengerProviderRequest({
            id,
            method,
            params,
            meta,
          })) as { address?: string };
          response = [result?.address?.toLowerCase() ?? ''];
        }
        break;
      }
      case 'personal_ecRecover': {
        const p = params;
        response = recoverPersonalSignature({
          data: p?.[0] as string,
          signature: p?.[1] as string,
        });
        break;
      }
      case 'wallet_revokePermissions': {
        const p = params;
        if (p?.[0] && typeof p[0] === 'object' && 'eth_accounts' in p[0]) {
          removeAppSession({ host });
          response = null;
        } else {
          return buildError(
            id,
            'Method not supported',
            ProviderErrorCodes.METHOD_NOT_SUPPORTED,
          );
        }
        break;
      }
      default: {
        if (method?.startsWith('wallet_')) {
          return buildError(
            id,
            'Method not supported',
            ProviderErrorCodes.METHOD_NOT_SUPPORTED,
          );
        }
        const provider = getProvider({
          chainId: activeSession?.chainId,
        }) as unknown as {
          send: (method: string, params?: unknown[]) => Promise<unknown>;
        };
        response = await provider.send(method, params ?? []);
      }
    }

    return { id, result: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return buildError(id, message, ProviderErrorCodes.INTERNAL_ERROR);
  }
}
