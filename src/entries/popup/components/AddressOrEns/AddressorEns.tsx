import React from 'react';
import { Address, useEnsName } from 'wagmi';

import { truncateAddress } from '~/core/utils/truncateAddress';
import { Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

type AddressOrEnsProps = {
  address: Address;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
};

export function AddressOrEns({
  address,
  size = '20pt',
  weight = 'heavy',
}: AddressOrEnsProps) {
  const { data: ensName } = useEnsName({ address });

  return (
    <Text color="label" size={size} weight={weight}>
      {ensName ?? truncateAddress(address || '0x')}
    </Text>
  );
}
