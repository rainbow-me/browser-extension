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
        let message = payload?.params?.[0] as string;
        let address = payload?.params?.[1] as Address;

        // Only swap parameters when the first param is an address
        // AND the second param is NOT an address
        // This prevents incorrect swapping when both params could be interpreted as addresses
        if (isAddress(message) && !isAddress(address)) {
          message = payload?.params?.[1] as string;
          address = payload?.params?.[0] as Address;
        }

        try {
          const strippedMessage = isHexString(message)
            ? message.slice(2)
            : `${Buffer.from(message, 'utf8').toString('hex')}`; // Some dapps send the message as a utf8 string
          const buffer = Buffer.from(strippedMessage, 'hex');
          message = buffer.length === 32 ? message : buffer.toString('utf8');
        } catch (error) {
          logger.error(
            new RainbowError('Error decoding personal_sign message'),
            {
              error: (error as Error)?.message,
              originalMessage: message,
              method: payload.method,
            },
          );
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
