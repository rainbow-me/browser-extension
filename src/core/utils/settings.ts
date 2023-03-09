import { KeychainWallet } from '../types/keychainTypes';

export const setSettingWallets = (settingsWallet: null | KeychainWallet) => {
  chrome.storage.session.set({ settingsWallet });
};

export const getSettingWallets = async (): Promise<KeychainWallet> => {
  const { settingsWallet } = await chrome.storage.session.get([
    'settingsWallet',
  ]);
  return settingsWallet;
};
