import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

import { createQueryKey } from '~/core/react-query';
import { prepareSendCallsEnvelope } from '~/core/sendCalls/prepareEnvelope';
import type { SendCallsParams } from '~/core/sendCalls/types';
import type { ChainId } from '~/core/types/chains';
import { getNextNonce } from '~/core/utils/transactions';

export function usePrepareSendCallsEnvelope({
  sendParams,
  from,
  enabled,
}: {
  sendParams: SendCallsParams | null;
  from: Address | undefined;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: createQueryKey('prepareSendCallsEnvelope', {
      chainId: sendParams?.chainId,
      from,
      callCount: sendParams?.calls?.length,
      callsFingerprint: sendParams?.calls
        ?.map((c) => `${c.to ?? ''}-${c.data ?? ''}-${c.value ?? ''}`)
        .join('|'),
    }),
    queryFn: async () => {
      if (!sendParams) return null;
      const chainId = Number(sendParams.chainId) as ChainId;
      const provisionalNonce = await getNextNonce({
        address: from as Address,
        chainId,
      });
      return prepareSendCallsEnvelope({
        sendParams,
        from: from as Address,
        provisionalNonce,
      });
    },
    enabled:
      enabled && !!sendParams?.calls?.length && !!from && !!sendParams.chainId,
    staleTime: 30_000,
  });
}
