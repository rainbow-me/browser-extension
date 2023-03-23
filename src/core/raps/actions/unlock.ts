import { MaxUint256 } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import { Address, erc20ABI, getProvider } from '@wagmi/core';

import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { logger } from '~/logger';

import { ETH_ADDRESS, gasUnits } from '../../references';
import { gasStore } from '../../state';
import { ParsedAsset } from '../../types/assets';
import {
  convertAmountToRawAmount,
  greaterThan,
  toHex,
} from '../../utils/numbers';
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
    logger.error({
      name: 'getRawAllowance: error',
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
    logger.error({
      name: 'unlock: error estimateApprove',
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
  wallet: Wallet;
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
    logger.error({
      name: 'unlock: error estimateApprove',
      message: (e as Error)?.message,
    });
    throw e;
  }

  const gasParams = overrideWithFastSpeedIfNeeded({
    selectedGas,
    chainId,
    gasFeeParamsBySpeed,
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
    logger.error({
      name: 'unlock: error executeApprove',
      message: (e as Error)?.message,
    });
    throw e;
  }

  return approval?.nonce;
};
