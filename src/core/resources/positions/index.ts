import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { networkStore } from '~/core/state/networks/networks';
import { AssetApiResponse, ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName, chainNameToIdMapping } from '~/core/types/chains';
import { parseUserAsset } from '~/core/utils/assets';
import { getSupportedChains } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';

const POSITIONS_TIMEOUT_DURATION = 20000;

// ///////////////////////////////////////////////
// Response Types
export type AddysPositionAsset = Omit<
  AssetApiResponse,
  'type' | 'interface'
> & {
  verified: boolean;
};

export interface AddysPosition {
  borrows: { asset: AddysPositionAsset; quantity: string }[];
  claimables: { asset: AddysPositionAsset; quantity: string }[];
  dapp: {
    colors: { primary: string; fallback: string; shadow: string };
    icon_url: string;
    name: string;
    url: string;
  };
  deposits: { asset: AddysPositionAsset; quantity: string }[];
  network: ChainName;
  stakes: { asset: AddysPositionAsset; quantity: string }[];
  type: string;
}

export type ParsedAddysPosition = Omit<
  AddysPosition,
  'borrows' | 'claimables' | 'deposits' | 'stakes'
> & {
  borrows: ParsedUserAsset[];
  claimables: ParsedUserAsset[];
  deposits: ParsedUserAsset[];
  stakes: ParsedUserAsset[];
  chainId: ChainId;
};

export interface AddysPositionsResponse {
  meta: {
    addresses: Address[];
    addresses_with_errors: Address[];
    chain_ids: number[];
    chain_ids_with_errors: number[];
    currency: string;
    errors: string[];
    status: string | number;
  };
  payload: {
    positions: AddysPosition[];
  };
  status: number;
}

export type ParsedPositionsByChain = Record<
  ChainId,
  {
    positions: ParsedAddysPosition[];
  }
>;

// ///////////////////////////////////////////////
// Query Types

export type PositionsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  testnetMode: boolean;
};

// ///////////////////////////////////////////////
// Query Key

const positionsQueryKey = ({ address, currency, testnetMode }: PositionsArgs) =>
  createQueryKey(
    'positions',
    { address, currency, testnetMode },
    { persisterVersion: 1 },
  );

type PositionsQueryKey = ReturnType<typeof positionsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function positionsQueryFunction({
  queryKey: [{ address, currency, testnetMode }],
}: QueryFunctionArgs<typeof positionsQueryKey>) {
  if (!address) return {} as ParsedPositionsByChain;
  try {
    const supportedPositionsChainIds = networkStore
      .getState()
      .getSupportedPositionsChainIds();
    const supportedChainIds = getSupportedChains({
      testnets: testnetMode,
    })
      .map(({ id }) => id)
      .filter((id) => supportedPositionsChainIds.includes(id));

    const response = await addysHttp.get<AddysPositionsResponse>(
      `/${supportedChainIds.join(',')}/${address}/positions`,
      {
        params: { currency: currency.toLowerCase(), enableThirdParty: 'true' },
        timeout: POSITIONS_TIMEOUT_DURATION,
      },
    );
    const chainIdsWithErrorsInResponse =
      response?.data?.meta?.chain_ids_with_errors || [];

    if (chainIdsWithErrorsInResponse.length) {
      positionsQueryFunctionRetryByChain({
        address,
        currency,
        chainIds: chainIdsWithErrorsInResponse,
        testnetMode,
      });
    }

    const positions = response?.data?.payload?.positions || [];
    const parsedPositionsByChain = parsePositions(currency, positions);
    return parsedPositionsByChain;
  } catch (e) {
    logger.error(new RainbowError('positionsQueryFunction: '), {
      message: (e as Error)?.message,
    });
  }
}

async function positionsQueryFunctionRetryByChain({
  address,
  currency,
  chainIds,
  testnetMode,
}: {
  address: Address;
  currency: SupportedCurrencyKey;
  chainIds: number[];
  testnetMode: boolean;
}) {
  try {
    const cache = queryClient.getQueryCache();
    const cachedPositions =
      (cache.find({
        queryKey: positionsQueryKey({ address, currency, testnetMode }),
      })?.state?.data as ParsedPositionsByChain) || {};
    const retries = [];
    for (const chainIdWithError of chainIds) {
      retries.push(
        positionQueryFunctionByChain({
          address,
          currency,
          chainId: chainIdWithError,
        }),
      );
    }
    const parsedRetries = await Promise.all(retries);
    for (const parsedPositions of parsedRetries) {
      const firstPosition = parsedPositions?.positions?.[0];
      if (firstPosition) {
        cachedPositions[firstPosition?.chainId] = parsedPositions;
      }
    }
    queryClient.setQueryData(
      positionsQueryKey({ address, currency, testnetMode }),
      cachedPositions,
    );
  } catch (e) {
    logger.error(new RainbowError('positionsQueryFunctionRetryByChain: '), {
      message: (e as Error)?.message,
    });
  }
}

async function positionQueryFunctionByChain({
  address,
  currency,
  chainId,
}: {
  address: Address;
  currency: SupportedCurrencyKey;
  chainId: number;
}) {
  try {
    const response = await addysHttp.get<AddysPositionsResponse>(
      `/${chainId}/${address}/positions`,
      {
        params: { currency: currency.toLowerCase(), enableThirdParty: 'true' },
        timeout: POSITIONS_TIMEOUT_DURATION,
      },
    );
    const chainIdsWithErrorsInResponse =
      response?.data?.meta?.chain_ids_with_errors || [];
    if (!chainIdsWithErrorsInResponse?.includes(chainId)) {
      return {
        positions: response?.data?.payload?.positions.map((p) =>
          parsePosition(currency, p),
        ),
      };
    }
  } catch (e) {
    logger.error(
      new RainbowError(`positionQueryFunctionByChain - chainId = ${chainId}`),
    ),
      {
        message: (e as Error)?.message,
      };
  }
  return {
    positions: [],
  };
}

type PositionsResult = QueryFunctionResult<typeof positionsQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchPositions(
  { address, currency, testnetMode }: PositionsArgs,
  config: QueryConfig<
    PositionsResult,
    Error,
    PositionsResult,
    PositionsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: positionsQueryKey({ address, currency, testnetMode }),
    queryFn: positionsQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Hook

export function usePositions(
  { address, currency, testnetMode }: PositionsArgs,
  config: QueryConfig<
    PositionsResult,
    Error,
    PositionsResult,
    PositionsQueryKey
  > = {},
) {
  return useQuery({
    queryKey: positionsQueryKey({ address, currency, testnetMode }),
    queryFn: positionsQueryFunction,
    ...config,
  });
}

function parsePositions(
  currency: SupportedCurrencyKey,
  positions: AddysPosition[],
) {
  return positions.reduce((parsedPositionsByChain, currentPosition) => {
    const parsedCurrentPosition = parsePosition(currency, currentPosition);
    const currentPositionChainId = parsedCurrentPosition.chainId;
    const existingListForChainId =
      parsedPositionsByChain[currentPositionChainId]?.positions;

    if (existingListForChainId) {
      parsedPositionsByChain[currentPositionChainId] = {
        positions: [...existingListForChainId, parsedCurrentPosition],
      };
    } else {
      parsedPositionsByChain[currentPositionChainId] = {
        positions: [parsedCurrentPosition],
      };
    }

    return parsedPositionsByChain;
  }, {} as ParsedPositionsByChain);
}

function parsePosition(
  currency: SupportedCurrencyKey,
  position: AddysPosition,
): ParsedAddysPosition {
  return {
    ...position,
    borrows: position.borrows?.map((b) =>
      parseUserAsset({ asset: b.asset, balance: b.quantity, currency }),
    ),
    claimables: position.claimables?.map((c) =>
      parseUserAsset({ asset: c.asset, balance: c.quantity, currency }),
    ),
    deposits: position.deposits?.map((d) =>
      parseUserAsset({ asset: d.asset, balance: d.quantity, currency }),
    ),
    stakes: position.stakes?.map((s) =>
      parseUserAsset({ asset: s.asset, balance: s.quantity, currency }),
    ),
    chainId: chainNameToIdMapping[position?.network],
  };
}
