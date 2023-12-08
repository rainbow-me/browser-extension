import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { ValidatePointsSignatureMutation } from '~/core/graphql/__generated__/metadata';
import { queryClient } from '~/core/react-query';

const fetchPoints = async (address: Address) => {
  const { points } = await metadataClient.points({ address });
  return points;
};

export const seedPointsQueryCache = async (
  address: Address,
  data: ValidatePointsSignatureMutation['onboardPoints'],
) => {
  await queryClient.cancelQueries({ queryKey: ['points', address] });
  queryClient.setQueryData(['points', address], data);
};

export const usePoints = (address: Address) => {
  return useQuery({
    queryKey: ['points', address],
    queryFn: () => fetchPoints(address),
    staleTime: 1000 * 60,
  });
};
