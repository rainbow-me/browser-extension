import { Signer } from '@ethersproject/abstract-signer';
import { Contract, PopulatedTransaction } from '@ethersproject/contracts';
import { type BatchCall, supportsDelegation } from '@rainbow-me/delegation';
import { Address, Hash, Hex, erc20Abi, erc721Abi, maxUint256 } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { useGasStore } from '~/core/state';
import { useFeatureFlagLocalOverwriteStore } from '~/core/state/currentSettings/featureFlags';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { ETH_ADDRESS } from '../../references';
import { ParsedAsset } from '../../types/assets';
import { toHex } from '../../utils/hex';
import {
  convertAmountToRawAmount,
  greaterThan,
  toBigNumber,
} from '../../utils/numbers';
import {
  ActionProps,
  PrepareActionProps,
  RapActionResult,
} from '../references';
import { overrideWithFastSpeedIfNeeded } from '../utils';
import { requireAddress, requireHex } from '../validation';

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
    const provider = getProvider({ chainId });
    const tokenContract = new Contract(assetAddress, erc20Abi, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance.toString();
  } catch (error) {
    logger.error(new RainbowError('getRawAllowance: error'), {
      message: (error as Error)?.message,
    });
    return null;
  }
};

function parseRawAmount(
  value: string | undefined,
  decimals?: number,
): bigint | null {
  if (!value || value === '') return null;
  try {
    if (decimals !== undefined) {
      const raw = convertAmountToRawAmount(value, decimals);
      return BigInt(raw);
    }
    return BigInt(value);
  } catch {
    return null;
  }
}

export const getApprovalAmount = async ({
  address,
  chainId,
  amount,
}: {
  address: Address;
  chainId: ChainId;
  amount: string;
}): Promise<{ approvalAmount: string; isUnlimited: boolean }> => {
  const remoteEnabled = config.delegation_enabled ?? false;
  const localEnabled =
    useFeatureFlagLocalOverwriteStore.getState().featureFlags
      .delegation_enabled;
  const delegationEnabled =
    localEnabled !== null ? localEnabled : remoteEnabled;

  if (delegationEnabled) {
    try {
      const { supported } = await supportsDelegation({ address, chainId });
      if (supported) {
        return { approvalAmount: amount, isUnlimited: false };
      }
    } catch {
      // Fall through to unlimited on error
    }
  }
  return { approvalAmount: maxUint256.toString(), isUnlimited: true };
};

export const needsTokenApproval = async ({
  owner,
  tokenAddress,
  spender,
  amount,
  chainId,
  decimals,
}: {
  owner: Address;
  tokenAddress: Address;
  spender: Address;
  amount: string;
  chainId: ChainId;
  decimals?: number;
}): Promise<boolean> => {
  const requiredAmount = parseRawAmount(amount, decimals);
  if (requiredAmount === null) return true;

  const allowance = await getAssetRawAllowance({
    owner,
    assetAddress: tokenAddress,
    spender,
    chainId,
  });
  if (allowance === null) return true;

  const currentAllowance = parseRawAmount(allowance);
  if (currentAllowance === null) return true;

  return currentAllowance < requiredAmount;
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
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  try {
    const provider = getProvider({ chainId });
    const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
    const gasLimit = await tokenContract.estimateGas.approve(
      spender,
      maxUint256,
      {
        from: owner,
      },
    );
    return gasLimit ? gasLimit.toString() : `${chainGasUnits.basic.approval}`;
  } catch (error) {
    logger.error(new RainbowError('unlock: error estimateApprove'), {
      message: (error as Error)?.message,
    });
    return `${chainGasUnits.basic.approval}`;
  }
};

export const populateApprove = async ({
  owner,
  tokenAddress,
  spender,
  chainId,
  amount,
}: {
  owner: Address;
  tokenAddress: Address;
  spender: Address;
  chainId: ChainId;
  amount?: string;
}): Promise<PopulatedTransaction | null> => {
  try {
    const provider = getProvider({ chainId });
    const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
    // Use specific amount if provided (for atomic swaps), otherwise unlimited
    const approvalAmount = amount ? BigInt(amount) : maxUint256;
    const approveTransaction = await tokenContract.populateTransaction.approve(
      spender,
      approvalAmount,
      {
        from: owner,
      },
    );
    return approveTransaction;
  } catch (error) {
    logger.error(new RainbowError(' error populateApprove'), {
      message: (error as Error)?.message,
    });
    return null;
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
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  try {
    const provider = getProvider({ chainId });
    const tokenContract = new Contract(tokenAddress, erc721Abi, provider);
    const gasLimit = await tokenContract.estimateGas.setApprovalForAll(
      spender,
      false,
      {
        from: owner,
      },
    );
    return gasLimit ? gasLimit.toString() : `${chainGasUnits.basic.approval}`;
  } catch (error) {
    logger.error(
      new RainbowError('estimateERC721Approval: error estimateApproval'),
      {
        message: (error as Error)?.message,
      },
    );
    return `${chainGasUnits.basic.approval}`;
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
  type: 'erc20' | 'nft';
}): Promise<PopulatedTransaction> => {
  if (!tokenAddress || !spenderAddress || !chainId) return {};
  const provider = getProvider({ chainId });
  const tokenContract = new Contract(tokenAddress, erc721Abi, provider);
  if (type === 'erc20') {
    const amountToApprove = 0n;
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
  gasParams,
  gasLimit,
  nonce,
  spender,
  tokenAddress,
  wallet,
  approvalAmount,
}: {
  gasParams: Partial<TransactionGasParams & TransactionLegacyGasParams>;
  gasLimit: string;
  nonce?: number;
  spender: Address;
  tokenAddress: Address;
  wallet: Signer;
  approvalAmount: string;
}) => {
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasParams;

  const tokenContract = new Contract(tokenAddress, erc20Abi, wallet);

  return await tokenContract.approve(spender, approvalAmount, {
    nonce,
    gasLimit: toBigNumber(gasLimit),
    gasPrice: toBigNumber(gasPrice),
    maxFeePerGas: toBigNumber(maxFeePerGas),
    maxPriorityFeePerGas: toBigNumber(maxPriorityFeePerGas),
  });
};

/**
 * Prepare an unlock (approval) call for atomic execution.
 * Returns the BatchCall object without executing the transaction.
 * Atomic swaps must approve exact amount, never unlimited.
 */
export const prepareUnlock = async ({
  parameters,
}: PrepareActionProps<'unlock'>): Promise<{ call: BatchCall | null }> => {
  if (parameters.amount === undefined) {
    throw new RainbowError(
      'prepareUnlock: amount is required for atomic swaps; atomic path must approve exact amount, never unlimited',
    );
  }
  const tokenAddress = requireAddress(
    parameters.assetToUnlock.address,
    'unlock asset address',
  );
  const tx = await populateApprove({
    owner: parameters.fromAddress,
    tokenAddress,
    spender: parameters.contractAddress,
    chainId: parameters.chainId,
    amount: parameters.amount,
  });

  if (!tx?.data) return { call: null };
  const data = requireHex(tx.data, 'unlock prepared tx.data');

  return {
    call: {
      to: tokenAddress,
      value: toHex(BigInt(tx.value?.toString() ?? '0')) as Hex,
      data,
    },
  };
};

export const unlock = async ({
  baseNonce,
  index,
  parameters,
  wallet,
}: ActionProps<'unlock'>): Promise<RapActionResult> => {
  const { selectedGas, gasFeeParamsBySpeed } = useGasStore.getState();

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

  const { approvalAmount, isUnlimited } = await getApprovalAmount({
    address: parameters.fromAddress,
    chainId,
    amount: parameters.amount,
  });

  let approval;

  try {
    approval = await executeApprove({
      tokenAddress: assetAddress,
      spender: contractAddress,
      gasLimit,
      gasParams,
      nonce,
      wallet,
      approvalAmount,
    });
  } catch (e) {
    logger.error(new RainbowError('unlock: error executeApprove'), {
      message: (e as Error)?.message,
    });
    throw e;
  }

  if (!approval) throw new RainbowError('unlock: error executeApprove');

  const transaction: NewTransaction = {
    asset: assetToUnlock,
    data: approval.data,
    value: approval.value?.toString(),
    changes: [],
    from: parameters.fromAddress,
    to: assetAddress,
    hash: approval.hash as Hash,
    chainId: approval.chainId as ChainId,
    nonce: approval.nonce,
    status: 'pending',
    type: 'approve',
    approvalAmount: (isUnlimited ? 'UNLIMITED' : approvalAmount) as
      | 'UNLIMITED'
      | (string & object),
    ...gasParams,
  };

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
