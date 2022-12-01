import { Address, Chain, erc20ABI, getProvider } from '@wagmi/core';
import { Contract } from 'ethers';

import { ParsedAsset } from '../types/assets';
import { convertAmountToRawAmount, greaterThan } from '../utils/numbers';

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
