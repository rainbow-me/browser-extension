import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';

interface AddySummary {
  data: {
    addresses: {
      [key: Address]: {
        summary: {
          native_balance_by_symbol: {
            [key in 'ETH' | 'MATIC' | 'BNB']: {
              symbol: string;
              quantity: string;
              decimals: number;
            };
          };
          num_erc20s: number;
          last_activity: number;
          asset_value: number;
        };
      };
      summary_by_chain: {
        [key in
          | ChainId.mainnet
          | ChainId.optimism
          | ChainId.polygon
          | ChainId.arbitrum
          | ChainId.bsc]: {
          native_balance: {
            symbol: string;
            quantity: string;
            decimals: number;
          };
          num_erc20s: number;
          last_activity: number;
          asset_value: number;
        };
      };
    };
  };
}

// ///////////////////////////////////////////////
// Query Types

export type AddysSummaryArgs = {
  addresses: Address[];
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const addysSummaryQueryKey = ({ addresses, currency }: AddysSummaryArgs) =>
  createQueryKey(
    'addysSummary',
    { addresses, currency },
    { persisterVersion: 1 },
  );

type AddysSummaryQueryKey = ReturnType<typeof addysSummaryQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function addysSummaryQueryFunction({
  queryKey: [{ addresses, currency }],
}: QueryFunctionArgs<typeof addysSummaryQueryKey>) {
  const addysSummary = await addysHttp.get(`/summary`, {
    body: JSON.stringify({
      currency,
      addresses,
    }),
  });
  return addysSummary as AddySummary;
}

type AddysSumaryResult = QueryFunctionResult<typeof addysSummaryQueryFunction>;

// ///////////////////////////////////////////////
// Query Hook

export function useAddysSummary(
  { addresses, currency }: AddysSummaryArgs,
  config: QueryConfig<
    AddysSumaryResult,
    Error,
    AddysSumaryResult,
    AddysSummaryQueryKey
  > = {},
) {
  return useQuery(
    addysSummaryQueryKey({ addresses, currency }),
    addysSummaryQueryFunction,
    {
      ...config,
    },
  );
}
