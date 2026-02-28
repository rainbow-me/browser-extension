/**
 * Portal Host - Background service handler using viem-portal
 *
 * Handles incoming RPC requests from inpage/popup and routes them
 * to the appropriate handlers.
 */

import { type Address, isHex, recoverMessageAddress } from 'viem';
import {
  type MethodHandlers,
  type PortalHost,
  type Transport,
  createHost,
  createTabTransport,
} from 'viem-portal';

export const ErrorCodes = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_NOT_SUPPORTED: 4902,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  RATE_LIMITED: -32005,
} as const;

interface ActiveSession {
  address: Address;
  chainId: number;
}

interface ApprovalRequest {
  method: string;
  params?: unknown[];
  host: string;
  tabId?: number;
  portalRequestId?: number;
}

interface WatchAssetParams {
  type?: string;
  options?: {
    address?: Address;
    symbol?: string;
    decimals?: number;
  };
}

interface AddChainParams {
  chainId: string;
  rpcUrls?: string[];
}

export interface RpcProvider {
  request: (args: {
    method: string;
    params?: readonly unknown[];
  }) => Promise<unknown>;
}

export interface PortalHostConfig {
  getActiveSession: (host: string) => ActiveSession | null;
  removeSession: (host: string) => void;
  updateSessionChain: (host: string, chainId: number) => void;
  isSupportedChain: (chainId: number) => boolean;
  getChainRpcUrl: (chainId: number) => string | undefined;
  addRpcForChain: (chainId: number, rpcUrl: string) => void;
  resolveHost: (portalRequestId: number) => string;
  requestApproval: (request: ApprovalRequest) => Promise<unknown>;
  getProvider: (chainId?: number) => RpcProvider;
}

/**
 * Minimal schema for provider RPC - only what's actually needed
 */
export type ProviderSchema = {
  eth_request: {
    params: [method: string, params?: unknown[]];
    result: unknown;
  };
  getActiveSession: {
    params: [host: string];
    result: ActiveSession | null;
  };
};

export function createPortalHost(
  config: PortalHostConfig,
  customTransport?: Transport,
): PortalHost<ProviderSchema> {
  const transport = customTransport ?? createTabTransport();

  const handlers: MethodHandlers<ProviderSchema> = {
    eth_request: async ([method, params], context) => {
      const requestHost = config.resolveHost(context.id);
      const session = config.getActiveSession(requestHost);

      switch (method) {
        case 'eth_chainId':
          return session ? `0x${session.chainId.toString(16)}` : '0x1';

        case 'eth_accounts':
          return session ? [session.address.toLowerCase()] : [];

        case 'eth_coinbase':
          return session?.address?.toLowerCase() ?? null;

        case 'eth_requestAccounts':
          if (session) {
            return [session.address.toLowerCase()];
          }
          {
            const approval = (await config.requestApproval({
              method,
              params,
              host: requestHost,
              portalRequestId: context.id,
            })) as ActiveSession | undefined;
            return approval?.address ? [approval.address.toLowerCase()] : [];
          }

        case 'eth_blockNumber':
        case 'eth_getBalance':
        case 'eth_getTransactionByHash':
        case 'eth_call':
        case 'eth_estimateGas':
        case 'eth_gasPrice':
        case 'eth_getCode':
        case 'eth_getLogs':
          return config
            .getProvider(session?.chainId)
            .request({ method, params: params ?? [] });

        case 'eth_sendTransaction':
        case 'eth_signTransaction':
        case 'personal_sign':
        case 'eth_signTypedData':
        case 'eth_signTypedData_v3':
        case 'eth_signTypedData_v4':
          return config.requestApproval({
            method,
            params,
            host: requestHost,
            portalRequestId: context.id,
          });

        case 'wallet_switchEthereumChain': {
          const switchParams = (params as [{ chainId: string }])?.[0];
          const targetChainId = parseInt(switchParams.chainId, 16);

          if (session?.chainId === targetChainId) return null;

          if (!config.isSupportedChain(targetChainId)) {
            throw {
              code: ErrorCodes.CHAIN_NOT_SUPPORTED,
              message: 'Chain not supported',
            };
          }

          config.updateSessionChain(requestHost, targetChainId);
          return null;
        }

        case 'wallet_addEthereumChain': {
          const chainParams = (params as AddChainParams[])?.[0];
          const addChainId = chainParams?.chainId
            ? parseInt(chainParams.chainId, 16)
            : undefined;

          if (addChainId && config.isSupportedChain(addChainId)) {
            const rpcUrl = chainParams?.rpcUrls?.[0];
            if (rpcUrl) config.addRpcForChain(addChainId, rpcUrl);
            return null;
          }

          return config.requestApproval({
            method,
            params,
            host: requestHost,
            portalRequestId: context.id,
          });
        }

        case 'wallet_watchAsset': {
          const raw = Array.isArray(params) ? params[0] : params;
          const watchParams = raw as WatchAssetParams;

          if (watchParams?.type !== 'ERC20') {
            throw {
              code: ErrorCodes.INVALID_PARAMS,
              message: 'Only ERC20 tokens are supported',
            };
          }

          return config.requestApproval({
            method,
            params: [
              {
                address: watchParams.options?.address,
                symbol: watchParams.options?.symbol,
                decimals: watchParams.options?.decimals,
                chainId: session?.chainId,
              },
            ],
            host: requestHost,
            portalRequestId: context.id,
          });
        }

        case 'personal_ecRecover': {
          const [message, signature] = params as [string, string];
          if (!message || !signature || !isHex(signature)) {
            throw {
              code: ErrorCodes.INVALID_PARAMS,
              message: 'Invalid params',
            };
          }
          return recoverMessageAddress({ message, signature });
        }

        case 'wallet_revokePermissions':
          config.removeSession(requestHost);
          return null;

        default:
          return config
            .getProvider(session?.chainId)
            .request({ method, params: params ?? [] });
      }
    },

    getActiveSession: async ([host]) => config.getActiveSession(host),
  };

  return createHost(transport, { handlers });
}
