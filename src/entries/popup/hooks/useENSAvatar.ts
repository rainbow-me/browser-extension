import { isAddress } from '@ethersproject/address';
import { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { isENSAddressFormat } from '~/core/utils/ethereum';

export const useENSAvatar = ({
  addressOrName,
}: {
  addressOrName: Address | string | undefined;
}) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isFetched, setIsFeched] = useState<boolean>(false);

  const reverseResolveENSProfile = useCallback(async (address: Address) => {
    const response = await metadataClient.reverseResolveENSProfile({
      chainId: 1,
      address: address,
      fields: ['avatar'],
    });

    if (response?.reverseResolveENSProfile?.fields?.length) {
      return response.reverseResolveENSProfile.fields[0].value;
    }
    return null;
  }, []);

  const resolveENSProfile = useCallback(async (name: string) => {
    const response = await metadataClient.resolveENSProfile({
      chainId: 1,
      name: name,
      fields: ['avatar'],
    });

    if (response?.resolveENSProfile?.fields?.length) {
      return response.resolveENSProfile.fields[0].value;
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      let data = null;
      if (addressOrName && isAddress(addressOrName)) {
        data = await reverseResolveENSProfile(addressOrName);
        setIsFeched(true);
      } else if (addressOrName && isENSAddressFormat(addressOrName)) {
        data = await resolveENSProfile(addressOrName);
        setIsFeched(true);
      }
      setAvatar(data);
    };
    fetchAvatar();
  }, [addressOrName, resolveENSProfile, reverseResolveENSProfile]);

  return { data: avatar, isFetched };
};
