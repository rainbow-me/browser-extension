import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { metadataPostClient } from '~/core/graphql';
import { Message, Transaction } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { currentCurrencyStore } from '~/core/state';
import { AddressOrEth, ParsedAsset } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
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

const parseSimulationAsset = (asset: SimulationAsset, chainId: ChainId) => {
  return parseAsset({
    asset: {
      symbol: asset.symbol,
      name: asset.name,
      decimals: asset.decimals,
      chain_id: chainId,
      networks: {
        [chainId]: {
          address: asset.assetCode,
          decimals: asset.decimals,
        },
      },
      asset_code: asset.assetCode,
      icon_url: asset.iconURL,
      interface: parseInterface(asset.interface),
      bridging: {
        bridgeable: false,
        networks: {},
      },
    },
    currency: currentCurrencyStore.getState().currentCurrency,
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
  {
    simulation,
    error,
    scanning,
  }: TransactionSimulationResponse['simulateTransactions'][0],
  chainId: ChainId,
) {
  if (error) throw error.type;

  return {
    chainId,
    scanning: {
      result: scanning.result,
      description: parseScanningDescription(
        scanning.description.toLowerCase() as Lowercase<string>,
      ),
    },
    in: simulation.in.map(({ asset, quantity }) => ({
      quantity,
      asset: parseSimulationAsset(asset, chainId),
    })),
    out: simulation.out.map(({ asset, quantity }) => ({
      quantity,
      asset: parseSimulationAsset(asset, chainId),
    })),
    approvals: simulation?.approvals?.map((approval) => ({
      ...approval,
      asset: parseSimulationAsset(approval.asset, chainId),
    })),
    meta: simulation.meta,
    hasChanges:
      simulation.in.length > 0 ||
      simulation.out.length > 0 ||
      simulation.approvals.length > 0,
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
      const response = (await metadataPostClient.simulateTransactionsWithoutGas(
        {
          chainId,
          transactions: [{ ...transaction, to: transaction.to || '' }],
          domain,
        },
      )) as TransactionSimulationResponse;
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

      const response = (await metadataPostClient.simulateMessage({
        chainId,
        address,
        message,
        domain,
        currency,
      })) as MessageSimulationResponse;

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
    spender: SimulationTarget;
    // eslint-disable-next-line @typescript-eslint/ban-types
    quantityAllowed: 'UNLIMITED' | (string & {});
    quantityAtRisk: string;
  }[];
  scanning: TransactionSimulationResponse['simulateTransactions'][0]['scanning'];
  meta: SimulationMeta;
  hasChanges: boolean;
  chainId: ChainId;
};
export type SimulationError = 'REVERT' | 'UNSUPPORTED';

type SourceCodeStatus = 'VERIFIED' | 'UNKNOWN';
type SimulationAsset = {
  assetCode: AddressOrEth;
  decimals: number;
  iconURL: string;
  name: string;
  network: ChainName;
  symbol: string;
  type: 'TOKEN';
  interface: 'ERC20';
  tokenId: '';
  status: SourceCodeStatus;
};

type SimulationChange = {
  asset: SimulationAsset;
  quantity: string;
};
type SimulationTarget = {
  address: Address;
  name: string;
  iconURL: string;
  function: string;
  created: string;
  sourceCodeStatus: SourceCodeStatus;
};
type SimulationMeta = {
  to: SimulationTarget;
  transferTo: SimulationTarget;
};

export type TransactionSimulationResponse = {
  simulateTransactions: [
    {
      scanning: {
        result: 'OK' | 'WARNING' | 'MALICIOUS';
        description: string;
      };
      error: {
        message: string;
        type: SimulationError;
      };
      gas: {
        estimate: string;
      };
      simulation: {
        in: SimulationChange[];
        out: SimulationChange[];
        approvals: {
          asset: SimulationAsset;
          spender: SimulationTarget;
          // eslint-disable-next-line @typescript-eslint/ban-types
          quantityAllowed: 'UNLIMITED' | (string & {});
          quantityAtRisk: string;
          expiration: string;
        }[];
        meta: SimulationMeta;
      };
    },
  ];
};

type MessageSimulationResponse = {
  simulateMessage: {
    scanning: {
      result: 'OK' | 'WARNING' | 'MALICIOUS';
      description: string;
    };
    error: {
      message: string;
      type: SimulationError;
    };
    gas: {
      estimate: string;
    };
    simulation: {
      in: SimulationChange[];
      out: SimulationChange[];
      approvals: {
        asset: SimulationAsset;
        spender: SimulationTarget;
        // eslint-disable-next-line @typescript-eslint/ban-types
        quantityAllowed: 'UNLIMITED' | (string & {});
        quantityAtRisk: string;
        expiration: string;
      }[];
      meta: SimulationMeta;
    };
  };
};
