import { Signer } from '@ethersproject/abstract-signer';
import { MaxUint256 } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { formatEther } from '@ethersproject/units';
import { Address, erc20ABI, getProvider } from '@wagmi/core';

import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

import { ETH_ADDRESS, gasUnits } from '../../references';
import { gasStore } from '../../state';
import { ParsedAsset } from '../../types/assets';
import { toHex } from '../../utils/hex';
import { convertAmountToRawAmount, greaterThan } from '../../utils/numbers';
import { ActionProps } from '../references';

import { overrideWithFastSpeedIfNeeded } from './../utils';

export const getAssetRawAllowance = async ({
  owner,
  assetAddress,
  spender,
  chainId,
}: {
  owner: Address;
  assetAddress: Address;
  spender: Address;
  chainId: ChainId;
}) => {
  try {
    const provider = await getProvider({ chainId });
    const tokenContract = new Contract(assetAddress, erc20ABI, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance.toString();
  } catch (error) {
    logger.error(new RainbowError('getRawAllowance: error'), {
      message: (error as Error)?.message,
    });
    return null;
  }
};

export const assetNeedsUnlocking = async ({
  owner,
  amount,
  assetToUnlock,
  spender,
  chainId,
}: {
  owner: Address;
  amount: string;
  assetToUnlock: ParsedAsset;
  spender: Address;
  chainId: ChainId;
}) => {
  if (assetToUnlock.isNativeAsset || assetToUnlock.address === ETH_ADDRESS)
    return false;

  const allowance = await getAssetRawAllowance({
    owner,
    assetAddress: assetToUnlock.address,
    spender,
    chainId,
  });

  const rawAmount = convertAmountToRawAmount(amount, assetToUnlock.decimals);
  const needsUnlocking = !greaterThan(allowance, rawAmount);
  return needsUnlocking;
};

export const estimateApprove = async ({
  owner,
  tokenAddress,
  spender,
  chainId,
}: {
  owner: Address;
  tokenAddress: Address;
  spender: Address;
  chainId: ChainId;
}): Promise<string> => {
  try {
    const provider = getProvider({ chainId });
    const tokenContract = new Contract(tokenAddress, erc20ABI, provider);
    const gasLimit = await tokenContract.estimateGas.approve(
      spender,
      MaxUint256,
      {
        from: owner,
      },
    );
    return gasLimit ? gasLimit.toString() : `${gasUnits.basic_approval}`;
  } catch (error) {
    logger.error(new RainbowError('unlock: error estimateApprove'), {
      message: (error as Error)?.message,
    });
    return `${gasUnits.basic_approval}`;
  }
};

export const executeApprove = async ({
  gasLimit,
  gasParams,
  nonce,
  spender,
  tokenAddress,
  wallet,
}: {
  chainId: ChainId;
  gasLimit: string;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  spender: Address;
  tokenAddress: Address;
  wallet: Signer;
}) => {
  const tokenContract = new Contract(tokenAddress, erc20ABI, wallet);

  return tokenContract.approve(spender, MaxUint256, {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(String(nonce)) : undefined,
    ...gasParams,
  });
};

export const unlock = async ({
  baseNonce,
  index,
  parameters,
  wallet,
}: ActionProps<'unlock'>): Promise<number | undefined> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  const { assetToUnlock, contractAddress, chainId } = parameters;

  const { address: assetAddress } = assetToUnlock;

  let gasLimit;
  try {
    gasLimit = await estimateApprove({
      owner: parameters.fromAddress,
      tokenAddress: assetAddress as Address,
      spender: contractAddress,
      chainId,
    });
  } catch (e) {
    logger.error(new RainbowError('unlock: error estimateApprove'), {
      message: (e as Error)?.message,
    });
    throw e;
  }

  const gasParams = overrideWithFastSpeedIfNeeded({
    chainId,
    gasFeeParamsBySpeed,
    selectedGas,
  });

  const nonce = baseNonce ? baseNonce + index : undefined;

  let approval;
  try {
    approval = await executeApprove({
      tokenAddress: assetAddress as Address,
      spender: contractAddress,
      gasLimit,
      gasParams,
      wallet,
      nonce,
      chainId,
    });
  } catch (e) {
    logger.error(new RainbowError('unlock: error executeApprove'), {
      message: (e as Error)?.message,
    });
    throw e;
  }

  const transaction = {
    amount: formatEther(approval?.value || ''),
    asset: assetToUnlock,
    data: approval.data,
    value: approval.value,
    from: parameters.fromAddress,
    to: assetAddress as Address,
    hash: approval.hash,
    chainId: approval.chainId,
    nonce: approval.nonce,
    status: TransactionStatus.approving,
    type: TransactionType.send,
    gasPrice: (selectedGas.transactionGasParams as TransactionLegacyGasParams)
      ?.gasPrice,
    maxFeePerGas: (selectedGas.transactionGasParams as TransactionGasParams)
      ?.maxFeePerGas,
    maxPriorityFeePerGas: (
      selectedGas.transactionGasParams as TransactionGasParams
    )?.maxPriorityFeePerGas,
  };
  await addNewTransaction({
    address: parameters.fromAddress as Address,
    chainId: approval.chainId as ChainId,
    transaction,
  });

  return approval?.nonce;
};
