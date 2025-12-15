import { Chain } from 'viem';
import { z } from 'zod';

import { useChainMetadata } from '~/core/resources/chains/chainMetadata';
import { getDappHostname, isValidUrl } from '~/core/utils/connectedApps';
import { useDebounce } from '~/entries/popup/hooks/useDebounce';

// ============ Schemas ============

export const rpcUrlSchema = z
  .string()
  .min(1, 'RPC URL is required')
  .refine(isValidUrl, 'Invalid URL');

export const newNetworkSchema = z.object({
  name: z.string().min(1, 'Network name is required'),
  rpcUrl: rpcUrlSchema,
  symbol: z.string().min(1, 'Symbol is required'),
  explorerUrl: z
    .string()
    .refine((val) => !val || isValidUrl(val), 'Invalid URL')
    .optional()
    .or(z.literal('')),
  testnet: z.boolean(),
  active: z.boolean(),
});

export const addRpcSchema = z.object({
  name: z.string().min(1, 'RPC name is required'),
  rpcUrl: rpcUrlSchema,
  active: z.boolean(),
});

export type NewNetworkFormValues = z.infer<typeof newNetworkSchema>;
export type AddRpcFormValues = z.infer<typeof addRpcSchema>;

// ============ Shared Hook for RPC Validation ============

export function useRpcValidation(rpcUrl: string | undefined) {
  const debouncedRpcUrl = useDebounce(rpcUrl, 1000);

  return useChainMetadata(
    { rpcUrl: debouncedRpcUrl },
    { enabled: !!debouncedRpcUrl && isValidUrl(debouncedRpcUrl) },
  );
}

// ============ Chain Builder ============

export function buildChainObject(params: {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl?: string;
  testnet?: boolean;
}): Chain {
  return {
    id: params.chainId,
    name: params.name,
    nativeCurrency: {
      symbol: params.symbol,
      decimals: 18,
      name: params.symbol,
    },
    rpcUrls: {
      default: { http: [params.rpcUrl] },
      public: { http: [params.rpcUrl] },
    },
    blockExplorers: {
      default: {
        name: params.explorerUrl ? getDappHostname(params.explorerUrl) : '',
        url: params.explorerUrl || '',
      },
    },
    testnet: params.testnet,
  };
}
