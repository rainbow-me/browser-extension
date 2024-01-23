import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import { TxHash } from '~/core/types/transactions';
import { RainbowError, logger } from '~/logger';

export const APPROVALS_TIMEOUT_DURATION = 10000;

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
  payload: {
    chain_id: ChainId;
    network: string;
    asset: {
      asset_code: string;
      decimals: number;
      icon_url: string;
      name: string;
      network: string;
      chain_id: ChainId;
      price: {
        value: number;
        changed_at: number;
        relative_change_24h: number;
      };
      symbol: string;
      colors: {
        primary: string;
        secondary: string;
      };
      networks: Record<ChainId, { address: Address; decimals: boolean }>;
      bridging: {
        bridgeable: boolean;
        networks: Record<ChainId, { bridgeable: boolean }>;
      };
      verified: boolean;
      value_at_risk: string;
      spenders: {
        tx_hash: TxHash;
        contract_address: Address;
        allowance_type: 'UNLIMITED' | 'LIMITED';
        quantity_allowed: 'unlimited' | string;
        value_at_risk: string;
        contract_name: string;
        contract_icon_url: string;
      }[];
    };
  }[];
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
    { persisterVersion: 1 },
  );

type AprovalsQueryKey = ReturnType<typeof approvalsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function approvalsQueryFunction({
  queryKey: [{ address, chainIds, currency }],
}: QueryFunctionArgs<
  typeof approvalsQueryKey
>): Promise<ApprovalsResponse | null> {
  const chainIdsString = chainIds.join(',');
  try {
    const response = await addysHttp.get(
      `${chainIdsString}/${address}/approvals?currency=${currency}`,
    );
    return response.data as ApprovalsResponse;
  } catch (e) {
    logger.error(new RainbowError('assetsQueryFunction: '), {
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
