/* eslint-disable sort-imports */
import {
  BatchCall,
  BatchExecutionResult,
  encodeDelegateCalldata,
  executeBatchedTransaction,
  getShouldDelegate as sdkGetShouldDelegate,
  TransactionGasParamAmounts,
  useNetworkStatusStore,
  useWalletStatusStore,
} from '@rainbow-me/rainbow-delegation';
import {
  ChainId as SwapChainId,
  CrosschainQuote,
  getTargetAddress,
  isAllowedTargetContract,
  prepareFillCrosschainQuote,
  prepareFillQuote,
  Quote,
  SwapType,
} from '@rainbow-me/swaps';
/* eslint-enable sort-imports */
import { Address, encodeFunctionData, erc20Abi } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { metadataPostClient } from '~/core/graphql';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ChainId } from '~/core/types/chains';
import { canUseDelegation } from '~/core/viem/walletClient';

const REFERRER = 'browser-extension';
const DEBUG_PREFIX = '[Delegation]';

/**
 * Determine if a swap should use the delegation path for atomic execution.
 *
 * Returns true only when ALL conditions are met:
 * - Feature flag is enabled (atomic_swaps_enabled)
 * - Chain supports EIP-7702 delegation (checked via SDK)
 * - Swap requires token approval (not native token swap)
 * - Wallet is not a hardware wallet
 *
 * @param chainId - The chain ID
 * @param quote - The swap quote
 * @param userAddress - The user's wallet address
 * @returns true if delegation path should be used
 */
export async function getShouldDelegate({
  chainId,
  quote,
  userAddress,
}: {
  chainId: ChainId;
  quote: Quote | CrosschainQuote;
  userAddress: Address;
}): Promise<boolean> {
  console.log(DEBUG_PREFIX, 'Checking delegation eligibility', {
    chainId,
    userAddress,
    swapType: quote?.swapType,
    sellToken: quote?.sellTokenAddress,
    buyToken: quote?.buyTokenAddress,
  });

  // Check feature flag (remote config OR local dev toggle)
  const remoteEnabled = config.atomic_swaps_enabled ?? false;
  const localEnabled =
    useFeatureFlagsStore.getState().featureFlags.atomic_swaps_enabled;
  console.log(DEBUG_PREFIX, 'Feature flag check', {
    remoteEnabled,
    localEnabled,
  });
  if (!remoteEnabled && !localEnabled) {
    console.log(DEBUG_PREFIX, '❌ Feature flag not enabled');
    return false;
  }

  // Check if quote is valid
  if (!quote || 'error' in quote) {
    console.log(DEBUG_PREFIX, '❌ Quote invalid or has error', {
      hasQuote: !!quote,
      error: quote && 'error' in quote ? quote.error : undefined,
    });
    return false;
  }

  // Wrap/unwrap don't need delegation
  if (quote.swapType === SwapType.wrap || quote.swapType === SwapType.unwrap) {
    console.log(DEBUG_PREFIX, '❌ Wrap/unwrap - delegation not needed');
    return false;
  }

  // Check if swap needs approval (native token swaps don't need approval)
  console.log(DEBUG_PREFIX, 'Allowance check', {
    allowanceNeeded: quote.allowanceNeeded,
    allowanceTarget: quote.allowanceTarget,
  });
  if (!quote.allowanceNeeded) {
    console.log(
      DEBUG_PREFIX,
      '❌ No allowance needed - delegation not beneficial',
    );
    return false;
  }

  // Hardware wallets cannot use delegation
  const canUse = await canUseDelegation(userAddress);
  console.log(DEBUG_PREFIX, 'Wallet type check', { canUseDelegation: canUse });
  if (!canUse) {
    console.log(DEBUG_PREFIX, '❌ Hardware wallet - cannot use delegation');
    return false;
  }

  // Fetch delegation status from stores before checking
  // The SDK stores need to be fetched to populate the cache
  console.log(DEBUG_PREFIX, 'Fetching delegation status from stores...');
  try {
    const [networkStatus, walletStatus] = await Promise.all([
      useNetworkStatusStore
        .getState()
        .fetch({ address: userAddress, chainId }, { force: true }),
      useWalletStatusStore
        .getState()
        .fetch({ address: userAddress }, { force: true }),
    ]);
    console.log(DEBUG_PREFIX, '✅ Delegation status fetched', {
      networkStatus,
      walletStatus,
    });
  } catch (error) {
    console.error(DEBUG_PREFIX, 'Failed to fetch delegation status', error);
    // Continue anyway - stores might have cached data
  }

  // Check if chain supports delegation via SDK (cached backend query)
  // Returns { shouldDelegate, delegation } - if delegation is null, chain isn't supported
  const delegationState = sdkGetShouldDelegate(userAddress, chainId);
  console.log(DEBUG_PREFIX, 'SDK delegation state', {
    shouldDelegate: delegationState.shouldDelegate,
    hasDelegation: !!delegationState.delegation,
    delegation: delegationState.delegation,
  });
  if (!delegationState.delegation && !delegationState.shouldDelegate) {
    console.log(
      DEBUG_PREFIX,
      '❌ Chain not supported or user not eligible for delegation',
    );
    return false;
  }

  console.log(DEBUG_PREFIX, '✅ All checks passed - will use delegation');
  return true;
}

/**
 * Build the approve and swap calls for batched execution.
 *
 * @param quote - The swap quote
 * @param chainId - The chain ID
 * @returns Array of BatchCall objects
 */
export async function getApproveAndSwapCalls({
  quote,
  chainId,
}: {
  quote: Quote | CrosschainQuote;
  chainId: ChainId;
}): Promise<BatchCall[]> {
  const calls: BatchCall[] = [];

  // Build approval call
  const approvalCalldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [
      quote.allowanceTarget as Address,
      BigInt(quote.sellAmount.toString()),
    ],
  });

  calls.push({
    to: quote.sellTokenAddress as Address,
    value: 0n,
    data: approvalCalldata,
  });

  // Build swap call using swaps SDK preparation functions
  const isCrosschain = quote.swapType === SwapType.crossChain;

  if (isCrosschain) {
    const swapCalldata = await prepareFillCrosschainQuote(
      quote as CrosschainQuote,
      REFERRER,
    );
    calls.push({
      to: swapCalldata.to as Address,
      value: BigInt(swapCalldata.value),
      data: swapCalldata.data as `0x${string}`,
    });
  } else {
    // Same-chain swap - prepareFillQuote requires a signer but we only need the calldata
    // The swaps SDK returns { to, value, data } which we can use directly
    const swapCalldata = await prepareFillQuote(
      quote,
      {}, // transactionOptions - not needed for preparation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      null as any, // wallet - not needed when just getting calldata
      false, // permit
      chainId as unknown as SwapChainId,
      REFERRER,
    );
    calls.push({
      to: swapCalldata.to as Address,
      value: BigInt(swapCalldata.value),
      data: swapCalldata.data as `0x${string}`,
    });
  }

  return calls;
}

/**
 * Execute a batched approve+swap transaction using EIP-7702 delegation.
 *
 * @param params - Execution parameters
 * @returns Transaction result with hash
 */
export async function executeWithDelegate({
  walletClient,
  quote,
  chainId,
  transactionOptions,
}: {
  walletClient: NonNullable<
    ReturnType<
      typeof import('~/core/viem/walletClient').getViemWalletClient
    > extends Promise<infer T>
      ? T
      : never
  >;
  quote: Quote | CrosschainQuote;
  chainId: ChainId;
  transactionOptions: TransactionGasParamAmounts;
}): Promise<BatchExecutionResult & { error: string | null }> {
  try {
    // Validate target contract
    const targetAddress = getTargetAddress(quote);
    if (
      targetAddress &&
      !isAllowedTargetContract(targetAddress, chainId as unknown as SwapChainId)
    ) {
      return {
        error: 'Target contract not allowed',
      };
    }

    // Build calls array
    const calls = await getApproveAndSwapCalls({ quote, chainId });

    // Execute via delegation SDK
    const result = await executeBatchedTransaction({
      calls,
      walletClient,
      transactionOptions,
    });

    return {
      ...result,
      error: null,
    };
  } catch (e) {
    return {
      error:
        (e as Error).message || 'Unknown error executing delegated transaction',
    };
  }
}

/**
 * Estimate gas limit for a delegated approve+swap transaction using simulation.
 *
 * @param quote - The swap quote
 * @param chainId - The chain ID
 * @param fromAddress - The user's address
 * @returns Estimated gas limit or null if simulation fails
 */
export async function estimateDelegatedGasLimit({
  quote,
  chainId,
  fromAddress,
}: {
  quote: Quote | CrosschainQuote;
  chainId: ChainId;
  fromAddress: Address;
}): Promise<string | null> {
  try {
    // Build calls
    const calls = await getApproveAndSwapCalls({ quote, chainId });

    // Encode using delegation SDK
    const delegateCalldata = await encodeDelegateCalldata(calls);

    // Simulate via metadata API
    // The delegation sends transaction TO the user's own address (self-delegation)
    const response = await metadataPostClient.simulateTransactions({
      chainId,
      transactions: [
        {
          to: fromAddress,
          from: fromAddress,
          data: delegateCalldata,
          value: '0x0',
        },
      ],
    });

    const gasEstimate = response?.simulateTransactions?.[0]?.gas?.estimate;
    return gasEstimate || null;
  } catch (e) {
    return null;
  }
}
