import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { AssetApiResponse } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { TxHash } from '~/core/types/transactions';
import { RainbowError, logger } from '~/logger';

export const APPROVALS_TIMEOUT_DURATION = 10000;

export interface ApprovalSpender {
  tx_hash: TxHash;
  tx_time: string;
  contract_address: Address;
  allowance_type: 'UNLIMITED' | 'LIMITED';
  quantity_allowed: 'unlimited' | string;
  value_at_risk: string;
  contract_name: string;
  contract_icon_url: string;
}

export interface Approval {
  chain_id: ChainId;
  network: string;
  asset: AssetApiResponse;
  spenders: ApprovalSpender[];
}

interface ApprovalsResponse {
  meta: {
    addresses: Address[];
    currency: SupportedCurrencyKey;
    chainIds: ChainId[];
    errors: string[];
    addresses_with_errors: Address[];
    chain_ids_with_errors: ChainId[];
    status: string;
  };
  payload: Approval[];
}

// ///////////////////////////////////////////////
// Query Types

export type ApprovalsQueryArgs = {
  address: Address;
  chainIds: ChainId[];
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const approvalsQueryKey = ({
  address,
  chainIds,
  currency,
}: ApprovalsQueryArgs) =>
  createQueryKey(
    'approvals',
    { address, chainIds, currency },
    { persisterVersion: 2 },
  );

type AprovalsQueryKey = ReturnType<typeof approvalsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function approvalsQueryFunction({
  queryKey: [{ address, chainIds, currency }],
}: QueryFunctionArgs<typeof approvalsQueryKey>): Promise<Approval[] | null> {
  try {
    const response = await addysHttp.get(
      `/${chainIds.join(',')}/${address}/approvals`,
      {
        params: {
          currency: currency.toLowerCase(),
        },
      },
    );
    const approvalsReponse = response.data as ApprovalsResponse;
    return approvalsReponse.payload;
  } catch (e) {
    logger.error(new RainbowError('approvalsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return null;
  }
}

type ApprovalsQueryResult = QueryFunctionResult<typeof approvalsQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchApprovals(
  { address, chainIds, currency }: ApprovalsQueryArgs,
  config: QueryConfig<
    ApprovalsQueryResult,
    Error,
    ApprovalsQueryResult,
    AprovalsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    approvalsQueryKey({ address, chainIds, currency }),
    approvalsQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useApprovals(
  { address, chainIds, currency }: ApprovalsQueryArgs,
  config: QueryConfig<
    ApprovalsQueryResult,
    Error,
    ApprovalsQueryResult,
    AprovalsQueryKey
  > = {},
) {
  return useQuery(
    approvalsQueryKey({ address, chainIds, currency }),
    approvalsQueryFunction,
    config,
  );
}
