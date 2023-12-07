import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';

export const usePoints = (address: Address) => {
  return useQuery({
    queryKey: ['points', address],
    queryFn: async () => {
      const { points } = await metadataClient.points({ address });
      if (points?.error) throw points.error.type;
      return points;
    },
  });
};
