import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { metadataPostClient } from '~/core/graphql';
import {
  Message,
  SimulateMessageQuery,
  Transaction,
  TransactionScanResultType,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import {
  TransactionSimulationResult,
  simulateTransactions,
} from '~/core/resources/transactions/simulation';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { parseAsset } from '~/core/utils/assets';

/** Asset from simulation response */
type SimulationAsset = NonNullable<
  NonNullable<
    NonNullable<TransactionSimulationResult['simulation']>['in']
  >[number]
>['asset'];

/** Target from simulation response */
type SimulationTarget = NonNullable<
  NonNullable<
    NonNullable<TransactionSimulationResult['simulation']>['approvals']
  >[number]
>['spender'];

/** Meta from simulation response */
type SimulationMeta = NonNullable<
  NonNullable<TransactionSimulationResult['simulation']>['meta']
>;

/** Message simulation result */
type MessageSimulationResult = NonNullable<
  SimulateMessageQuery['simulateMessage']
>;

const parseInterface = (interfaceName: string) => {
  switch (interfaceName) {
    case 'ERC20':
      return undefined;
    case 'ERC721':
      return 'erc-721';
    case 'ERC1155':
      return 'erc-1155';
    default:
      return undefined;
  }
};

const parseSimulationAsset = (asset: SimulationAsset, chainId: ChainId) => {
  const assetAddress = asset.assetCode as Address;
  return parseAsset({
    asset: {
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      chain_id: chainId,
      networks: {
        [chainId]: {
          address: assetAddress,
          decimals: asset.decimals,
        },
      },
      asset_code: assetAddress,
      icon_url: asset.iconURL,
      interface: parseInterface(asset.interface),
      bridging: {
        bridgeable: false,
        networks: {},
      },
    },
    currency: useCurrentCurrencyStore.getState().currentCurrency,
  });
};

const parseScanningDescription = (description: Lowercase<string>) => {
  const t = (tab: string) =>
    i18n.t(tab, { scope: 'approve_request.malicious_transaction_warning' });

  if (description.includes('losing trade, mint price is too high'))
    return t('minting_is_a_losing_trade');

  if (description.includes('malicious address')) return t('malicious_address');

  if (description.includes('malicious entity')) return t('malicious_entity');

  return t('you_can_lose_everything');
};

function parseSimulation(
  result: TransactionSimulationResult | MessageSimulationResult,
  chainId: ChainId,
): TransactionSimulation {
  const { simulation, error, scanning } = result;

  if (error) throw error.type;
  if (!simulation || !scanning) throw 'UNSUPPORTED';

  const inChanges = simulation.in ?? [];
  const outChanges = simulation.out ?? [];
  const approvals = simulation.approvals ?? [];

  return {
    chainId,
    scanning: {
      result: scanning.result,
      description: parseScanningDescription(
        scanning.description.toLowerCase() as Lowercase<string>,
      ),
    },
    in: inChanges
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .map(({ asset, quantity }) => ({
        quantity,
        asset: parseSimulationAsset(asset, chainId),
      })),
    out: outChanges
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .map(({ asset, quantity }) => ({
        quantity,
        asset: parseSimulationAsset(asset, chainId),
      })),
    approvals: approvals
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .map((approval) => ({
        ...approval,
        asset: parseSimulationAsset(approval.asset, chainId),
      })),
    meta: simulation.meta ?? null,
    hasChanges:
      inChanges.length > 0 || outChanges.length > 0 || approvals.length > 0,
  };
}

export const useSimulateTransaction = ({
  chainId,
  transaction,
  domain,
}: {
  chainId: ChainId;
  transaction: Transaction;
  domain: string;
}) => {
  return useQuery<TransactionSimulation, SimulationError>({
    queryKey: createQueryKey('simulateTransaction', {
      transaction,
      chainId,
      domain,
    }),
    enabled: !!chainId && (!!transaction.value || !!transaction.data),
    queryFn: async () => {
      const results = await simulateTransactions({
        chainId,
        transactions: [{ ...transaction, to: transaction.to || '' }],
        domain,
      });

      if (!results[0]) throw 'UNSUPPORTED';

      return parseSimulation(results[0], chainId);
    },
    staleTime: 60 * 1000, // 1 min
  });
};

export const useSimulateMessage = ({
  chainId,
  address,
  message,
  domain,
  currency,
}: {
  chainId: ChainId;
  address?: Address;
  message: Message;
  domain: string;
  currency: SupportedCurrencyKey;
}) => {
  return useQuery<TransactionSimulation, SimulationError>({
    queryKey: createQueryKey('simulateMessage', {
      message,
      address,
      chainId,
      domain,
    }),
    enabled: !!chainId && !!address && !!message.method,
    queryFn: async () => {
      if (!address) throw new Error('useSimulateMessage: Missing `address`');

      const response = await metadataPostClient.simulateMessage({
        chainId,
        address,
        message,
        domain,
        currency,
      });

      if (!response?.simulateMessage) throw 'UNSUPPORTED';

      return parseSimulation(response.simulateMessage, chainId);
    },
    staleTime: 60 * 1000, // 1 min
  });
};

/** Parsed simulation result for UI consumption */
export type TransactionSimulation = {
  in: { asset: ParsedAsset; quantity: string }[];
  out: { asset: ParsedAsset; quantity: string }[];
  approvals: {
    asset: ParsedAsset;
    spender: SimulationTarget;
    quantityAllowed: string;
    quantityAtRisk: string;
  }[];
  scanning: {
    result: TransactionScanResultType;
    description: string;
  };
  meta: SimulationMeta | null;
  hasChanges: boolean;
  chainId: ChainId;
};

export type SimulationError = 'REVERT' | 'UNSUPPORTED';
