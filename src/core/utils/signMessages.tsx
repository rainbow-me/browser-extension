import { getAddress, isAddress } from '@ethersproject/address';
import { Bytes, isHexString } from '@ethersproject/bytes';
import { Address } from 'viem';

import { RainbowError, logger } from '~/logger';

import { ProviderRequestPayload } from '../transports/providerRequestTransport';
import { RPCMethod } from '../types/rpcMethods';

import { sanitizeTypedData } from './ethereum';

export const isSignTypedData = (method: RPCMethod) =>
  method.indexOf('signTypedData') !== -1;

export const getSigningRequestDisplayDetails = (
  payload: ProviderRequestPayload,
) => {
  try {
    switch (payload.method) {
      case 'personal_sign': {
        // Get both parameters from the request
        const param0 = payload?.params?.[0] as string;
        const param1 = payload?.params?.[1] as string;

        let message, address;

        // Only swap parameters if param0 is definitely an address
        // and param1 is not a hex string.
        if (
          param0?.startsWith('0x') &&
          param0?.length === 42 &&
          /^0x[0-9a-fA-F]{40}$/.test(param0) &&
          !param1?.startsWith('0x')
        ) {
          message = param1;
          address = param0;
        } else {
          message = param0;
          address = param1;
        }

        try {
          const strippedMessage = isHexString(message)
            ? message.slice(2)
            : `${Buffer.from(message, 'utf8').toString('hex')}`; // Some dapps send the message as a utf8 string
          const buffer = Buffer.from(strippedMessage, 'hex');
          message = buffer.length === 32 ? message : buffer.toString('utf8');
        } catch (error) {
          // TODO error handling
        }
        return {
          message,
          msgData: message,
          address: getAddress(address) as Address,
        };
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
            const params = payload.params as string[];
            const [address, data] = isAddress(params[0])
              ? [params[0], params[1]]
              : [params[1], params[0]];
            let msgData: string | Bytes = data;
            try {
              msgData = JSON.parse(data) as Bytes;
              // eslint-disable-next-line no-empty
            } catch (e) {}

            const sanitizedMessageData = sanitizeTypedData(msgData);

            return {
              message: JSON.stringify(sanitizedMessageData, null, 2),
              msgData: sanitizedMessageData,
              address: getAddress(address) as Address,
              typedData: true,
            };
          }
        }
      }
    }
    return {};
  } catch (e) {
    logger.info('MSG Signing Parsing Error with meta', payload.meta);
    logger.error(new RainbowError('MSG Signing Parsing Error'), {
      payload,
    });
    return {};
  }
};
