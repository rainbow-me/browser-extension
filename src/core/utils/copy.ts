import { Address, getAddress } from 'viem';

import { triggerToast } from '~/entries/popup/components/Toast/Toast';

import { i18n } from '../languages';

import { truncateAddress } from './address';
import { isNativeAssetAddress } from './nativeAssets';

export const copy = ({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description?: string;
}) => {
  navigator.clipboard.writeText(value);
  triggerToast({ title, description });
};

export const copyAddress = (address: Address | string | undefined) => {
  if (!address) return;
  // Don't allow copying native asset addresses (they're not real contract addresses)
  if (isNativeAssetAddress(address)) return;
  try {
    // getAddress validates and normalizes the address
    const normalizedAddress = getAddress(address);
    copy({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(normalizedAddress),
      value: normalizedAddress,
    });
  } catch {
    // Invalid address, skip copying
  }
};
