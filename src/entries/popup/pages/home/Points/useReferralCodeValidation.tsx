import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { metadataPostClient } from '~/core/graphql';
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
  console.log('-- referralCode', referralCode);
  return useQuery({
    queryFn: () => {
      return metadataPostClient.validateReferralCode({
        address,
        referral: referralCode?.replace('-', ''),
      });
    },
    queryKey: createQueryKey('token about info', {
      address,
      referralCode: referralCode?.replace('-', ''),
    }),
    enabled: validateAsciiCodeFormat(referralCode),
  });
};
