# Gas Estimation in RAPs

This document explains how gas estimation works across the RAP (Rainbow Action Protocol) system.

## Overview

Gas estimation follows a priority order: **Batch Simulation → Provider Estimation → Defaults**.

**Key Rule**: The metadata service (Blockaid) is **only used for chained/dependent transactions** (e.g., approve+swap). Single transactions always use provider estimation (`eth_estimateGas`). For dependent transactions, batch simulation is required and we never fall through to single transaction simulation.

## Gas Estimation Sources

1. **Blockaid Metadata Service** (`metadataPostClient.simulateTransactions`)

   - Simulates transactions on-chain via Blockaid
   - Returns gas estimates when supported on the network
   - **ONLY used for chained/dependent transactions** (e.g., approve+swap)
   - Never used for single transactions

2. **Provider Estimation** (`estimateGasWithPadding`)

   - Direct RPC calls to blockchain provider
   - Uses `eth_estimateGas` with padding factor
   - Fallback when simulation unavailable

3. **Default Gas Limits**
   - Quote defaults (`quote.defaultGasLimit`)
   - Chain-specific defaults (`chainGasUnits.basic.swap`)
   - Used as final fallback

## File-by-File Breakdown

### `unlockAndSwap.ts` / `unlockAndCrosschainSwap.ts`

**Function**: `estimateUnlockAndSwap` / `estimateUnlockAndCrosschainSwap`

**Flow**:

1. Check if asset needs unlocking via `checkSwapNeedsUnlocking`
2. **If unlock needed**:
   - Try batch simulation (`estimateUnlockAndSwapFromMetadata`)
   - ✅ **Success**: Return combined gas limit
   - ❌ **Failure**: Return `approveGasLimit + swapDefaultGasLimit` (no single tx simulation)
3. **If no unlock needed**:
   - Estimate swap only via `estimateSwapGasLimit` / `estimateCrosschainSwapGasLimit`

**Key Principle**: When batch estimation fails, we combine default gas limits rather than attempting single transaction simulation, since swap depends on approve happening first.

### `actions/swap.ts`

**Function**: `estimateSwapGasLimit`

**Flow**:

1. **Wrap/Unwrap**:

   - Provider estimation with padding (`WRAP_GAS_PADDING = 1.002`)
   - Fallback: `quote.defaultGasLimit` or chain defaults

2. **Regular Swap**:
   - If `requiresApprove`: Return defaults (batch estimation should have been attempted)
   - Otherwise: Provider estimation with padding (`SWAP_GAS_PADDING = 1.1`)
   - Fallback: `getDefaultGasLimitForTrade`

**Function**: `estimateUnlockAndSwapFromMetadata`

**Flow**:

1. Populate approve and swap transactions
2. Call `metadataPostClient.simulateTransactions` with both transactions (chained)
3. Sum gas estimates from all simulated transactions
4. Return `null` if simulation fails or unsupported

**Note**: This function only handles chained transactions (approve+swap). It's only called when unlock is needed. Single swap transactions use `estimateSwapGasLimit` with provider estimation.

### `actions/crosschainSwap.ts`

**Function**: `estimateCrosschainSwapGasLimit`

**Flow**:

1. If `requiresApprove`: Return defaults (batch estimation should have been attempted)
2. Otherwise: Provider estimation with padding (`SWAP_GAS_PADDING = 1.1`)
3. Fallback: `quote.routes[0].userTxs[0].gasFees.gasLimit` or `getDefaultGasLimitForTrade`

### `actions/unlock.ts`

**Function**: `estimateApprove`

**Flow**:

1. Provider estimation via `tokenContract.estimateGas.approve`
2. Fallback: `chainGasUnits.basic.approval`

### `utils.ts`

**Function**: `getDefaultGasLimitForTrade`

**Returns**: `quote.defaultGasLimit` or `chainGasUnits.basic.swap * EXTRA_GAS_PADDING (1.5)`

## Key Principles

1. **Metadata Service Only for Chained Transactions**

   - Approve+swap must be simulated together via metadata service
   - Swap transaction depends on approve state change
   - Single transactions always use provider estimation (`eth_estimateGas`)
   - Never use metadata service for standalone transactions

2. **No Fallthrough to Single TX Simulation**

   - If batch estimation fails, return combined defaults
   - Never attempt single swap simulation when approve is needed

3. **Fallback Chain**

   - Simulation → Provider Estimation → Quote Defaults → Chain Defaults

4. **Gas Padding**
   - Swaps: `SWAP_GAS_PADDING = 1.1` (10% buffer)
   - Wrap/Unwrap: `WRAP_GAS_PADDING = 1.002` (0.2% buffer)
   - Defaults: `EXTRA_GAS_PADDING = 1.5` (50% buffer)

## Network Support

- **Blockaid Simulation**: Network-dependent, checked via `gas.estimate` presence
- **Provider Estimation**: Available on all networks
- **Defaults**: Always available as final fallback
