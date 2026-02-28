import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { metadataPostClient } from '~/core/graphql';
import {
  Message,
  SimulateTransactionsWithoutGasQuery,
  Transaction,
} from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { AddressOrEth, ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { parseAsset } from '~/core/utils/assets';

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

type SimulationAsset = {
  assetCode: string;
  decimals: number;
  iconURL: string;
  name: string;
  symbol: string;
  interface: string;
};

const parseSimulationAsset = (asset: SimulationAsset, chainId: ChainId) => {
  const assetCode = asset.assetCode as AddressOrEth;
  return parseAsset({
    asset: {
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      chain_id: chainId,
      networks: {
        [chainId]: {
          address: assetCode,
          decimals: asset.decimals,
        },
      },
      asset_code: assetCode,
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

type SimulationResultElement = NonNullable<
  NonNullable<
    SimulateTransactionsWithoutGasQuery['simulateTransactions']
  >[number]
>;

type SimulationTarget = {
  address: string;
  name: string;
  iconURL: string;
  function: string;
  created?: string | null;
  sourceCodeStatus?: string | null;
};

type SimulationInput = Pick<
  SimulationResultElement,
  'simulation' | 'error' | 'scanning'
>;

function parseSimulation(
  { simulation, error, scanning }: SimulationInput,
  chainId: ChainId,
): TransactionSimulation {
  if (error) throw error.type;
  if (!simulation || !scanning) throw 'UNSUPPORTED' as const;

  const inChanges = simulation.in?.filter(Boolean) ?? [];
  const outChanges = simulation.out?.filter(Boolean) ?? [];
  const approvalChanges = simulation.approvals?.filter(Boolean) ?? [];

  return {
    chainId,
    scanning: {
      result: scanning.result,
      description: parseScanningDescription(
        scanning.description.toLowerCase() as Lowercase<string>,
      ),
    },
    in: inChanges.map(({ asset, quantity }) => ({
      quantity,
      asset: parseSimulationAsset(asset, chainId),
    })),
    out: outChanges.map(({ asset, quantity }) => ({
      quantity,
      asset: parseSimulationAsset(asset, chainId),
    })),
    approvals: approvalChanges.map((approval) => ({
      ...approval,
      asset: parseSimulationAsset(approval.asset, chainId),
    })),
    meta: {
      to: simulation.meta?.to ?? null,
      transferTo: simulation.meta?.transferTo ?? null,
    },
    hasChanges:
      inChanges.length > 0 ||
      outChanges.length > 0 ||
      approvalChanges.length > 0,
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
      const response = await metadataPostClient.simulateTransactionsWithoutGas({
        chainId,
        transactions: [{ ...transaction, to: transaction.to || '' }],
        domain,
      });

      if (!response?.simulateTransactions?.[0]) throw 'UNSUPPORTED';

      return parseSimulation(response.simulateTransactions[0], chainId);
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

export type TransactionSimulation = {
  in: { asset: ParsedAsset; quantity: string }[];
  out: { asset: ParsedAsset; quantity: string }[];
  approvals: {
    asset: ParsedAsset;
    spender: { address: string; name: string; iconURL: string };
    // eslint-disable-next-line @typescript-eslint/ban-types
    quantityAllowed: 'UNLIMITED' | (string & {});
    quantityAtRisk: string;
  }[];
  scanning: { result: 'OK' | 'WARNING' | 'MALICIOUS'; description: string };
  meta: {
    to?: SimulationTarget | null;
    transferTo?: SimulationTarget | null;
  };
  hasChanges: boolean;
  chainId: ChainId;
};
export type SimulationError = 'REVERT' | 'UNSUPPORTED';
