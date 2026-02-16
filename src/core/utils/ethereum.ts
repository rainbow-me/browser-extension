import { Address, isAddress, isHex } from 'viem';

import { PrivateKey } from '../keychain/IKeychain';
import { EthereumWalletType } from '../types/walletTypes';

import { isValidMnemonic } from './mnemonic';

export type EthereumWalletSeed = PrivateKey | string;

const validTLDs = ['eth', 'xyz', 'luxe', 'kred', 'reverse', 'addr', 'test'];
export const isENSAddressFormat = (name: string) => {
  if (!name) return false;
  const tld = name.split('.').at(-1);
  if (!tld || tld === name) return false;
  return validTLDs.includes(tld.toLowerCase());
};

/**
 * @desc Checks if a string is a valid private key.
 * @param value The string.
 * @return Whether or not the string is a valid private key string.
 */
export const isValidPrivateKey = (value: string): boolean => {
  const prefixed = value.startsWith('0x') ? value : `0x${value}`;
  return isHex(prefixed) && prefixed.length === 66;
};

export const identifyWalletType = (
  walletSeed: EthereumWalletSeed,
): EthereumWalletType => {
  if (isValidPrivateKey(walletSeed)) {
    return EthereumWalletType.privateKey;
  }
  // 12 or 24 words seed phrase
  if (isValidMnemonic(walletSeed)) {
    return EthereumWalletType.mnemonic;
  }
  // Public address (0x)
  if (isAddress(walletSeed)) {
    return EthereumWalletType.readOnly;
  }
  // seed
  return EthereumWalletType.seed;
};

/**
 * @desc Checks if a an address has previous transactions
 * @param  {String} address
 * @return {Promise<Boolean>}
 */
export const hasPreviousTransactions = async (
  address: Address,
): Promise<boolean> => {
  try {
    const url = `https://aha.rainbow.me/?address=${address}`;
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }

    const parsedResponse = (await response.json()) as {
      data: { addresses: Record<string, boolean> };
    };

    return parsedResponse?.data?.addresses[address.toLowerCase()] === true;
  } catch (e) {
    return false;
  }
};

// This function removes all the keys from the message that are not present in the types
// preventing a know phising attack where the signature process could allow malicious DApps
// to trick users into signing an EIP-712 object different from the one presented
// in the signature approval preview. Consequently, users were at risk of unknowingly
// transferring control of their ERC-20 tokens, NFTs, etc to adversaries by signing
// hidden Permit messages.

// For more info read https://www.coinspect.com/wallet-EIP-712-injection-vulnerability/

// Type guard to check if value has typed data structure
const hasTypedDataStructure = (
  value: unknown,
): value is {
  domain?: unknown;
  types?: Record<string, Array<{ name: string; type: string }>>;
  primaryType?: string;
  message?: Record<string, unknown>;
  value?: Record<string, unknown>;
} => {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('types' in value || 'primaryType' in value || 'domain' in value)
  );
};

type SanitizedTypedData = {
  domain: unknown;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
  value?: Record<string, unknown>;
};

export const sanitizeTypedData = (data: unknown): SanitizedTypedData => {
  if (!hasTypedDataStructure(data)) {
    return {
      domain: {},
      types: {},
      primaryType: '',
      message: {},
    };
  }

  const primaryType = data.primaryType || '';
  const types = data.types || {};
  const message = data.message || {};

  if (types[primaryType]?.length > 0 && Object.keys(message).length > 0) {
    // Extract all the valid permit types for the primary type
    const permitPrimaryTypes: string[] = types[primaryType].map(
      (type: { name: string; type: string }) => type.name,
    );

    // Extract all the message keys that matches the valid permit types
    const sanitizedMessage: Record<string, unknown> = {};
    Object.keys(message).forEach((key) => {
      if (permitPrimaryTypes.includes(key)) {
        sanitizedMessage[key] = message[key];
      }
    });

    return {
      domain: data.domain || {},
      types,
      primaryType,
      message: sanitizedMessage,
      value: data.value,
    };
  }
  return {
    domain: data.domain || {},
    types,
    primaryType,
    message,
    value: data.value,
  };
};
