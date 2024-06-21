import { AddressZero } from '@ethersproject/constants';
import {
  CrosschainQuote,
  QuoteError,
  SwapType,
  getClaimBridgeQuote,
} from '@rainbow-me/swaps';
import { Address } from 'viem';

import { gasStore } from '~/core/state';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

import { ActionProps } from '../references';
import { overrideWithFastSpeedIfNeeded } from '../utils';

import {
  estimateCrosschainSwapGasLimit,
  executeCrosschainSwap,
} from './crosschainSwap';

export async function claimBridge({
  parameters,
  currentRap,
  index,
  wallet,
  baseNonce,
}: ActionProps<'claim'>) {
  const { address, toChainId, sellAmount, chainId } = parameters;

  if (!toChainId || !address) {
    throw new RainbowError('claimBridge: error getClaimBridgeQuote');
  }

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

  if (!claimBridgeQuote || (claimBridgeQuote as QuoteError)?.error) {
    throw new RainbowError('claimBridge: error getClaimBridgeQuote');
  }

  const bridgeQuote = claimBridgeQuote as CrosschainQuote;

  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  let gasParams = selectedGas.transactionGasParams;
  if (currentRap.actions.length - 1 > index) {
    gasParams = overrideWithFastSpeedIfNeeded({
      selectedGas,
      chainId,
      gasFeeParamsBySpeed,
    });
  }
  let gasLimit;
  try {
    gasLimit = await estimateCrosschainSwapGasLimit({
      chainId,
      requiresApprove: false,
      quote: bridgeQuote,
    });
  } catch (e) {
    logger.error(
      new RainbowError('crosschainSwap: error estimateCrosschainSwapGasLimit'),
      {
        message: (e as Error)?.message,
      },
    );
    throw e;
  }
  const nonce = baseNonce ? baseNonce + index : undefined;

  const swapParams = {
    chainId,
    gasLimit,
    nonce,
    quote: bridgeQuote,
    wallet,
    gasParams,
  };

  let swap;
  try {
    swap = await executeCrosschainSwap(swapParams);
  } catch (e) {
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
