import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { HDNode } from '@ethersproject/hdnode';
import AppEth from '@ledgerhq/hw-app-eth';
import type Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TrezorConnect from '@trezor/connect-web';
import { Address, ByteArray, Hex, keccak256 } from 'viem';

// eslint-disable-next-line boundaries/element-types
import { getHDPathForVendorAndType } from '~/core/keychain/hdPath';
// eslint-disable-next-line boundaries/element-types
import type { HardwareWalletVendor } from '~/core/keychain/keychainTypes/hardwareWalletKeychain';
import {
  RapSwapActionParameters,
  RapTypes,
  WalletExecuteRapProps,
} from '~/core/raps/references';
import { useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { ExecuteRapResponse } from '~/core/types/transactions';
import { hasPreviousTransactions } from '~/core/utils/ethereum';
import {
  estimateGasWithPadding,
  validateAndAdjustGasParams,
} from '~/core/utils/gas';
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

  // Validate and adjust gas params to ensure maxFeePerGas meets current block base fee
  // Extract backend base fee from selectedGas if available (for EIP-1559)
  const backendBaseFee =
    'maxBaseFee' in selectedGas && selectedGas.maxBaseFee
      ? selectedGas.maxBaseFee.amount
      : undefined;
  const validatedGasParams = await validateAndAdjustGasParams({
    gasParams: selectedGas.transactionGasParams,
    chainId: transactionRequest.chainId as ChainId,
    provider,
    backendBaseFee,
  });

  const params = {
    ...transactionRequest,
    ...validatedGasParams,
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

  // Build initial gas params from request or selected gas
  // Prefer gas params from transactionRequest if provided, otherwise use selectedGas
  let transactionGasParams: TransactionGasParams | TransactionLegacyGasParams;

  // Check if we have legacy gas params (gasPrice) or EIP-1559 params
  const hasLegacyGas =
    transactionRequest.gasPrice ||
    ('gasPrice' in selectedGas.transactionGasParams &&
      selectedGas.transactionGasParams.gasPrice);

  if (hasLegacyGas) {
    // Legacy transaction
    transactionGasParams = {
      gasPrice:
        (transactionRequest.gasPrice as string | undefined) ||
        (selectedGas.transactionGasParams as TransactionLegacyGasParams)
          .gasPrice,
    };
  } else {
    // EIP-1559 transaction
    transactionGasParams = {
      maxFeePerGas:
        (transactionRequest.maxFeePerGas as string | undefined) ||
        (selectedGas.transactionGasParams as TransactionGasParams).maxFeePerGas,
      maxPriorityFeePerGas:
        (transactionRequest.maxPriorityFeePerGas as string | undefined) ||
        (selectedGas.transactionGasParams as TransactionGasParams)
          .maxPriorityFeePerGas,
    };
  }

  // Validate and adjust gas params to ensure maxFeePerGas meets current block base fee
  // Extract backend base fee from selectedGas if available (for EIP-1559)
  const backendBaseFee =
    'maxBaseFee' in selectedGas && selectedGas.maxBaseFee
      ? selectedGas.maxBaseFee.amount
      : undefined;
  transactionGasParams = await validateAndAdjustGasParams({
    gasParams: transactionGasParams,
    chainId: transactionRequest.chainId as ChainId,
    provider,
    backendBaseFee,
  });

  const params = {
    ...transactionRequest,
    gasLimit: toHex(gasLimit || '0'),
    value:
      transactionRequest?.value === undefined
        ? undefined
        : toHex(transactionRequest.value),
    nonce: Number(toHex(nonce)),
    maxFeePerGas: toHexOrUndefined(
      'maxFeePerGas' in transactionGasParams
        ? transactionGasParams.maxFeePerGas
        : undefined,
    ),
    maxPriorityFeePerGas: toHexOrUndefined(
      'maxPriorityFeePerGas' in transactionGasParams
        ? transactionGasParams.maxPriorityFeePerGas
        : undefined,
    ),
    gasPrice: toHexOrUndefined(
      'gasPrice' in transactionGasParams
        ? transactionGasParams.gasPrice
        : undefined,
    ),
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
  msgData: string | ByteArray,
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
  msgData: string | ByteArray,
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
    return walletAction('sign_typed_data', {
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

type AccountToImport = { address: Address; index: number };

type ConnectHWResult =
  | {
      accountsToImport: AccountToImport[];
      deviceId: Hex;
      accountsEnabled: number;
    }
  | { error: string };

const autodiscoverAccounts = async (
  getAddressAtIndex: (index: number) => Promise<Address>,
): Promise<AccountToImport[]> => {
  const discover = async (
    index: number,
    acc: AccountToImport[],
  ): Promise<AccountToImport[]> => {
    const address = await getAddressAtIndex(index);
    const hasBeenUsed = await hasPreviousTransactions(address);
    if (hasBeenUsed) {
      return discover(index + 1, [...acc, { address, index }]);
    }
    return acc;
  };

  const firstAddress = await getAddressAtIndex(0);
  return discover(1, [{ address: firstAddress, index: 0 }]);
};

export const connectTrezor = async (): Promise<ConnectHWResult> => {
  if (process.env.IS_TESTING === 'true') {
    return HARDWARE_WALLETS.MOCK_ACCOUNT;
  }
  try {
    // We don't want the index to be part of the path because we need the public key
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

    const getAddressAtIndex = (index: number): Promise<Address> =>
      Promise.resolve(hdNode.derivePath(`${index}`).address as Address);

    const accountsToImport = await autodiscoverAccounts(getAddressAtIndex);
    const accountsEnabled = accountsToImport.length;
    const deviceId = keccak256(accountsToImport[0].address);

    return { accountsToImport, deviceId, accountsEnabled };
  } catch (e) {
    if (e instanceof Error && e.name === 'TransportStatusError') {
      alert('Please make sure your trezor is connected and unlocked');
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
  let transport: Transport | undefined;
  try {
    transport = await TransportWebHID.create();
    const appEth = new AppEth(transport);

    const getAddressAtIndex = async (index: number): Promise<Address> => {
      const result = await appEth.getAddress(
        getHDPathForVendorAndType(index, 'Ledger'),
        false,
        false,
      );
      return result.address as Address;
    };

    const accountsToImport = await autodiscoverAccounts(getAddressAtIndex);
    const accountsEnabled = accountsToImport.length;
    const deviceId = keccak256(accountsToImport[0].address);
    await transport?.close();

    return { accountsToImport, deviceId, accountsEnabled };
  } catch (e) {
    let error = '';
    switch (e instanceof Error ? e.name : '') {
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
