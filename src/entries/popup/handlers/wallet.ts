import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Address, Hex, keccak256 } from 'viem';
import {
  AppNotOpenError,
  DeviceLockedError,
  DeviceNotFoundError,
} from 'viem-hw';
import { discoverLedgerAccounts } from 'viem-hw/ledger';
import { discoverTrezorAccounts } from 'viem-hw/trezor';

// eslint-disable-next-line boundaries/element-types
import type { HardwareWalletVendor } from '~/core/keychain/keychainTypes/hardwareWalletKeychain';
import {
  RapSwapActionParameters,
  RapTypes,
  WalletExecuteRapProps,
} from '~/core/raps/references';
import { useGasStore } from '~/core/state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import {
  PersonalSignMessage,
  TypedDataMessage,
} from '~/core/types/messageSigning';
import { ExecuteRapResponse } from '~/core/types/transactions';
import { hasPreviousTransactions } from '~/core/utils/ethereum';
import { estimateGasWithPadding } from '~/core/utils/gas';
import { toHex, toHexOrUndefined } from '~/core/utils/hex';
import { getNextNonce } from '~/core/utils/transactions';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { PathOptions } from '../pages/hw/addByIndexSheet';

import { popupClient } from './background';
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

export const signTransactionFromHW = async (
  transactionRequest: TransactionRequest,
  vendor: string,
): Promise<Hex | undefined> => {
  const { selectedGas } = useGasStore.getState();
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
  const { selectedGas } = useGasStore.getState();
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
    gasLimit: toHex(gasLimit || '0'),
    value:
      transactionRequest?.value === undefined
        ? undefined
        : toHex(transactionRequest.value),
    nonce: Number(toHex(nonce)),
    maxFeePerGas: toHexOrUndefined(transactionGasParams.maxFeePerGas),
    maxPriorityFeePerGas: toHexOrUndefined(
      transactionGasParams.maxPriorityFeePerGas,
    ),
    gasPrice: toHexOrUndefined(transactionGasParams.gasPrice),
    data: transactionRequest.data as Hex | undefined, // dont cast to hex, as it can be '0x'
    from: transactionRequest.from as Address | undefined, // dont cast to hex, as it's case sensitive
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
    const transaction = await popupClient.wallet.sendTransaction(params);

    const transactionResponse: TransactionResponse = {
      ...transaction,
      wait: async () => {
        throw new Error('Not implemented');
      },
      to: transaction.to ?? undefined,
      gasLimit: BigNumber.from(transaction.gasLimit),
      value: BigNumber.from(transaction.value),
      gasPrice:
        transaction.gasPrice !== undefined && transaction.gasPrice !== null
          ? BigNumber.from(transaction.gasPrice)
          : undefined,
      maxFeePerGas:
        transaction.maxFeePerGas !== undefined &&
        transaction.maxFeePerGas !== null
          ? BigNumber.from(transaction.maxFeePerGas)
          : undefined,
      maxPriorityFeePerGas:
        transaction.maxPriorityFeePerGas !== undefined &&
        transaction.maxPriorityFeePerGas !== null
          ? BigNumber.from(transaction.maxPriorityFeePerGas)
          : undefined,
    };

    return transactionResponse;
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
    address:
      rapActionParameters?.address ||
      (rapActionParameters.quote?.from as Address),
    chainId: rapActionParameters.chainId as number,
  });
  const params: WalletExecuteRapProps = {
    rapActionParameters: { ...rapActionParameters, nonce },
    type,
  };
  return walletAction('execute_rap', params);
}

export const personalSign = async (
  message: PersonalSignMessage,
  address: Address,
): Promise<Hex> => {
  const { type, vendor } = await getWallet(address as Address);
  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        return signMessageByTypeFromLedger(message, address);
      case 'Trezor':
        return signMessageByTypeFromTrezor(message, address);
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    return popupClient.wallet.personalSign({
      address,
      message,
    });
  }
};

export const signTypedData = async (
  message: TypedDataMessage,
  address: Address,
) => {
  const { type, vendor } = await getWallet(address as Address);

  if (type === 'HardwareWalletKeychain') {
    switch (vendor) {
      case 'Ledger':
        return signMessageByTypeFromLedger(message, address);
      case 'Trezor': {
        return signMessageByTypeFromTrezor(message, address);
      }
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    return walletAction('sign_typed_data', {
      address,
      message,
    });
  }
};

export const lock = async () => popupClient.wallet.lock();

export const unlock = async (password: string) =>
  popupClient.wallet.unlock({ password });

export const wipe = async () => popupClient.wallet.wipe();

export const testSandbox = async () => popupClient.wallet.testSandbox();

export const updatePassword = async (password: string, newPassword: string) =>
  popupClient.wallet.updatePassword({
    password,
    newPassword,
  });

export const deriveAccountsFromSecret = async (secret: string) => {
  const { accounts } = await popupClient.wallet.deriveAccountsFromSecret({
    secret,
  });
  return accounts;
};

export const isMnemonicInVault = async (secret: string) => {
  const { isInVault } = await popupClient.wallet.isMnemonicInVault({
    secret,
  });
  return isInVault;
};

export const verifyPassword = async (password: string) =>
  popupClient.wallet.verifyPassword({ password });

export const getAccounts = async () => popupClient.wallet.accounts();

export const getWallets = async () => popupClient.wallet.wallets();

export const getWallet = async (address: Address) =>
  popupClient.wallet.wallet(address);

export const getStatus = async () => popupClient.wallet.status();

export const create = async () => {
  const { address } = await popupClient.wallet.create();

  return address;
};

export const importWithSecret = async (seed: string) => {
  const { address } = await popupClient.wallet.import({ seed });
  return address;
};

export const remove = async (address: Address) =>
  popupClient.wallet.remove(address);

export const add = async (sibling: Address) => popupClient.wallet.add(sibling);

export const exportWallet = async (address: Address, password: string) =>
  popupClient.wallet.exportWallet({
    address,
    password,
  });

export const exportAccount = async (address: Address, password: string) =>
  popupClient.wallet.exportAccount({
    address,
    password,
  });

export const importAccountAtIndex = async (
  type: string | 'Trezor' | 'Ledger',
  index: number,
  currentPath?: PathOptions,
) => {
  switch (type) {
    case 'Trezor': {
      const derivationStyle = 'bip44';
      const accounts = await discoverTrezorAccounts({
        count: 1,
        startIndex: index,
        derivationStyle,
        email: 'rainbow@rainbow.me',
        appUrl: 'https://rainbow.me',
      });
      if (accounts.length === 0) {
        throw new RainbowError('Failed to get Trezor address');
      }
      return accounts[0].address;
    }
    case 'Ledger': {
      const derivationStyle =
        currentPath === 'legacy' ? 'ledger-live' : 'bip44';
      const accounts = await discoverLedgerAccounts({
        count: 1,
        startIndex: index,
        derivationStyle,
      });
      if (accounts.length === 0) {
        throw new RainbowError('Failed to get Ledger address');
      }
      return accounts[0].address;
    }
    default:
      throw new Error('Unknown wallet type');
  }
};

type AccountToImport = { address: Address; index: number };

type ConnectHWResult =
  | {
      accountsToImport: AccountToImport[];
      deviceId: Hex;
      accountsEnabled: number;
    }
  | { error: string };

export const connectTrezor = async (): Promise<ConnectHWResult> => {
  if (process.env.IS_TESTING === 'true') {
    return HARDWARE_WALLETS.MOCK_ACCOUNT;
  }
  try {
    // Use viem-hw to discover accounts with auto-discovery
    const discoveredAccounts = await discoverTrezorAccounts({
      count: 10, // Discover up to 10 accounts
      derivationStyle: 'bip44',
      email: 'rainbow@rainbow.me',
      appUrl: 'https://rainbow.me',
    });

    // Filter to accounts that have been used (have previous transactions)
    // Sequential discovery is intentional for hardware wallet communication
    const accountsToImport: AccountToImport[] = [];
    for (const account of discoveredAccounts) {
      // eslint-disable-next-line no-await-in-loop
      const hasBeenUsed = await hasPreviousTransactions(account.address);
      if (hasBeenUsed || account.index === 0) {
        accountsToImport.push({
          address: account.address,
          index: account.index,
        });
      } else {
        // Stop at first unused account (after index 0)
        break;
      }
    }

    const accountsEnabled = accountsToImport.length;
    const deviceId = keccak256(accountsToImport[0].address);

    return { accountsToImport, deviceId, accountsEnabled };
  } catch (e) {
    if (e instanceof DeviceLockedError) {
      alert('Please make sure your trezor is connected and unlocked');
    } else if (e instanceof DeviceNotFoundError) {
      alert('Unable to connect to your trezor. Please try again.');
    } else {
      alert('Unable to connect to your trezor. Please try again.');
    }
    return { error: e instanceof Error ? e.name : 'unknown' };
  }
};

export const connectLedger = async (): Promise<ConnectHWResult> => {
  if (process.env.IS_TESTING === 'true') {
    return HARDWARE_WALLETS.MOCK_ACCOUNT;
  }
  try {
    // Use viem-hw to discover accounts with auto-discovery
    const discoveredAccounts = await discoverLedgerAccounts({
      count: 10, // Discover up to 10 accounts
      derivationStyle: 'bip44',
    });

    // Filter to accounts that have been used (have previous transactions)
    // Sequential discovery is intentional for hardware wallet communication
    const accountsToImport: AccountToImport[] = [];
    for (const account of discoveredAccounts) {
      // eslint-disable-next-line no-await-in-loop
      const hasBeenUsed = await hasPreviousTransactions(account.address);
      if (hasBeenUsed || account.index === 0) {
        accountsToImport.push({
          address: account.address,
          index: account.index,
        });
      } else {
        // Stop at first unused account (after index 0)
        break;
      }
    }

    const accountsEnabled = accountsToImport.length;
    const deviceId = keccak256(accountsToImport[0].address);

    return { accountsToImport, deviceId, accountsEnabled };
  } catch (e) {
    let error = '';
    if (e instanceof DeviceLockedError) {
      error = 'needs_unlock';
    } else if (e instanceof AppNotOpenError) {
      error = 'needs_app';
    } else if (e instanceof DeviceNotFoundError) {
      error = 'needs_connect';
    } else {
      error = 'needs_connect';
    }
    return { error };
  }
};

export const importAccountsFromHW = async (
  accountsToImport: {
    address: Address;
    index: number;
    hdPath?: string;
  }[],
  accountsEnabled: number,
  deviceId: string,
  vendor: HardwareWalletVendor,
) => {
  const { address } = await popupClient.wallet.importHardware({
    deviceId,
    wallets: accountsToImport,
    vendor,
    accountsEnabled,
  });
  return address;
};
