import { MaxUint256 } from '@ethersproject/constants';
import { Address, Chain, erc20ABI, getProvider } from '@wagmi/core';
import { Contract, Wallet } from 'ethers';

import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';

import { ethUnits } from '../../references';
import { gasStore } from '../../state';
import { ParsedAsset } from '../../types/assets';
import { TransactionStatus, TransactionType } from '../../types/transactions';
import {
  convertAmountToRawAmount,
  greaterThan,
  toHex,
} from '../../utils/numbers';
import { RapUnlockActionParameters } from '../references';

import { overrideWithFastSpeedIfNeeded } from './../utils';

export const getRawAllowance = async ({
  owner,
  token,
  spender,
  chainId,
}: {
  owner: Address;
  token: ParsedAsset;
  spender: Address;
  chainId: Chain['id'];
}) => {
  try {
    const provider = await getProvider({ chainId });
    const { address: tokenAddress } = token;
    const tokenContract = new Contract(tokenAddress, erc20ABI, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance.toString();
  } catch (error) {
    return null;
  }
};

export const assetNeedsUnlocking = async ({
  owner,
  amount,
  token,
  spender,
  chainId,
}: {
  owner: Address;
  amount: string;
  token: ParsedAsset;
  spender: Address;
  chainId: Chain['id'];
}) => {
  if (token.isNativeAsset) return false;

  const allowance = await getRawAllowance({
    owner,
    token,
    spender,
    chainId,
  });

  const rawAmount = convertAmountToRawAmount(amount, token.decimals);
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
  chainId: Chain['id'];
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
    return gasLimit ? gasLimit.toString() : `${ethUnits.basic_approval}`;
  } catch (error) {
    return `${ethUnits.basic_approval}`;
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
  chainId: Chain['id'];
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
}: {
  baseNonce?: number;
  index: number;
  parameters: RapUnlockActionParameters;
  wallet: Wallet;
}): Promise<number | undefined> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  const { assetToUnlock, contractAddress, chainId } = parameters;

  const { address: assetAddress } = assetToUnlock;

  const gasLimit = await estimateApprove({
    owner: parameters.fromAddress,
    tokenAddress: assetAddress,
    spender: contractAddress,
    chainId,
  });

  const gasParams = overrideWithFastSpeedIfNeeded({
    selectedGas,
    chainId,
    gasFeeParamsBySpeed,
  });

  const nonce = baseNonce ? baseNonce + index : undefined;
  const approval = await executeApprove({
    tokenAddress: assetAddress,
    spender: contractAddress,
    gasLimit,
    gasParams,
    wallet,
    nonce,
    chainId,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newTransaction = {
    amount: 0,
    asset: assetToUnlock,
    data: approval.data,
    from: parameters.fromAddress,
    gasLimit,
    hash: approval?.hash,
    chainId,
    nonce: approval?.nonce,
    status: TransactionStatus.approving,
    to: approval?.to,
    type: TransactionType.authorize,
    value: toHex(approval.value),
    ...gasParams,
  };
  return approval?.nonce;
};
