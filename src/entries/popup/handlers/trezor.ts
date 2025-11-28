// Keep ethers imports for transaction signing - hardware wallets require ethers transaction format
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import transformTypedDataPlugin from '@trezor/connect-plugin-ethereum';
import TrezorConnect from '@trezor/connect-web';
import {
  Address,
  ByteArray,
  Hex,
  bytesToHex,
  hexToBytes,
  stringToBytes,
} from 'viem';

import {
  SigningMessage,
  isPersonalSignMessage,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import { sanitizeTypedData } from '~/core/utils/ethereum';
import { logTransactionGasError } from '~/core/utils/gas-logging';
import { addHexPrefix } from '~/core/utils/hex';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { popupClient } from './background';

const getPath = async (address: Address) => {
  return await popupClient.wallet.path(address);
};

export async function signTransactionFromTrezor(
  transaction: TransactionRequest,
): Promise<Hex> {
  try {
    const { from: address } = transaction;
    const path = await getPath(address as Address);

    const baseTx: UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit
        ? BigNumber.from(transaction.gasLimit).toHexString()
        : undefined,
      nonce: BigNumber.from(transaction.nonce).toNumber(),
      to: transaction.to || undefined,
      value: transaction?.value
        ? BigNumber.from(transaction.value).toHexString()
        : '0x0',
    };

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else if (transaction.maxFeePerGas || transaction.maxPriorityFeePerGas) {
      // eip-1559
      baseTx.maxFeePerGas = transaction.maxFeePerGas;
      baseTx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
    } else {
      baseTx.gasPrice = transaction.maxFeePerGas;
    }

    const nonceHex = BigNumber.from(transaction.nonce).toHexString();
    const response = await TrezorConnect.ethereumSignTransaction({
      path,
      // @ts-expect-error --- unsure why the ts compiler is displaying 'never' for tx type
      transaction: {
        ...baseTx,
        nonce: nonceHex,
      },
    });

    if (response.success) {
      if (baseTx.maxFeePerGas) {
        baseTx.type = 2;
      }
      const serializedTransaction = serialize(baseTx, {
        r: response.payload.r,
        s: response.payload.s,
        v: BigNumber.from(response.payload.v).toNumber(),
      }) as Hex;

      const parsedTx = parse(serializedTransaction);
      if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('Transaction was not signed by the right address');
      }

      return serializedTransaction;
    } else {
      logger.error(new RainbowError('trezor error'), {
        response,
        baseTx,
      });
      alert('error signing transaction with trezor');
      throw new Error('error signing transaction with trezor');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger.error(new RainbowError('trezor error', { cause: e }));
    alert('Please make sure your trezor is unlocked');

    // bubble up the error
    throw e;
  }
}
export async function sendTransactionFromTrezor(
  transaction: TransactionRequest,
): Promise<TransactionResponse> {
  const serializedTransaction = await signTransactionFromTrezor(transaction);
  const provider = getProvider({
    chainId: transaction.chainId,
  });
  try {
    return await provider.sendTransaction(serializedTransaction);
  } catch (error) {
    await logTransactionGasError({
      error,
      transactionRequest: transaction,
      chainId: transaction.chainId as number,
    });
    throw error;
  }
}

export async function signMessageByTypeFromTrezor(
  message: SigningMessage,
  address: Address,
): Promise<Hex> {
  const path = await getPath(address);

  // Personal sign
  if (isPersonalSignMessage(message)) {
    let messageBytes: ByteArray;
    try {
      messageBytes = stringToBytes(message.message);
    } catch (e) {
      logger.info('the message is not a utf8 string, will sign as hex');
      // If stringToBytes fails, treat as hex string and convert to bytes
      const hexMessage = message.message.startsWith('0x')
        ? (message.message as Hex)
        : (`0x${message.message}` as Hex);
      messageBytes = hexToBytes(hexMessage);
    }

    const messageHex = bytesToHex(messageBytes).slice(2);

    const response = await TrezorConnect.ethereumSignMessage({
      path,
      message: messageHex,
      hex: true,
    });

    if ('address' in response.payload) {
      if (response.payload.address.toLowerCase() !== address.toLowerCase()) {
        throw new Error(
          'Trezor returned a different address than the one requested',
        );
      }
    }

    if (!response.success) {
      throw new Error('Trezor returned an error');
    }

    return addHexPrefix(response.payload.signature) as Hex;
  }
  // sign typed data
  else if (isTypedDataMessage(message)) {
    // message.data is already TypedDataDefinition, no need for type assertion
    const typedData = message.data;

    // Type guard to ensure we have the required fields
    if (
      typeof typedData !== 'object' ||
      typedData === null ||
      !(
        'types' in typedData &&
        'primaryType' in typedData &&
        'domain' in typedData
      )
    ) {
      throw new Error('unsupported typed data version');
    }

    const sanitizedData = sanitizeTypedData(typedData);
    const { domain, types, primaryType, message: messageData } = sanitizedData;

    // Type assertion needed because Trezor's transformTypedDataPlugin expects specific types
    // but sanitizedData is structurally compatible after sanitization
    const eip712Data = {
      types,
      primaryType,
      domain,
      message: messageData,
    } as unknown as Parameters<typeof transformTypedDataPlugin>[0];

    const { domain_separator_hash, message_hash } = transformTypedDataPlugin(
      eip712Data,
      true,
    );

    const response = await TrezorConnect.ethereumSignTypedData({
      path,
      data: eip712Data,
      metamask_v4_compat: true,
      domain_separator_hash,
      message_hash: message_hash || undefined,
    });

    if (!response.success) {
      throw new Error('Trezor returned an error');
    }

    if (response.payload.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        'Trezor returned a different address than the one requested',
      );
    }
    return addHexPrefix(response.payload.signature) as Hex;
  } else {
    throw new Error(`Unsupported message type`);
  }
}
