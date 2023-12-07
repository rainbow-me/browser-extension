import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { createQueryKey } from '~/core/react-query';

export const validateAsciiCodeFormat = (inputValue: string): boolean => {
  const formatPattern = /^[\x20-\x7E]{3}-[\x20-\x7E]{3}$/;
  return formatPattern.test(inputValue);
};

export const useReferralValidation = ({
  address,
  referralCode,
}: {
  address: Address;
  referralCode: string;
}) => {
  return useQuery({
    queryFn: () => {
      return metadataClient.validateReferral({
        code: referralCode?.replace('-', ''),
      });
    },
    queryKey: createQueryKey('referral code validation', {
      address,
      referralCode: referralCode?.replace('-', ''),
    }),
    enabled: validateAsciiCodeFormat(referralCode),
  });
};
