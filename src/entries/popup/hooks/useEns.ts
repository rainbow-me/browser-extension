import { isAddress } from '@ethersproject/address';
import { Address } from 'viem';
import { useEnsAddress, useEnsName } from 'wagmi';

import { useENSProfile } from '~/core/resources/metadata/ensProfile';
import { isENSAddressFormat } from '~/core/utils/ethereum';

export const useEns = ({
  addressOrName,
  enableProfile = false,
}: {
  addressOrName: Address | string;
  enableProfile?: boolean;
}) => {
  const { data: ensAddress } = useEnsAddress({
    name: addressOrName,
  });
  const { data: ensName } = useEnsName({
    address: addressOrName as Address,
    query: { enabled: isAddress(addressOrName) },
  });
  const { data: ensProfile } = useENSProfile(
    {
      addressOrName,
    },
    {
      enabled: enableProfile,
    },
  );

  return {
    ensName: isENSAddressFormat(addressOrName)
      ? addressOrName
      : ensName || undefined,
    ensAddress: isAddress(addressOrName)
      ? addressOrName
      : ensAddress || undefined,
    ensAvatar: ensProfile?.avatar,
    ensBio: ensProfile?.description,
    ensCover: ensProfile?.header,
    ensTwitter: ensProfile?.['com.twitter'],
    ensWebsite: ensProfile?.url,
    hasProperties: Boolean(
      ensProfile?.avatar ||
        ensProfile?.description ||
        ensProfile?.header ||
        ensProfile?.['com.twitter'] ||
        ensProfile?.url,
    ),
  };
};
