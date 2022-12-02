import { MaxUint256 } from '@ethersproject/constants';
import { RAINBOW_ROUTER_CONTRACT_ADDRESS } from '@rainbow-me/swaps';
import { Address, Chain, erc20ABI, getProvider } from '@wagmi/core';
import { Contract, Wallet } from 'ethers';

import { ethUnits } from '../references';
import { gasStore } from '../state';
import { ParsedAsset } from '../types/assets';
import { TransactionStatus, TransactionType } from '../types/transactions';
import { convertAmountToRawAmount, greaterThan, toHex } from '../utils/numbers';

import { RapExchangeActionParameters, UnlockActionParameters } from './common';
import { getFastSpeedByDefault } from './utils';

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
    console.log('RAW ALLOWANCE', allowance);
    return allowance.toString();
  } catch (error) {
    console.log('RAW ALLOWANCE error', error);

    return null;
  }
};

export const assetNeedsUnlocking = async ({
  accountAddress,
  amount,
  assetToUnlock,
  contractAddress,
  chainId,
}: {
  accountAddress: Address;
  amount: string;
  assetToUnlock: ParsedAsset;
  contractAddress: Address;
  chainId: Chain['id'];
}) => {
  const { isNativeAsset } = assetToUnlock;
  if (isNativeAsset) return false;

  //   const cacheKey =
  //     `${accountAddress}|${address}|${contractAddress}`.toLowerCase();

  const allowance = await getRawAllowance({
    owner: accountAddress,
    token: assetToUnlock,
    spender: contractAddress,
    chainId,
  });

  // TODO Cache that value
  //   if (allowance !== null) {
  //     AllowancesCache.cache[cacheKey] = allowance;
  //   }

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
  tokenAddress,
  spender,
  gasLimit,
  gasParams,
  wallet,
  nonce,
  chainId,
}: {
  tokenAddress: Address;
  spender: Address;
  gasLimit: string;
  gasParams: {
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
  wallet: Wallet;
  nonce?: number;
  chainId: Chain['id'];
}) => {
  const provider = getProvider({ chainId });
  const walletToUse = new Wallet(wallet.privateKey, provider);

  const exchange = new Contract(tokenAddress, erc20ABI, walletToUse);
  return exchange.approve(spender, MaxUint256, {
    gasLimit: toHex(gasLimit) || undefined,
    // In case it's an L2 with legacy gas price
    ...(gasParams.gasPrice ? { gasPrice: gasParams.gasPrice } : {}),
    // EIP-1559 like networks
    ...(gasParams.maxFeePerGas ? { maxFeePerGas: gasParams.maxFeePerGas } : {}),
    ...(gasParams.maxPriorityFeePerGas
      ? { maxPriorityFeePerGas: gasParams.maxPriorityFeePerGas }
      : {}),
    nonce: nonce ? toHex(String(nonce)) : undefined,
  });
};

export const unlock = async ({
  wallet,
  index,
  parameters,
  baseNonce,
}: {
  wallet: Wallet;
  index: number;
  parameters: RapExchangeActionParameters;
  baseNonce?: number;
}): Promise<number | undefined> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();
  const accountAddress = parameters.tradeDetails?.from as Address;

  const { assetToUnlock, contractAddress, chainId } =
    parameters as UnlockActionParameters;
  const { address: assetAddress } = assetToUnlock;

  const contractAllowsPermit =
    contractAddress === RAINBOW_ROUTER_CONTRACT_ADDRESS;

  const gasLimit = contractAllowsPermit
    ? '0'
    : await estimateApprove({
        owner: accountAddress,
        tokenAddress: assetAddress,
        spender: contractAddress,
        chainId,
      });

  const gasParams = getFastSpeedByDefault({
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
    from: accountAddress,
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
