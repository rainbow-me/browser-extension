import { CSSProperties } from 'react';
import { Address, useEnsName } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { isENSAddressFormat } from '~/core/utils/ethereum';
import { TextOverflow } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

type AddressOrEnsProps = {
  address: Address | string;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
  maxWidth?: CSSProperties['maxWidth'];
};

const truncateEnsName = (ensName: string) => {
  const parts = ensName.split('.');
  const truncatedParts = parts.map((part) => {
    if (part.length > 20) return `${part.slice(0, 8)}…${part.slice(-4)}`;
    return part;
  });
  return truncatedParts.join('.');
};

export function AddressWithENSReverseResolution({
  address,
}: {
  address: Address;
}) {
  // Attempt reverse resolution first
  const { data: ensName } = useEnsName({ address });
  if (ensName) return <>{truncateEnsName(ensName)}</>;
  return <>{truncateAddress(address || '0x')}</>;
}

export function AddressOrEns({
  address,
  size = '20pt',
  weight = 'heavy',
  color = 'label',
}: AddressOrEnsProps) {
  if (!address) return null;
  return (
    <TextOverflow color={color} size={size} weight={weight}>
      {isENSAddressFormat(address) ? (
        truncateEnsName(address)
      ) : (
        <AddressWithENSReverseResolution address={address as Address} />
      )}
    </TextOverflow>
  );
}
