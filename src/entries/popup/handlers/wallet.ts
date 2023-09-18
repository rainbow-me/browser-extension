import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Bytes } from '@ethersproject/bytes';
import { HDNode, Mnemonic } from '@ethersproject/hdnode';
import { keccak256 } from '@ethersproject/keccak256';
import AppEth from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { PrivateKey } from '~/core/keychain/IKeychain';
import { getHDPathForVendorAndType } from '~/core/keychain/hdPath';
import {
  RapSwapActionParameters,
  RapTypes,
  WalletExecuteRapProps,
} from '~/core/raps/references';
import { gasStore } from '~/core/state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { KeychainWallet } from '~/core/types/keychainTypes';
import { ExecuteRapResponse } from '~/core/types/transactions';
import { hasPreviousTransactions } from '~/core/utils/ethereum';
import { estimateGasWithPadding } from '~/core/utils/gas';
import { toHex } from '~/core/utils/hex';
import { getNextNonce } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

import { PathOptions } from '../pages/hw/addByIndexSheet';

import {
  sendTransactionFromLedger,
  signMessageByTypeFromLedger,
  signTransactionFromLedger,
} from './ledger';
import {
  sendTransactionFromTrezor,
  signMessageByTypeFromTrezor,
  signTransactionFromTrezor,
} from './trezor';
import { walletAction } from './walletAction';
import { HARDWARE_WALLETS } from './walletVariables';

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

export const signTransactionFromHW = async (
  transactionRequest: TransactionRequest,
  vendor: string,
): Promise<string | undefined> => {
  const { selectedGas } = gasStore.getState();
  const provider = getProvider({
    chainId: transactionRequest.chainId,
  });
  const gasLimit = await estimateGasWithPadding({
    transactionRequest,
    provider,
  });

  const nonce = await getNextNonce({
    address: transactionRequest.from as Address,
    chainId: transactionRequest.chainId as number,
  });

  const params = {
    ...transactionRequest,
    ...selectedGas.transactionGasParams,
    value: transactionRequest?.value,
    nonce,
  };

  if (gasLimit) {
    params.gasLimit = toHex(gasLimit);
  }

  if (vendor === 'Ledger') {
    return signTransactionFromLedger(params);
  } else if (vendor === 'Trezor') {
    return signTransactionFromTrezor(params);
  }
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

  const nonce =
    transactionRequest.nonce ??
    (await getNextNonce({
      address: transactionRequest.from as Address,
      chainId: transactionRequest.chainId as number,
    }));

  const transactionGasParams = {
    maxFeePerGas:
      transactionRequest.maxFeePerGas ||
      (selectedGas.transactionGasParams as TransactionGasParams).maxFeePerGas,
    maxPriorityFeePerGas:
      transactionRequest.maxPriorityFeePerGas ||
      (selectedGas.transactionGasParams as TransactionGasParams)
        .maxPriorityFeePerGas,
    gasPrice:
      transactionRequest.gasPrice ||
      (selectedGas.transactionGasParams as TransactionLegacyGasParams).gasPrice,
  };

  const params = {
    ...transactionRequest,
    ...transactionGasParams,
    gasLimit: toHex(gasLimit || '0'),
    value: transactionRequest?.value,
    nonce,
  };

  let walletInfo;
  try {
    walletInfo = await getWallet(transactionRequest.from as Address);
  } catch (e) {
    const re = new RainbowError('sendTransaction::getWallet error');
    logger.error(re, {
      message: (e as Error)?.message,
      from: transactionRequest.from,
    });
    throw re;
  }
  const { type, vendor } = walletInfo;

  // Check the type of account it is
  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        return sendTransactionFromLedger(params);
      case 'Trezor':
        return sendTransactionFromTrezor(params);
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    return walletAction(
      'send_transaction',
      params,
    ) as unknown as TransactionResponse;
  }
};

export async function executeRap<T extends RapTypes>({
  rapActionParameters,
  type,
}: {
  rapActionParameters: RapSwapActionParameters<T>;
  type: RapTypes;
}): Promise<ExecuteRapResponse> {
  const nonce = await getNextNonce({
    address: rapActionParameters.quote.from as Address,
    chainId: rapActionParameters.chainId as number,
  });
  const params: WalletExecuteRapProps = {
    rapActionParameters: { ...rapActionParameters, nonce },
    type,
  };
  return walletAction('execute_rap', params) as unknown as ExecuteRapResponse;
}

export const personalSign = async (
  msgData: string | Bytes,
  address: Address,
): Promise<string> => {
  const { type, vendor } = await getWallet(address as Address);
  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        return signMessageByTypeFromLedger(msgData, address, 'personal_sign');
      case 'Trezor': {
        return signMessageByTypeFromTrezor(msgData, address, 'personal_sign');
      }
    }
    return '';
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
      case 'Trezor': {
        return signMessageByTypeFromTrezor(msgData, address, 'sign_typed_data');
      }
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

export const wipe = async () => {
  await walletAction('wipe', {});
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
    ready: boolean;
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
export const add = async (sibling: Address) => {
  return (await walletAction('add', sibling)) as Address;
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

export const importAccountAtIndex = async (
  type: string | 'Trezor' | 'Ledger',
  index: number,
  currentPath?: PathOptions,
) => {
  let address = '';
  switch (type) {
    case 'Trezor':
      {
        const path = getHDPathForVendorAndType(index, 'Trezor');
        const result = await window.TrezorConnect.ethereumGetAddress({
          path,
          coin: 'eth',
          showOnTrezor: false,
        });

        if (!result.success) {
          const e = new RainbowError('window.TrezorConnect.getAddress failed');
          logger.error(e, {
            result: JSON.stringify(result, null, 2),
          });
          throw e;
        }
        address = result.payload.address;
      }
      break;
    case 'Ledger': {
      const transport = await TransportWebHID.create();
      const appEth = new AppEth(transport);
      const hdPath =
        currentPath === 'legacy'
          ? getHDPathForVendorAndType(index, 'Ledger', 'legacy')
          : getHDPathForVendorAndType(index, 'Ledger');
      const result = await appEth.getAddress(hdPath, false, false);
      await transport?.close();

      address = result.address;
      break;
    }
    default:
      throw new Error('Unknown wallet type');
  }
  return address;
};

export const connectTrezor = async () => {
  if (process.env.IS_TESTING === 'true') {
    return HARDWARE_WALLETS.MOCK_ACCOUNT;
  }
  try {
    // We don't want the index to be part of the path
    // because we need the public key
    const path = getHDPathForVendorAndType(0, 'Trezor').slice(0, -2);
    const result = await window.TrezorConnect.ethereumGetPublicKey({
      path,
      coin: 'eth',
      showOnTrezor: false,
    });

    if (!result.success) {
      const e = new RainbowError(
        'window.TrezorConnect.ethereumGetPublicKey failed',
      );
      logger.error(e, {
        result: JSON.stringify(result, null, 2),
      });
      throw e;
    }

    const hdNode = HDNode.fromExtendedKey(result.payload.xpub);
    const firstAccountPath = `0`;

    const accountsToImport = [
      { address: hdNode.derivePath(firstAccountPath).address, index: 0 },
    ];
    let accountsEnabled = 1;
    // Autodiscover accounts
    let empty = false;
    while (!empty) {
      const path = `${accountsEnabled}`;
      const newAddress = hdNode.derivePath(path).address;

      // eslint-disable-next-line no-await-in-loop
      const hasBeenUsed = await hasPreviousTransactions(newAddress as Address);

      if (hasBeenUsed) {
        accountsToImport.push({
          address: newAddress,
          index: accountsEnabled,
        });
        accountsEnabled += 1;
      } else {
        empty = true;
      }
    }

    const deviceId = keccak256(accountsToImport[0].address);

    return { accountsToImport, deviceId, accountsEnabled };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.name === 'TransportStatusError') {
      alert('Please make sure your trezor is connected and unlocked');
    } else {
      alert('Unable to connect to your trezor. Please try again.');
    }
    return null;
  }
};

export const connectLedger = async () => {
  if (process.env.IS_TESTING === 'true') {
    return HARDWARE_WALLETS.MOCK_ACCOUNT;
  }
  let transport;
  try {
    transport = await TransportWebHID.create();
    const appEth = new AppEth(transport);
    const result = await appEth.getAddress(
      getHDPathForVendorAndType(0, 'Ledger'),
      false,
      false,
    );
    const accountsToImport = [{ address: result.address, index: 0 }];
    let accountsEnabled = 1;
    // Autodiscover accounts
    let empty = false;
    while (!empty) {
      // eslint-disable-next-line no-await-in-loop
      const result = await appEth.getAddress(
        getHDPathForVendorAndType(accountsEnabled, 'Ledger'),
        false,
        false,
      );

      // eslint-disable-next-line no-await-in-loop
      const hasBeenUsed = await hasPreviousTransactions(
        result.address as Address,
      );

      if (hasBeenUsed) {
        accountsToImport.push({
          address: result.address,
          index: accountsEnabled,
        });
        accountsEnabled += 1;
      } else {
        empty = true;
      }
    }

    const deviceId = keccak256(accountsToImport[0].address);
    await transport?.close();

    return { accountsToImport, deviceId, accountsEnabled };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    let error = '';
    switch (e?.name) {
      case 'TransportWebUSBGestureRequired':
        error = 'needs_unlock';
        break;
      case 'TransportStatusError':
        error = 'needs_app';
        break;
      case 'InvalidStateError':
        error = 'needs_exclusivity';
        break;
      case 'TransportOpenUserCancelled':
      default:
        error = 'needs_connect';
    }
    await transport?.close();
    return { error };
  }
};

export const importAccountsFromHW = async (
  accountsToImport: {
    address: string;
    index: number;
    hdPath?: string;
  }[],
  accountsEnabled: number,
  deviceId: string,
  vendor: 'Ledger' | 'Trezor',
) => {
  const address = await walletAction('import_hw', {
    deviceId,
    wallets: accountsToImport,
    vendor,
    accountsEnabled,
  });
  const { passwordSet } = await getStatus();
  if (!passwordSet) {
    // we probably need to set a password
    await chrome.storage.session.set({ userStatus: 'NEEDS_PASSWORD' });
  }
  return address;
};
