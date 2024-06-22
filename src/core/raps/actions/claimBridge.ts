import { AddressZero } from '@ethersproject/constants';
import {
  CrosschainQuote,
  QuoteError,
  SwapType,
  getClaimBridgeQuote,
} from '@rainbow-me/swaps';
import BigNumber from 'bignumber.js';
import { Address } from 'viem';
import { optimism } from 'viem/chains';

import { gasStore } from '~/core/state';
import { TransactionGasParams } from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { add, lessThan, multiply, subtract } from '~/core/utils/numbers';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { ActionProps } from '../references';

import { executeCrosschainSwap } from './crosschainSwap';

// This action is used to bridge the claimed funds to another chain
export async function claimBridge({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claimBridge'>) {
  const { address, toChainId, sellAmount, chainId } = parameters;
  console.log('claimBridge action called with params', parameters);

  // Check if the address and toChainId are valid
  // otherwise we can't continue
  if (!toChainId || !address) {
    throw new RainbowError('claimBridge: error getClaimBridgeQuote');
  }

  console.log('getting claim bridge quote');

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
    swapType: SwapType.crossChain,
  });

  console.log('got claim bridge quote', claimBridgeQuote);

  // if we don't get a quote or there's an error we can't continue
  if (!claimBridgeQuote || (claimBridgeQuote as QuoteError)?.error) {
    throw new RainbowError('claimBridge: error getClaimBridgeQuote');
  }

  let bridgeQuote = claimBridgeQuote as CrosschainQuote;

  // 2 - We use the default gas limit (already inflated) from the quote to calculate the aproximate gas fee
  const initalGasLimit = bridgeQuote.defaultGasLimit!;
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();
  console.log('selectedGas', selectedGas);
  console.log('gasFeeParamsBySpeed', gasFeeParamsBySpeed);
  const gasParams = selectedGas.transactionGasParams as TransactionGasParams;
  const feeAmount = add(gasParams.maxFeePerGas, gasParams.maxPriorityFeePerGas);
  console.log('fee amount', new BigNumber(feeAmount).toNumber());
  const gasFeeInWei = multiply(initalGasLimit!, feeAmount);
  console.log('gas fee in wei', new BigNumber(gasFeeInWei).toNumber());

  // 3 - Check if the user has enough balance to pay the gas fee
  const provider = getProvider({
    chainId: optimism.id,
  });

  const balance = await provider.getBalance(address);
  console.log('balance', balance.toString());

  // if the balance minus the sell amount is less than the gas fee we need to make adjustments
  if (lessThan(subtract(balance.toString(), sellAmount), gasFeeInWei)) {
    // if the balance is less than the gas fee we can't continue
    if (lessThan(sellAmount, gasFeeInWei)) {
      console.log('not enough balance to bridge at all');
      throw new RainbowError(
        'claimBridge: error insufficient funds to pay gas fee',
      );
    } else {
      // otherwie we bridge the maximum amount we can afford
      console.log('enough balance to bridge some');
      maxBridgeableAmount = subtract(sellAmount, gasFeeInWei);
      console.log('will bridge instead', {
        claimed: sellAmount,
        maxBridgeableAmount,
      });
      needsNewQuote = true;
    }
  }

  // if we need to bridge a different amount we get a new quote
  if (needsNewQuote) {
    console.log('getting new quote with maxBridgeableAmount');
    const newQuote = await getClaimBridgeQuote({
      chainId,
      toChainId,
      fromAddress: address,
      sellTokenAddress: AddressZero,
      buyTokenAddress: AddressZero,
      sellAmount: maxBridgeableAmount,
      slippage: 2,
      swapType: SwapType.crossChain,
    });

    console.log('got new quote', newQuote);

    if (!newQuote || (newQuote as QuoteError)?.error) {
      console.log('error getting new quote', newQuote);
      throw new RainbowError('claimBridge: error getClaimBridgeQuote (new)');
    }

    bridgeQuote = newQuote as CrosschainQuote;
  }

  // now that we have a valid quote for the maxBridgeableAmount we can estimate the gas limit
  let gasLimit;
  try {
    console.log('estimating gas limit');
    try {
      gasLimit = await provider.estimateGas({
        from: address,
        to: bridgeQuote.to as Address,
        data: bridgeQuote.data,
        value: bridgeQuote.value,
        ...gasParams,
      });
    } catch (e) {
      console.log('error estimating gas limit', e);
    }

    console.log('estimated gas limit', gasLimit);
  } catch (e) {
    logger.error(
      new RainbowError('crosschainSwap: error estimateCrosschainSwapGasLimit'),
      {
        message: (e as Error)?.message,
      },
    );
    throw e;
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
  };

  let swap;
  try {
    console.log('claimBridge executing crosschain swap', swapParams);
    swap = await executeCrosschainSwap(swapParams);
    console.log('claimBridge executed crosschain swap', swap);
  } catch (e) {
    console.log('claimBridge executeCrosschainSwap error', e);
    logger.error(
      new RainbowError('crosschainSwap: error executeCrosschainSwap'),
      { message: (e as Error)?.message },
    );
    throw e;
  }
  if (!swap) {
    throw new RainbowError('crosschainSwap: error executeCrosschainSwap');
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

  console.log('claimBridge adding new transaction', transaction);

  addNewTransaction({
    address: bridgeQuote.from as Address,
    chainId,
    transaction,
  });

  console.log('claimBridge returning nonce and hash', swap.nonce, swap.hash);
  return {
    nonce: swap.nonce,
    hash: swap.hash,
  };
}
