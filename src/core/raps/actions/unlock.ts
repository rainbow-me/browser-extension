import { Signer } from '@ethersproject/abstract-signer';
import { MaxUint256 } from '@ethersproject/constants';
import { Contract, PopulatedTransaction } from '@ethersproject/contracts';
import { parseUnits } from '@ethersproject/units';
import { Address, Hash, erc20Abi, erc721Abi } from 'viem';

import { gasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { ETH_ADDRESS, gasUnits } from '../../references';
import { ParsedAsset } from '../../types/assets';
import {
  convertAmountToRawAmount,
  greaterThan,
  toBigNumber,
} from '../../utils/numbers';
import { ActionProps, RapActionResult } from '../references';
import { overrideWithFastSpeedIfNeeded } from '../utils';

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
    const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
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

export const populateApprove = async ({
  owner,
  tokenAddress,
  spender,
  chainId,
}: {
  owner: Address;
  tokenAddress: Address;
  spender: Address;
  chainId: ChainId;
}): Promise<PopulatedTransaction | null> => {
  try {
    const provider = getProvider({ chainId });
    const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
    const approveTransaction = await tokenContract.populateTransaction.approve(
      spender,
      MaxUint256,
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
  type: 'erc20' | 'nft';
}): Promise<PopulatedTransaction> => {
  if (!tokenAddress || !spenderAddress || !chainId) return {};
  const provider = getProvider({ chainId });
  const tokenContract = new Contract(tokenAddress, erc721Abi, provider);
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
  gasParams,
  gasLimit,
  nonce,
  spender,
  tokenAddress,
  wallet,
}: {
  gasParams: Partial<TransactionGasParams & TransactionLegacyGasParams>;
  gasLimit: string;
  nonce?: number;
  spender: Address;
  tokenAddress: Address;
  wallet: Signer;
}) => {
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasParams;

  const tokenContract = new Contract(tokenAddress, erc20Abi, wallet);

  return await tokenContract.approve(spender, MaxUint256, {
    nonce,
    gasLimit: toBigNumber(gasLimit),
    gasPrice: toBigNumber(gasPrice),
    maxFeePerGas: toBigNumber(maxFeePerGas),
    maxPriorityFeePerGas: toBigNumber(maxPriorityFeePerGas),
  });
};

// fix this
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
      nonce,
      wallet,
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
    hash: approval.hash as Hash,
    chainId: approval.chainId as ChainId,
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
