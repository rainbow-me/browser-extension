import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { uuid4 } from '@sentry/utils';
import { getProvider } from '@wagmi/core';
import { Bytes } from 'ethers';
import { Mnemonic } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { PrivateKey } from '~/core/keychain/IKeychain';
import { initializeMessenger } from '~/core/messengers';
import { gasStore } from '~/core/state';
import { estimateGasWithPadding } from '~/core/utils/gas';

const messenger = initializeMessenger({ connect: 'background' });

const walletAction = async (action: string, payload: unknown) => {
  const { result }: { result: unknown } = await messenger.send(
    'wallet_action',
    {
      action,
      payload,
    },
    { id: uuid4() },
  );
  return result;
};

const signMessageByType = async (
  msgData: string | Bytes,
  address: Address,
  type: 'personal_sign' | 'sign_typed_data',
) => {
  return walletAction(type, {
    address,
    msgData,
  });
};

export const sendTransaction = async (
  transactionRequest: TransactionRequest,
): Promise<TransactionResponse> => {
  const { selectedGas } = gasStore.getState();
  const provider = getProvider({
    chainId: transactionRequest.chainId,
  });
  const gasLimit = await estimateGasWithPadding({
    transactionRequest,
    provider,
  });
  return walletAction('send_transaction', {
    ...transactionRequest,
    ...selectedGas.transactionGasParams,
    gasLimit,
  }) as unknown as TransactionResponse;
};

export const personalSign = async (
  msgData: string | Bytes,
  address: Address,
): Promise<string> => {
  return (await signMessageByType(msgData, address, 'personal_sign')) as string;
};

export const signTypedData = async (
  msgData: string | Bytes,
  address: Address,
) => {
  return (await signMessageByType(
    msgData,
    address,
    'sign_typed_data',
  )) as string;
};

export const lock = async () => {
  return walletAction('lock', {});
};

export const unlock = async (password: string): Promise<boolean> => {
  return (await walletAction('unlock', password)) as boolean;
};

export const wipe = async (password: string) => {
  return await walletAction('wipe', password);
};
export const testSandbox = async () => {
  return await walletAction('test_sandbox', {});
};

export const updatePassword = async (password: string, newPassword: string) => {
  return (await walletAction('update_password', {
    password,
    newPassword,
  })) as boolean;
};

export const dangerouslyUpdatePassword = async (newPassword: string) => {
  return (await walletAction(
    'dangerously_update_password',
    newPassword,
  )) as boolean;
};

export const verifyPassword = async (password: string) => {
  return (await walletAction('verify_password', password)) as boolean;
};

export const getAccounts = async () => {
  return (await walletAction('get_accounts', {})) as Address[];
};

export const getStatus = async () => {
  return (await walletAction('status', {})) as {
    unlocked: boolean;
    hasVault: boolean;
  };
};

export const create = async () => {
  return (await walletAction('create', {})) as Address;
};

export const importWithSecret = async (seed: string) => {
  return (await walletAction('import', seed)) as Address;
};

export const remove = async (address: Address) => {
  return walletAction('remove', address);
};
export const add = async (silbing: Address) => {
  return (await walletAction('add', silbing)) as Address;
};

export const exportWallet = async (address: Address, password: string) => {
  return (await walletAction('export_wallet', {
    address,
    password,
  })) as Mnemonic['phrase'];
};

export const exportAccount = async (address: Address, password: string) => {
  return (await walletAction('export_account', {
    address,
    password,
  })) as PrivateKey;
};
