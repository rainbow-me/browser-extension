import { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { useResolveEnsProfileAvatar } from '~/core/resources/metadata/resolveEnsProfileAvatar';

export const useENSAvatar = ({
  addressOrName,
}: {
  addressOrName: Address | string | undefined;
}) => {
  const [isFetched, setIsFeched] = useState<boolean>(false);

  const {
    data: avatar,
    isLoading,
    isError,
  } = useResolveEnsProfileAvatar({
    addressOrName: addressOrName || '',
  });

  useEffect(() => {
    if (avatar && !isLoading && !isError) {
      setIsFeched(true);
    }
  }, [avatar, isError, isLoading]);

  return { data: avatar, isFetched };
};
