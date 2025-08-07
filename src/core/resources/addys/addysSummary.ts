import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ChainId } from '~/core/types/chains';

export interface AddySummary {
  data: {
    addresses: {
      [key: Address]: {
        summary: {
          native_balance_by_symbol: {
            [key in 'ETH' | 'POL' | 'BNB' | 'AVAX']: {
              symbol: string;
              quantity: string;
              decimals: number;
            };
          };
          num_erc20s: number;
          last_activity: number;
          asset_value: number;
        };
        summary_by_chain: {
          [key in keyof typeof ChainId]: {
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
  };
}

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AddysSummaryArgs = {
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
  const { data } = await addysHttp.post(
    `/summary`,
    JSON.stringify({
      currency,
      addresses,
    }),
  );
  return data as AddySummary;
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
  return useQuery({
    queryKey: addysSummaryQueryKey({ addresses, currency }),
    queryFn: addysSummaryQueryFunction,
    ...config,
    retry: true,
  });
}
