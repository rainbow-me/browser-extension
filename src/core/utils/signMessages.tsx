import { getAddress, isAddress, isHexString } from 'ethers/lib/utils';
import { Address } from 'wagmi';

import { supportedCurrencies } from '../references';
import { ProviderRequestPayload } from '../transports/providerRequestTransport';
import { RPCMethod } from '../types/rpcMethods';
import { RainbowTransaction } from '../types/transactions';

import { convertRawAmountToBalance } from './numbers';

export const isSignTypedData = (method: RPCMethod) => {
  switch (method) {
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return true;
    default:
      return false;
  }
};

export const getTransactionRequestDisplayDetails = (
  payload: ProviderRequestPayload,
) => {
  switch (payload.method) {
    case 'eth_sendTransaction':
    case 'eth_signTransaction': {
      const tx = payload?.params?.[0] as RainbowTransaction;
      const value = convertRawAmountToBalance(
        tx?.value?.toString() ?? 0,
        supportedCurrencies['ETH'],
      ).amount;
      return { value };
    }
    default:
      return {};
  }
};

export const getSigningRequestDisplayDetails = (
  payload: ProviderRequestPayload,
) => {
  switch (payload.method) {
    case 'eth_sign': {
      const message = payload?.params?.[1] as string;
      const address = payload?.params?.[0] as Address;
      return { message, msgData: message, address: getAddress(address) };
    }
    case 'personal_sign': {
      let message = payload?.params?.[0] as string;
      const address = payload?.params?.[1] as Address;
      try {
        const strippedMessage = isHexString(message)
          ? message.slice(2)
          : message;
        const buffer = Buffer.from(strippedMessage, 'hex');
        message = buffer.length === 32 ? message : buffer.toString('utf8');
      } catch (error) {
        // TODO error handling
      }
      return { message, msgData: message, address: getAddress(address) };
    }
    default: {
      // There's a lot of inconsistency in the parameter order for this method
      // due to changing EIP-712 spec
      // (eth_signTypedData => eth_signTypedData_v3 => eth_signTypedData_v4)
      // Aside from expecting the address as the first parameter
      // and data as the second one it's safer to verify that
      // and switch order if needed to ensure max compatibility with dapps
      if (isSignTypedData(payload.method)) {
        if (payload?.params?.length && payload?.params?.[0]) {
          const firstParamIsAddresss = isAddress(
            (payload?.params?.[0] as string) ?? '',
          );
          const data = payload?.params?.[firstParamIsAddresss ? 1 : 0];
          const address = payload?.params?.[
            firstParamIsAddresss ? 0 : 1
          ] as Address;
          let msgData = data as string;
          try {
            msgData = JSON.parse(data as string);
            // eslint-disable-next-line no-empty
          } catch (e) {}
          return {
            message: JSON.stringify(data),
            msgData,
            address: getAddress(address),
          };
        }
      }
    }
  }
  return {};
};
