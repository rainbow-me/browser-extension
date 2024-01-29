import { Signer } from '@ethersproject/abstract-signer';
import { MaxUint256 } from '@ethersproject/constants';
import { Contract, PopulatedTransaction } from '@ethersproject/contracts';
import { parseUnits } from '@ethersproject/units';
import {
  Address,
  erc20ABI,
  erc721ABI,
  getContract,
  getProvider,
} from '@wagmi/core';

import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

import { ETH_ADDRESS, gasUnits } from '../../references';
import { gasStore } from '../../state';
import { ParsedAsset } from '../../types/assets';
import {
  convertAmountToRawAmount,
  greaterThan,
  toBigNumber,
} from '../../utils/numbers';
import { ActionProps, RapActionResult } from '../references';

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

export const estimateERC721Approval = async ({
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
    const tokenContract = new Contract(tokenAddress, erc721ABI, provider);
    const gasLimit = await tokenContract.estimateGas.setApprovalForAll(
      spender,
      false,
      {
        from: owner,
      },
    );
    return gasLimit ? gasLimit.toString() : `${gasUnits.basic_approval}`;
  } catch (error) {
    logger.error(
      new RainbowError('estimateERC721Approval: error estimateApproval'),
      {
        message: (error as Error)?.message,
      },
    );
    return `${gasUnits.basic_approval}`;
  }
};

export const populateRevokeApproval = async ({
  tokenAddress,
  spenderAddress,
  chainId,
  type = 'erc20',
}: {
  tokenAddress?: Address;
  spenderAddress?: Address;
  chainId?: ChainId;
  type: 'erc20' | 'erc721';
}): Promise<PopulatedTransaction> => {
  if (!tokenAddress || !spenderAddress || !chainId) return {};
  const provider = getProvider({ chainId });
  const tokenContract = new Contract(tokenAddress, erc721ABI, provider);
  if (type === 'erc20') {
    const amountToApprove = parseUnits('0', 'ether');
    const txObject = await tokenContract.populateTransaction.approve(
      spenderAddress,
      amountToApprove,
    );
    return txObject;
  } else {
    const txObject = await tokenContract.populateTransaction.setApprovalForAll(
      spenderAddress,
      false,
    );
    return txObject;
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
  gasParams: Partial<TransactionGasParams & TransactionLegacyGasParams>;
  nonce?: number;
  spender: Address;
  tokenAddress: Address;
  wallet: Signer;
}) => {
  const tokenContract = getContract({
    address: tokenAddress,
    abi: erc20ABI,
    signerOrProvider: wallet,
  });

  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasParams;

  return tokenContract.approve(spender, MaxUint256, {
    nonce,
    gasLimit: toBigNumber(gasLimit),
    gasPrice: toBigNumber(gasPrice),
    maxFeePerGas: toBigNumber(maxFeePerGas),
    maxPriorityFeePerGas: toBigNumber(maxPriorityFeePerGas),
  });
};

export const unlock = async ({
  baseNonce,
  index,
  parameters,
  wallet,
}: ActionProps<'unlock'>): Promise<RapActionResult> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  const { assetToUnlock, contractAddress, chainId } = parameters;

  const { address: assetAddress } = assetToUnlock;

  if (assetAddress === ETH_ADDRESS)
    throw new RainbowError('unlock: Native ETH cannot be unlocked');

  let gasLimit;
  try {
    gasLimit = await estimateApprove({
      owner: parameters.fromAddress,
      tokenAddress: assetAddress,
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
      tokenAddress: assetAddress,
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

  if (!approval) throw new RainbowError('unlock: error executeApprove');

  const transaction = {
    asset: assetToUnlock,
    data: approval.data,
    value: approval.value?.toString(),
    changes: [],
    from: parameters.fromAddress,
    to: assetAddress,
    hash: approval.hash as TxHash,
    chainId: approval.chainId,
    nonce: approval.nonce,
    status: 'pending',
    type: 'approve',
    approvalAmount: 'UNLIMITED',
    ...gasParams,
  } satisfies NewTransaction;

  addNewTransaction({
    address: parameters.fromAddress as Address,
    chainId: approval.chainId as ChainId,
    transaction,
  });

  return {
    nonce: approval?.nonce,
    hash: approval?.hash,
  };
};
