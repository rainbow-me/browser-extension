import { Address, Hash, Hex, keccak256, numberToHex } from 'viem';
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
import { useCurrentChainIdStore, useGasStore } from '~/core/state';
import {
  PersonalSignMessage,
  TypedDataMessage,
} from '~/core/types/messageSigning';
import {
  ExecuteRapResponse,
  TransactionRequest,
} from '~/core/types/transactions';
import { getErrorMessage } from '~/core/utils/errors';
import { hasPreviousTransactions } from '~/core/utils/ethereum';
import { estimateGasWithPadding } from '~/core/utils/gas';
import { getNextNonce } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

import { PathOptions } from '../pages/hw/addByIndexSheet';

import { popupClient } from './background';
import {
  sendTransactionFromHW as sendHW,
  signTransactionFromHW as signHW,
  signMessageByTypeFromHW,
} from './hardwareWallet';
import { executeRapAction, signTypedDataAction } from './walletAction';
import { HARDWARE_WALLETS } from './walletVariables';

export const signTransactionFromHW = async (
  transactionRequest: TransactionRequest,
  vendor: string,
): Promise<Hex | undefined> => {
  if (!transactionRequest.from)
    throw new RainbowError('signTransactionFromHW: missing from address');
  const { from } = transactionRequest;
  const chainId =
    transactionRequest.chainId ??
    useCurrentChainIdStore.getState().currentChainId;
  const { selectedGas } = useGasStore.getState();
  const client = getViemClient({ chainId });
  const gasLimit = await estimateGasWithPadding({
    transactionRequest,
    client,
  });
  const nonce = await getNextNonce({
    address: from,
    chainId,
  });

  return signHW(
    {
      ...transactionRequest,
      ...selectedGas?.transactionGasParams,
      gasLimit: gasLimit ?? transactionRequest.gasLimit,
      nonce,
    },
    vendor as 'Ledger' | 'Trezor',
  );
};

export type SendTransactionResult = { hash: Hash; nonce: number };

export const sendTransaction = async (
  transactionRequest: TransactionRequest,
): Promise<SendTransactionResult> => {
  if (!transactionRequest.from)
    throw new RainbowError('sendTransaction: missing from address');
  const { from } = transactionRequest;
  const chainId =
    transactionRequest.chainId ??
    useCurrentChainIdStore.getState().currentChainId;
  const { selectedGas } = useGasStore.getState();
  const client = getViemClient({ chainId });
  const gasLimit = await estimateGasWithPadding({
    transactionRequest,
    client,
  });

  const nonce =
    transactionRequest.nonce ??
    (await getNextNonce({ address: from, chainId }));

  const params: TransactionRequest = {
    ...transactionRequest,
    ...selectedGas?.transactionGasParams,
    gasLimit: gasLimit ?? 0n,
    nonce,
  };

  let walletInfo;
  try {
    walletInfo = await getWallet(from);
  } catch (e) {
    const re = new RainbowError('sendTransaction::getWallet error');
    logger.error(re, {
      message: getErrorMessage(e),
      from,
    });
    throw re;
  }
  const { type, vendor } = walletInfo;

  if (type === 'HardwareWalletKeychain') {
    const hash = await sendHW(params, vendor as 'Ledger' | 'Trezor');
    return { hash: hash as Hash, nonce };
  }

  const toHex = (v: bigint | undefined): Hex | undefined =>
    v != null ? numberToHex(v) : undefined;

  const hash = await popupClient.wallet.sendTransaction({
    to: params.to,
    from: params.from,
    data: params.data,
    chainId: params.chainId,
    type: params.type,
    nonce: params.nonce,
    gasLimit: toHex(params.gasLimit),
    value: toHex(params.value),
    maxFeePerGas: toHex(params.maxFeePerGas),
    maxPriorityFeePerGas: toHex(params.maxPriorityFeePerGas),
    gasPrice: toHex(params.gasPrice),
  });

  return { hash: hash as Hash, nonce };
};

export async function executeRap<T extends RapTypes>({
  rapActionParameters,
  type,
}: {
  rapActionParameters: RapSwapActionParameters<T>;
  type: RapTypes;
}): Promise<ExecuteRapResponse> {
  const nonce = await getNextNonce({
    address: rapActionParameters?.address || rapActionParameters.quote?.from,
    chainId: rapActionParameters.chainId,
  });

  const { selectedGas } = useGasStore.getState();
  const gasParams = selectedGas?.transactionGasParams;
  const serializedGasParams = gasParams
    ? Object.fromEntries(
        Object.entries(gasParams).map(([k, v]) => [k, String(v)]),
      )
    : undefined;

  const params: WalletExecuteRapProps = {
    rapActionParameters: {
      ...rapActionParameters,
      nonce,
      serializedGasParams,
    },
    type,
  };
  return executeRapAction(params);
}

export const personalSign = async (
  message: PersonalSignMessage,
  address: Address,
): Promise<Hex> => {
  const { type, vendor } = await getWallet(address);
  if (type === 'HardwareWalletKeychain') {
    return signMessageByTypeFromHW(
      message,
      address,
      vendor as 'Ledger' | 'Trezor',
    );
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
  const { type, vendor } = await getWallet(address);

  if (type === 'HardwareWalletKeychain') {
    return signMessageByTypeFromHW(
      message,
      address,
      vendor as 'Ledger' | 'Trezor',
    );
  } else {
    return signTypedDataAction(address, message);
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
