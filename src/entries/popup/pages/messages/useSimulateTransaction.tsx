/* eslint-disable @typescript-eslint/ban-types */
import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { Transaction } from '~/core/graphql/__generated__/metadata';
import { createQueryKey } from '~/core/react-query';
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
      networks: {
        [chainId]: {
          address: asset.assetCode,
          decimals: asset.decimals,
        },
      },
      asset_code: asset.assetCode,
      icon_url: asset.iconURL,
      interface: parseInterface(asset.interface),
    },
    currency: currentCurrencyStore.getState().currentCurrency,
  });
};

export const useSimulateTransaction = ({
  chainId,
  transaction,
  domain,
}: {
  chainId: ChainId;
  transaction: Transaction;
  domain: string;
}) => {
  return useQuery({
    queryKey: createQueryKey('simulateTransaction', {
      transaction,
      chainId,
      domain,
    }),
    queryFn: async () => {
      const response = (await metadataClient.simulateTransactions({
        chainId,
        transactions: [transaction],
        domain,
      })) as TransactionSimulationResponse;

      const { simulation } = response.simulateTransactions[0];

      return {
        chainId,
        in: simulation.in.map(({ asset, quantity }) => ({
          quantity,
          asset: parseSimulationAsset(asset, chainId),
        })),
        out: simulation.out.map(({ asset, quantity }) => ({
          quantity,
          asset: parseSimulationAsset(asset, chainId),
        })),
        approvals: simulation.approvals.map((approval) => ({
          ...approval,
          asset: parseSimulationAsset(approval.asset, chainId),
        })),
        meta: simulation.meta,
        hasChanges:
          simulation.in.length > 0 ||
          simulation.out.length > 0 ||
          simulation.approvals.length > 0,
      };
    },
  });
};
export type TransactionSimulation = {
  in: { asset: ParsedAsset; quantity: string }[];
  out: { asset: ParsedAsset; quantity: string }[];
  approvals: {
    asset: ParsedAsset;
    spender: SimulationApprovalSpender;
    quantityAllowed: 'UNLIMITED' | (string & {});
    quantityAtRisk: string;
  }[];
  meta: SimulationMeta;
  hasChanges: boolean;
  chainId: ChainId;
};

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
  status: 'VERIFIED';
};

type SimulationChange = {
  asset: SimulationAsset;
  quantity: string;
};
type SimulationApprovalSpender = {
  address: Address;
  name: string;
  iconURL: string;
  function: string;
  created: string;
  sourceCodeStatus: 'VERIFIED';
};
type SimulationMeta = {
  to: {
    address: Address;
    name: string;
    iconURL: string;
    function: string;
    created: null;
    sourceCodeStatus: 'UNKNOWN' | 'VERIFIED';
  };
};

type TransactionSimulationResponse = {
  simulateTransactions: [
    {
      scanning: {
        result: 'OK';
        description: '';
      };
      simulation: {
        in: SimulationChange[];
        out: SimulationChange[];
        approvals: {
          asset: SimulationAsset;
          spender: SimulationApprovalSpender;
          quantityAllowed: 'UNLIMITED' | (string & {});
          quantityAtRisk: string;
        }[];
        meta: SimulationMeta;
      };
    },
  ];
};
