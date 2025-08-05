import { useSettingsStore } from '~/core/state/currentSettings/store';

import { useWallets } from './useWallets';

export const useCurrentWalletTypeAndVendor = () => {
  const [address] = useSettingsStore('currentAddress');
  const { allWallets } = useWallets();

  const wallet = allWallets.find((wallet) => wallet.address === address);
  return { type: wallet?.type, vendor: wallet?.vendor };
};
