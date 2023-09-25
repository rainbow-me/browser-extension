import { Address, useEnsName } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { isENSAddressFormat } from '~/core/utils/ethereum';
import { Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

type AddressOrEnsProps = {
  address: Address | string;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
};

export function AddressWithENSReverseResolution({
  address,
}: {
  address: Address;
}) {
  // Attempt reverse resoltion first
  const { data: ensName } = useEnsName({ address });
  if (ensName) return <>{ensName}</>;
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
    <Text color={color} size={size} weight={weight}>
      {isENSAddressFormat(address) ? (
        address
      ) : (
        <AddressWithENSReverseResolution address={address as Address} />
      )}
    </Text>
  );
}
