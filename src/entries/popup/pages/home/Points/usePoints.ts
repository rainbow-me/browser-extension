import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import {
  PointsDocument,
  ValidatePointsSignatureMutation,
} from '~/core/graphql/__generated__/metadata';
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

export const fetchPointsQuery = async (address: Address) =>
  queryClient.fetchQuery({
    queryKey: ['points', address],
    queryFn: () => fetchPoints(address),
  });

let nextDropTimeout: NodeJS.Timeout | undefined;
export const usePoints = (address: Address) => {
  const query = useQuery({
    queryKey: ['points', address, PointsDocument.loc?.source.body],
    queryFn: () => fetchPoints(address),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const nextDistribution = query.data?.meta.distribution.next;
    if (!nextDistribution) return;
    const nextDistributionIn = nextDistribution * 1000 - Date.now();

    nextDropTimeout ??= setTimeout(() => query.refetch(), nextDistributionIn);

    return () => {
      clearTimeout(nextDropTimeout);
      nextDropTimeout = undefined;
    };
  }, [query]);

  return query;
};
