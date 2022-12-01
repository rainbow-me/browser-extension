import { MaxUint256 } from '@ethersproject/constants';
import { Address, Chain, erc20ABI, getProvider } from '@wagmi/core';
import { Contract, Wallet } from 'ethers';

import { ethUnits } from '../references';
import { ParsedAsset } from '../types/assets';
import { convertAmountToRawAmount, greaterThan, toHex } from '../utils/numbers';

const getRawAllowance = async ({
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
}): Promise<number | string> => {
  try {
    // if (
    //   allowsPermit &&
    //   ALLOWS_PERMIT[
    //     tokenAddress?.toLowerCase() as keyof PermitSupportedTokenList
    //   ]
    // ) {
    //   return '0';
    // }

    const provider = getProvider({ chainId });
    const tokenContract = new Contract(tokenAddress, erc20ABI, provider);
    const gasLimit = await tokenContract.estimateGas.approve(
      spender,
      MaxUint256,
      {
        from: owner,
      },
    );
    return gasLimit ? gasLimit.toString() : ethUnits.basic_approval;
  } catch (error) {
    return ethUnits.basic_approval;
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
