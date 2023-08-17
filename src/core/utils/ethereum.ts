import { isAddress } from '@ethersproject/address';
import { Mnemonic, isValidMnemonic } from '@ethersproject/hdnode';
import { TransactionResponse } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';
import omit from 'lodash/omit';
import { Address } from 'wagmi';

import { PrivateKey } from '../keychain/IKeychain';
import { ethUnits } from '../references';
import { EthereumWalletType } from '../types/walletTypes';

import { addHexPrefix, isHexStringIgnorePrefix } from './hex';
import { divide, multiply } from './numbers';

export type EthereumWalletSeed = PrivateKey | Mnemonic['phrase'];

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
  return isHexStringIgnorePrefix(value) && addHexPrefix(value).length === 66;
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

export const gweiToWei = (gweiAmount: string) => {
  const weiAmount = multiply(gweiAmount, ethUnits.gwei);
  return weiAmount;
};

export const weiToGwei = (weiAmount: string) => {
  const gweiAmount = divide(weiAmount, ethUnits.gwei);
  return gweiAmount;
};

export const toWei = (ether: string): string => {
  const result = parseEther(ether);
  return result.toString();
};

export const normalizeTransactionResponsePayload = (
  payload: TransactionResponse,
): TransactionResponse => {
  // Firefox can't serialize functions
  if (navigator.userAgent.toLowerCase().includes('firefox')) {
    console.log('omitting wait on firefox!');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return omit(payload, 'wait') as TransactionResponse;
  }
  return payload;
};
