import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export const isValidMnemonic = (mnemonic: string) => {
  return validateMnemonic(mnemonic, wordlist);
};
