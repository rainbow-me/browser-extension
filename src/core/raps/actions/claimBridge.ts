import { AddressZero } from '@ethersproject/constants';
import {
  CrosschainQuote,
  QuoteError,
  configureSDK,
  getClaimBridgeQuote,
} from '@rainbow-me/swaps';
import { Address } from 'viem';
import { optimism } from 'viem/chains';

import { REFERRER_CLAIM } from '~/core/references';
import { currentCurrencyStore, gasStore } from '~/core/state';
import { TransactionGasParams } from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { calculateL1FeeOptimism } from '~/core/utils/gas';
import {
  add,
  addBuffer,
  greaterThan,
  lessThan,
  multiply,
  subtract,
} from '~/core/utils/numbers';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';

import { ActionProps } from '../references';

import { executeCrosschainSwap } from './crosschainSwap';

const IS_TESTING = process.env.IS_TESTING === 'true';

IS_TESTING && configureSDK({ apiBaseUrl: 'http://127.0.0.1:3001' });

// This action is used to bridge the claimed funds to another chain
export async function claimBridge({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claimBridge'>) {
  const { address, toChainId, sellAmount, chainId } = parameters;

  // Check if the address and toChainId are valid
  // otherwise we can't continue
  if (!toChainId || !address) {
    throw new Error('[CLAIM-BRIDGE]: error getting getClaimBridgeQuote');
  }

  let maxBridgeableAmount = sellAmount;
  let needsNewQuote = false;

  // 1 - Get a quote to bridge the claimed funds
  const claimBridgeQuote = await getClaimBridgeQuote({
    chainId,
    toChainId,
    fromAddress: address,
    sellTokenAddress: AddressZero,
    buyTokenAddress: AddressZero,
    sellAmount: sellAmount,
    slippage: 2,
    currency: currentCurrencyStore.getState().currentCurrency,
  });

  // if we don't get a quote or there's an error we can't continue
  if (!claimBridgeQuote || (claimBridgeQuote as QuoteError)?.error) {
    throw new Error('[CLAIM-BRIDGE]: error getting getClaimBridgeQuote');
  }

  let bridgeQuote = claimBridgeQuote as CrosschainQuote;

  const provider = getProvider({
    chainId: optimism.id,
  });

  const gasPrice = await provider.getGasPrice();

  const l1GasFeeOptimism = await calculateL1FeeOptimism({
    transactionRequest:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        data: bridgeQuote.data,
        from: bridgeQuote.from,
        to: bridgeQuote.to,
        value: bridgeQuote.value,
      },
    currentGasPrice: gasPrice.toString(),
    provider,
  });

  // 2 - We use the default gas limit (already inflated) from the quote to calculate the aproximate gas fee
  const initalGasLimit = bridgeQuote.defaultGasLimit!;
  const { selectedGas } = gasStore.getState();
  const gasParams = selectedGas.transactionGasParams as TransactionGasParams;
  const feeAmount = add(gasParams.maxFeePerGas, gasParams.maxPriorityFeePerGas);
  let gasFeeInWei = multiply(initalGasLimit!, feeAmount);
  if (l1GasFeeOptimism && greaterThan(l1GasFeeOptimism.toString(), '0')) {
    gasFeeInWei = add(gasFeeInWei, l1GasFeeOptimism.toString());
  }

  // 3 - Check if the user has enough balance to pay the gas fee
  const balance = await provider.getBalance(address);

  // if the balance minus the sell amount is less than the gas fee we need to make adjustments
  if (lessThan(subtract(balance.toString(), sellAmount), gasFeeInWei)) {
    // if the balance is less than the gas fee we can't continue
    if (lessThan(sellAmount, gasFeeInWei)) {
      throw new Error(
        '[CLAIM-BRIDGE]: error insufficient funds to pay gas fee',
      );
    } else {
      // otherwise we bridge the maximum amount we can afford
      maxBridgeableAmount = subtract(sellAmount, gasFeeInWei);
      needsNewQuote = true;
    }
  }

  // if we need to bridge a different amount we get a new quote
  if (needsNewQuote) {
    const newQuote = await getClaimBridgeQuote({
      chainId,
      toChainId,
      fromAddress: address,
      sellTokenAddress: AddressZero,
      buyTokenAddress: AddressZero,
      sellAmount: maxBridgeableAmount,
      slippage: 2,
      currency: currentCurrencyStore.getState().currentCurrency,
    });

    if (!newQuote || (newQuote as QuoteError)?.error) {
      throw new Error('[CLAIM-BRIDGE]: error getClaimBridgeQuote (new)');
    }

    bridgeQuote = newQuote as CrosschainQuote;
  }

  // now that we have a valid quote for the maxBridgeableAmount we can estimate the gas limit
  let gasLimit;
  try {
    gasLimit = await provider.estimateGas({
      from: address,
      to: bridgeQuote.to as Address,
      data: bridgeQuote.data,
      value: bridgeQuote.value,
      ...gasParams,
    });
  } catch (e) {
    // Instead of failing we'll try using the default gas limit + 20% if it exists
    gasLimit = bridgeQuote.defaultGasLimit
      ? addBuffer(bridgeQuote.defaultGasLimit)
      : null;
  }

  if (!gasLimit) {
    throw new Error(
      '[CLAIM-BRIDGE]: error estimating gas or using default gas limit',
    );
  }

  // we need to bump the base nonce to next available one
  const nonce = baseNonce ? baseNonce + 1 : undefined;

  // 4 - Execute the crosschain swap
  const swapParams = {
    chainId,
    gasLimit: gasLimit!.toString(),
    nonce,
    quote: bridgeQuote,
    wallet,
    gasParams,
    referrer: REFERRER_CLAIM,
  };

  let swap;
  try {
    swap = await executeCrosschainSwap(swapParams);
  } catch (e) {
    throw new Error('[CLAIM-BRIDGE]: crosschainSwap error');
  }
  if (!swap) {
    throw new Error('[CLAIM-BRIDGE]: executeCrosschainSwap returned undefined');
  }

  // 5 - if the swap was successful we add the transaction to the store
  const transaction = {
    data: bridgeQuote.data,
    value: bridgeQuote.value?.toString(),
    asset: parameters.assetToBuy,
    changes: [
      {
        direction: 'out',
        asset: parameters.assetToSell,
        value: bridgeQuote.sellAmount.toString(),
      },
      {
        direction: 'in',
        asset: parameters.assetToBuy,
        value: bridgeQuote.buyAmount.toString(),
      },
    ],
    from: bridgeQuote.from as Address,
    to: bridgeQuote.to as Address,
    hash: swap.hash as TxHash,
    chainId: parameters.chainId,
    nonce: swap.nonce,
    status: 'pending',
    type: 'bridge',
    flashbots: false,
    ...gasParams,
  } satisfies NewTransaction;

  addNewTransaction({
    address: bridgeQuote.from as Address,
    chainId,
    transaction,
  });

  return {
    nonce: swap.nonce,
    hash: swap.hash,
  };
}
