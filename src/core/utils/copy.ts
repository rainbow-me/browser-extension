import { AddressZero } from '@ethersproject/constants';
import { getAddress } from 'viem';

import { triggerToast } from '~/entries/popup/components/Toast/Toast';

import { i18n } from '../languages';
import { ETH_ADDRESS } from '../references';
import { AddressOrEth } from '../types/assets';

import { truncateAddress } from './address';

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

export const copyAddress = (address: AddressOrEth) => {
  if ([ETH_ADDRESS, AddressZero].includes(address)) return;
  copy({
    title: i18n.t('wallet_header.copy_toast'),
    description: truncateAddress(address),
    value: getAddress(address),
  });
};
