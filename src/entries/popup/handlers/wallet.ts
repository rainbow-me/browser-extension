import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes } from '@ethersproject/bytes';
import { HDNode } from '@ethersproject/hdnode';
import { keccak256 } from '@ethersproject/keccak256';
import AppEth from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TrezorConnect from '@trezor/connect-web';
import { Address } from 'viem';

import { getHDPathForVendorAndType } from '~/core/keychain/hdPath';
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
import { ExecuteRapResponse } from '~/core/types/transactions';
import { hasPreviousTransactions } from '~/core/utils/ethereum';
import { estimateGasWithPadding } from '~/core/utils/gas';
import { toHex, toHexOrUndefined } from '~/core/utils/hex';
import { getNextNonce } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
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
): Promise<string | undefined> => {
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
    maxFeePerGas: toHex(transactionGasParams.maxFeePerGas),
    maxPriorityFeePerGas: toHex(transactionGasParams.maxPriorityFeePerGas),
    gasPrice: toHex(transactionGasParams.gasPrice),
    from: toHexOrUndefined(transactionRequest.from),
    data: toHexOrUndefined(transactionRequest.data),
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
      gasLimit: BigNumber.from(transaction.gasLimit),
      value: BigNumber.from(transaction.value),
      gasPrice:
        transaction.gasPrice !== undefined
          ? BigNumber.from(transaction.gasPrice)
          : undefined,
      maxFeePerGas:
        transaction.maxFeePerGas !== undefined
          ? BigNumber.from(transaction.maxFeePerGas)
          : undefined,
      maxPriorityFeePerGas:
        transaction.maxPriorityFeePerGas !== undefined
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
  return walletAction<ExecuteRapResponse>('execute_rap', params);
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
      case 'Trezor':
        return signMessageByTypeFromTrezor(msgData, address, 'personal_sign');
      default:
        throw new Error('Unsupported hardware wallet');
    }
  } else {
    return popupClient.wallet.personalSign({
      address,
      msgData,
    });
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
    return walletAction<string>('sign_typed_data', {
      address,
      msgData,
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
  let address = '';
  switch (type) {
    case 'Trezor':
      {
        const path = getHDPathForVendorAndType(index, 'Trezor');
        // 'address' is required but it should be optional and only used for validation
        const result = await TrezorConnect.ethereumGetAddress({
          path,
          showOnTrezor: false,
        });

        if (!result.success) {
          const e = new RainbowError('TrezorConnect.getAddress failed');
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
    const result = await TrezorConnect.ethereumGetPublicKey({
      path,
      showOnTrezor: false,
      suppressBackupWarning: true,
      chunkify: false,
    });

    if (!result.success) {
      const e = new RainbowError('TrezorConnect.ethereumGetPublicKey failed');
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
