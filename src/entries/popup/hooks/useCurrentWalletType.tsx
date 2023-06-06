import { useCurrentAddressStore } from '~/core/state';

import { useWallets } from './useWallets';

export const useCurrentWalletTypeAndVendor = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { allWallets } = useWallets();

  const wallet = allWallets.find((wallet) => wallet.address === address);
  return { type: wallet?.type, vendor: wallet?.vendor };
};
