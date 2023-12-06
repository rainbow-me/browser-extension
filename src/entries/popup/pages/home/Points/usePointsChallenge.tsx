import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { createQueryKey } from '~/core/react-query';

export const usePointsChallenge = ({
  address,
  referralCode,
}: {
  address: Address;
  referralCode: string;
}) => {
  return useQuery({
    queryFn: () => {
      return metadataClient.getPointsOnboardChallenge({
        address,
        referral: referralCode,
      });
    },
    queryKey: createQueryKey('points challenge', {
      address,
      referralCode,
    }),
  });
};
