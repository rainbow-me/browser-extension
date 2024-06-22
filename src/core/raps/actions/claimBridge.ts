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

export async function claimBridge({
  parameters,
  wallet,
  baseNonce,
}: ActionProps<'claimBridge'>) {
  const { address, toChainId, sellAmount, chainId } = parameters;
  console.log('claimBridge action called with params', parameters);
  if (!toChainId || !address) {
    throw new RainbowError('claimBridge: error getClaimBridgeQuote');
  }

  console.log('getting claim bridge quote');
  // 1 -  Get a quote for the full amount of the claim
  let maxBridgeableAmount = sellAmount;
  let needsNewQuote = false;

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

  if (!claimBridgeQuote || (claimBridgeQuote as QuoteError)?.error) {
    throw new RainbowError('claimBridge: error getClaimBridgeQuote');
  }

  let bridgeQuote = claimBridgeQuote as CrosschainQuote;

  // 2 -  Get the gas limit for the claim
  const initalGasLimit = bridgeQuote.defaultGasLimit!;

  // 3 - Calculate the gas fee
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();
  console.log('selectedGas', selectedGas);
  console.log('gasFeeParamsBySpeed', gasFeeParamsBySpeed);

  const gasParams = selectedGas.transactionGasParams as TransactionGasParams;
  const feeAmount = add(gasParams.maxFeePerGas, gasParams.maxPriorityFeePerGas);
  console.log('fee amount', new BigNumber(feeAmount).toNumber());
  const gasFeeInWei = multiply(initalGasLimit!, feeAmount);
  console.log('gas fee in wei', new BigNumber(gasFeeInWei).toNumber());

  const provider = getProvider({
    chainId: optimism.id,
  });

  const balance = await provider.getBalance(address);
  console.log('balance', balance.toString());

  if (lessThan(subtract(balance.toString(), sellAmount), gasFeeInWei)) {
    console.log('not enough balance to bridge 100%');
    if (lessThan(sellAmount, gasFeeInWei)) {
      console.log('not enough balance to bridge at all');
      throw new RainbowError(
        'claimBridge: error insufficient funds to pay gas fee',
      );
    } else {
      console.log('enough balance to bridge some');
      maxBridgeableAmount = subtract(sellAmount, gasFeeInWei);
      console.log('will bridge instead', {
        claimed: sellAmount,
        maxBridgeableAmount,
      });
      needsNewQuote = true;
    }
  }

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

  const nonce = baseNonce ? baseNonce + 1 : undefined;

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
  if (!swap)
    throw new RainbowError('crosschainSwap: error executeCrosschainSwap');

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
