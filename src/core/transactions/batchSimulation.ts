import { prepareBatchedTransaction } from '@rainbow-me/delegation';
import { type Address, type Hex, getAddress } from 'viem';

import { Transaction } from '~/core/graphql/__generated__/metadata';
import { simulateTransactions } from '~/core/resources/transactions/simulation';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

export type BatchCallInput = {
  to?: `0x${string}`;
  data?: `0x${string}`;
  value?: `0x${string}`;
};

/** Zero address used when EIP-5792 call omits `to`. */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

/**
 * Ensure string is valid Hex (0x-prefixed). EIP-5792 allows optional fields;
 * we default to '0x' for data and '0x0' for value.
 */
const ensureHex = (
  val: string | undefined,
  fallback: `0x${string}` = '0x',
): Hex => (val && val.startsWith('0x') ? (val as Hex) : (fallback as Hex));

/**
 * Map EIP-5792 call format to delegation BatchCall format.
 * Uses getAddress for Address validation; ensureHex for Hex fields.
 */
const toBatchCall = (call: BatchCallInput) => ({
  to: getAddress(call.to ?? ZERO_ADDRESS),
  data: ensureHex(call.data),
  value: ensureHex(call.value, '0x0'),
});

/**
 * Simulate a batch of calls using prepareBatchedTransaction + metadata API.
 * Used by wallet_sendCalls approval UI.
 */
export async function simulateCalls({
  from,
  calls,
  chainId,
  domain = '',
}: {
  from: Address;
  calls: BatchCallInput[];
  chainId: number;
  domain?: string;
}) {
  if (calls.length === 0) return [];

  const publicClient = getViemClient({ chainId });
  const nonce = await publicClient.getTransactionCount({
    address: from,
    blockTag: 'pending',
  });

  const batchCalls = calls.map(toBatchCall);
  const transaction = await prepareBatchedTransaction({
    from,
    calls: batchCalls,
    chainId,
    nonce,
  });

  const metadataTransaction: Transaction = {
    from: transaction.from,
    to: transaction.to,
    data: transaction.data,
    value: transaction.value.toString(),
    ...(transaction.authorization_list && {
      authorization_list: transaction.authorization_list.map((a) => ({
        address: a.address,
        chainId: a.chainId,
        nonce: a.nonce,
      })),
    }),
  };

  try {
    return await simulateTransactions({
      chainId,
      transactions: [metadataTransaction],
      domain,
    });
  } catch (e) {
    logger.error(new RainbowError('simulateCalls failed'), {
      message: (e as Error)?.message,
    });
    throw e;
  }
}

/**
 * Estimate gas for a batch of calls.
 * Returns the gas estimate string from simulation, or undefined on failure.
 */
export async function estimateGasForCalls({
  from,
  calls,
  chainId,
}: {
  from: Address;
  calls: BatchCallInput[];
  chainId: number;
}): Promise<string | undefined> {
  if (calls.length === 0) return undefined;

  try {
    const results = await simulateCalls({ from, calls, chainId });
    return results[0]?.gas?.estimate;
  } catch (e) {
    logger.warn('[estimateGasForCalls] Simulation failed', {
      message: (e as Error)?.message,
    });
    return undefined;
  }
}
