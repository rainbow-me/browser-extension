import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import AppEth from '@ledgerhq/hw-app-eth';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { uuid4 } from '@sentry/utils';
import { getProvider } from '@wagmi/core';
import { Bytes } from 'ethers';
import { Mnemonic, keccak256 } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { PrivateKey } from '~/core/keychain/IKeychain';
import { initializeMessenger } from '~/core/messengers';
import { gasStore } from '~/core/state';
import { KeychainWallet } from '~/core/types/keychainTypes';
import { hasPreviousTransactions } from '~/core/utils/ethereum';
import { estimateGasWithPadding } from '~/core/utils/gas';
import { toHex } from '~/core/utils/numbers';

import {
  sendTransactionFromLedger,
  signMessageByTypeFromLedger,
} from './ledger';

const messenger = initializeMessenger({ connect: 'background' });

export const walletAction = async (action: string, payload: unknown) => {
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
  // Check the type of account it is

  const { selectedGas } = gasStore.getState();
  const provider = getProvider({
    chainId: transactionRequest.chainId,
  });
  const gasLimit = await estimateGasWithPadding({
    transactionRequest,
    provider,
  });

  const params = {
    ...transactionRequest,
    ...selectedGas.transactionGasParams,
    gasLimit: toHex(gasLimit || '0'),
    value: transactionRequest?.value,
  };

  const { type, vendor } = await getWallet(transactionRequest.from as Address);
  console.log('send transaction', type, vendor);
  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        console.log('sending from ledger');
        return sendTransactionFromLedger(params);
      case 'Trezor':
        throw new Error('Trezor not supported yet');
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    console.log('normal send');
    return walletAction(
      'send_transaction',
      params,
    ) as unknown as TransactionResponse;
  }
};

export const personalSign = async (
  msgData: string | Bytes,
  address: Address,
): Promise<string> => {
  const { type, vendor } = await getWallet(address as Address);
  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        return signMessageByTypeFromLedger(msgData, address, 'personal_sign');
      case 'Trezor':
        throw new Error('Trezor not supported yet');
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    return (await signMessageByType(
      msgData,
      address,
      'personal_sign',
    )) as string;
  }
};

export const signTypedData = async (
  msgData: string | Bytes,
  address: Address,
) => {
  const { type, vendor } = await getWallet(address as Address);
  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        return signMessageByTypeFromLedger(msgData, address, 'sign_typed_data');
      case 'Trezor':
        throw new Error('Trezor not supported yet');
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    return (await signMessageByType(
      msgData,
      address,
      'sign_typed_data',
    )) as string;
  }
};

export const lock = async () => {
  await walletAction('lock', {});
  await chrome.storage.session.set({ userStatus: 'LOCKED' });
  return;
};

export const unlock = async (password: string): Promise<boolean> => {
  const res = await walletAction('unlock', password);
  if (res) {
    await chrome.storage.session.set({ userStatus: 'READY' });
  }
  return res as boolean;
};

export const wipe = async (password: string) => {
  await walletAction('wipe', password);
  await chrome.storage.session.set({ userStatus: 'NEW' });
  return;
};
export const testSandbox = async () => {
  return await walletAction('test_sandbox', {});
};

export const updatePassword = async (password: string, newPassword: string) => {
  const ret = await walletAction('update_password', {
    password,
    newPassword,
  });
  // We have a vault
  // We have a password
  // It's unlocked
  // Then it's ready to use
  await chrome.storage.session.set({ userStatus: 'READY' });
  return ret as boolean;
};

export const deriveAccountsFromSecret = async (secret: string) => {
  return (await walletAction(
    'derive_accounts_from_secret',
    secret,
  )) as Address[];
};

export const verifyPassword = async (password: string) => {
  return (await walletAction('verify_password', password)) as boolean;
};

export const getAccounts = async () => {
  return (await walletAction('get_accounts', {})) as Address[];
};
export const getWallets = async () => {
  return (await walletAction('get_wallets', {})) as KeychainWallet[];
};

export const getWallet = async (address: Address) => {
  return (await walletAction('get_wallet', address)) as KeychainWallet;
};

export const getStatus = async () => {
  return (await walletAction('status', {})) as {
    unlocked: boolean;
    hasVault: boolean;
    passwordSet: boolean;
  };
};

export const create = async () => {
  const address = await walletAction('create', {});

  // we probably need to set a password
  let newStatus = 'NEEDS_PASSWORD';
  const { passwordSet } = await getStatus();
  // unless we have a password, then we're ready to go
  if (passwordSet) {
    newStatus = 'READY';
  }
  await chrome.storage.session.set({ userStatus: newStatus });
  return address as Address;
};

export const importWithSecret = async (seed: string) => {
  const address = await walletAction('import', seed);
  // we probably need to set a password
  let newStatus = 'NEEDS_PASSWORD';
  const { passwordSet } = await getStatus();
  // unless we have a password, then we're ready to go
  if (passwordSet) {
    newStatus = 'READY';
  }
  await chrome.storage.session.set({ userStatus: newStatus });
  return address as Address;
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

export const connectLedger = async () => {
  // Connect to the device
  try {
    const transport = await TransportWebUSB.create();
    const appEth = new AppEth(transport);
    const result = await appEth.getAddress("44'/60'/0'/0/0", false, false);
    const addressesToImport = [{ address: result.address, index: 0 }];
    // The device id is the keccak256 of the address at index 0
    // @HW/TODO - discovery
    let accountsEnabled = 1;
    // Autodiscover accounts
    let empty = false;
    while (!empty) {
      // eslint-disable-next-line no-await-in-loop
      const result = await appEth.getAddress(
        `44'/60'/0'/0/${accountsEnabled}`,
        false,
        false,
      );

      // eslint-disable-next-line no-await-in-loop
      const hasBeenUsed = await hasPreviousTransactions(
        result.address as Address,
      );

      if (hasBeenUsed) {
        addressesToImport.push({
          address: result.address,
          index: accountsEnabled,
        });
        accountsEnabled += 1;
      } else {
        empty = true;
      }
    }

    const deviceId = keccak256(result.address);
    const address = await walletAction('import_hw', {
      deviceId,
      wallets: addressesToImport,
      vendor: 'Ledger',
      accountsEnabled,
    });
    // we probably need to set a password
    let newStatus = 'NEEDS_PASSWORD';
    const { passwordSet } = await getStatus();
    // unless we have a password, then we're ready to go
    if (passwordSet) {
      newStatus = 'READY';
    }
    await chrome.storage.session.set({ userStatus: newStatus });
    return address;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(e);
    if (e?.name === 'TransportStatusError') {
      alert(
        'Please make sure your ledger is unlocked and open the Ethereum app',
      );
    } else {
      alert('Unable to connect to your ledger. Please try again.');
    }
    return null;
  }
};
