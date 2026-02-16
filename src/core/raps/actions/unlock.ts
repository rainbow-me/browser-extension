import type { BatchCall } from '@rainbow-me/delegation';
import {
  Address,
  Hash,
  type Hex,
  WalletClient,
  encodeFunctionData,
  erc20Abi,
  erc721Abi,
  maxUint256,
  parseUnits,
  toHex,
} from 'viem';

import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { NewTransaction, TransactionRequest } from '~/core/types/transactions';
import { getErrorMessage } from '~/core/utils/errors';
import { addNewTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

import { ETH_ADDRESS } from '../../references';
import { ParsedAsset } from '../../types/assets';
import {
  ActionProps,
  RapActionResult,
  type RapUnlockActionParameters,
} from '../references';
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
    const client = getViemClient({ chainId });
    const allowance = await client.readContract({
      address: assetAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, spender],
    });
    return allowance.toString();
  } catch (error) {
    logger.error(new RainbowError('getRawAllowance: error'), {
      message: getErrorMessage(error),
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

  if (!allowance) return true;
  const rawAmount = parseUnits(String(amount), assetToUnlock.decimals);
  const needsUnlocking = !(BigInt(allowance) > rawAmount);
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
}): Promise<bigint> => {
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  try {
    const client = getViemClient({ chainId });
    const gasLimit = await client.estimateContractGas({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, maxUint256],
      account: owner,
    });
    return gasLimit || BigInt(chainGasUnits.basic.approval);
  } catch (error) {
    logger.error(new RainbowError('unlock: error estimateApprove'), {
      message: getErrorMessage(error),
    });
    return BigInt(chainGasUnits.basic.approval);
  }
};

export const populateApprove = async ({
  owner,
  tokenAddress,
  spender,
  amount,
}: {
  owner: Address;
  tokenAddress: Address;
  spender: Address;
  chainId?: ChainId;
  amount?: bigint;
}): Promise<TransactionRequest | null> => {
  try {
    const approveAmount = amount ?? maxUint256;
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, approveAmount],
    });
    return { from: owner, to: tokenAddress, data };
  } catch (error) {
    logger.error(new RainbowError(' error populateApprove'), {
      message: getErrorMessage(error),
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
}): Promise<bigint> => {
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  try {
    const client = getViemClient({ chainId });
    const gasLimit = await client.estimateContractGas({
      address: tokenAddress,
      abi: erc721Abi,
      functionName: 'setApprovalForAll',
      args: [spender, false],
      account: owner,
    });
    return gasLimit || BigInt(chainGasUnits.basic.approval);
  } catch (error) {
    logger.error(
      new RainbowError('estimateERC721Approval: error estimateApproval'),
      {
        message: getErrorMessage(error),
      },
    );
    return BigInt(chainGasUnits.basic.approval);
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
}): Promise<TransactionRequest> => {
  if (!tokenAddress || !spenderAddress || !chainId) return {};
  if (type === 'erc20') {
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, 0n],
    });
    return { to: tokenAddress, data };
  } else {
    const data = encodeFunctionData({
      abi: erc721Abi,
      functionName: 'setApprovalForAll',
      args: [spenderAddress, false],
    });
    return { to: tokenAddress, data };
  }
};

export const executeApprove = async ({
  gasParams,
  gasLimit,
  nonce,
  spender,
  tokenAddress,
  wallet,
  chainId,
}: {
  gasParams: Partial<TransactionGasParams & TransactionLegacyGasParams>;
  gasLimit: bigint;
  nonce?: number;
  spender: Address;
  tokenAddress: Address;
  wallet: WalletClient;
  chainId: ChainId;
}): Promise<{ hash: Hash; nonce?: number; chainId: ChainId }> => {
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasParams;

  const gasArgs = maxFeePerGas
    ? {
        gas: gasLimit || undefined,
        maxFeePerGas: BigInt(maxFeePerGas),
        maxPriorityFeePerGas: maxPriorityFeePerGas
          ? BigInt(maxPriorityFeePerGas)
          : undefined,
      }
    : {
        gas: gasLimit || undefined,
        gasPrice: gasPrice ? BigInt(gasPrice) : undefined,
      };

  const hash = await wallet.writeContract({
    chain: wallet.chain ?? null,
    account: wallet.account!,
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, maxUint256],
    nonce,
    ...gasArgs,
  });

  return { hash, nonce, chainId };
};

export const prepareUnlock = async ({
  parameters,
}: {
  parameters: RapUnlockActionParameters;
  wallet: WalletClient;
  chainId: number;
  quote: unknown;
}): Promise<{ call: BatchCall | null }> => {
  const amount = parameters.amount;
  if (amount === undefined) {
    throw new RainbowError(
      'prepareUnlock: amount is required for atomic swaps; atomic path must approve exact amount, never unlimited',
    );
  }
  const tokenAddress = parameters.assetToUnlock.address;
  if (tokenAddress === ETH_ADDRESS) {
    return { call: null };
  }
  const tx = await populateApprove({
    owner: parameters.fromAddress,
    tokenAddress,
    spender: parameters.contractAddress,
    amount: parseUnits(amount, parameters.assetToUnlock.decimals),
  });

  if (!tx?.data) return { call: null };

  return {
    call: {
      to: tokenAddress as Address,
      value: toHex(0n) as Hex,
      data: tx.data as Hex,
    },
  };
};

export const unlock = async ({
  baseNonce,
  client,
  index,
  parameters,
  wallet,
}: ActionProps<'unlock'>): Promise<RapActionResult> => {
  const { selectedGas, gasFeeParamsBySpeed } = useGasStore.getState();
  if (!selectedGas) throw new RainbowError('unlock: gas params not available');

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
      message: getErrorMessage(e),
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
      chainId,
    });
  } catch (e) {
    logger.error(new RainbowError('unlock: error executeApprove'), {
      message: getErrorMessage(e),
    });
    throw e;
  }

  if (!approval) throw new RainbowError('unlock: error executeApprove');

  const tx = await client.getTransaction({ hash: approval.hash });

  const transaction = {
    asset: assetToUnlock,
    changes: [],
    from: parameters.fromAddress,
    to: assetAddress,
    hash: approval.hash,
    chainId: approval.chainId,
    nonce: tx.nonce,
    status: 'pending',
    type: 'approve',
    approvalAmount: 'UNLIMITED',
    ...('gasPrice' in gasParams
      ? { gasPrice: gasParams.gasPrice.toString() }
      : {
          maxFeePerGas: gasParams.maxFeePerGas.toString(),
          maxPriorityFeePerGas: gasParams.maxPriorityFeePerGas.toString(),
        }),
  } satisfies NewTransaction;

  addNewTransaction({
    address: parameters.fromAddress,
    chainId: approval.chainId,
    transaction,
  });

  return {
    nonce: tx.nonce,
    hash: approval.hash,
  };
};
