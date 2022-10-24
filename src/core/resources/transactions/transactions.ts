import { useQuery } from '@tanstack/react-query';

import {
  createQueryKey,
  queryClient,
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
} from '~/core/react-query';
import { refractionAddressWs, refractionAddressMessages } from '~/core/network';
import {
  TransactionsReceivedMessage,
  ZerionTransaction,
} from '~/core/network/refractionAddressWs';
import { useAccount } from 'wagmi';
import { isL2Network } from '~/core/utils/web3';
import {
  convertRawAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import { ETH_ADDRESS, SupportedCurrencyKey } from '~/core/references';
import {
  ProtocolType,
  RainbowTransaction,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  ZerionTransactionStatus,
  Network,
} from '~/core/types';
import { capitalize } from 'lodash';
import { useCurrentCurrencyStore } from '~/core/state/currentCurrency';

const TRANSACTIONS_TIMEOUT_DURATION = 10000;
const TRANSACTIONS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type TransactionsArgs = {
  address?: string;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const transactionsQueryKey = ({ address, currency }: TransactionsArgs) =>
  createQueryKey(
    'transactions',
    { address, currency },
    { persisterVersion: 1 },
  );

type TransactionsQueryKey = ReturnType<typeof transactionsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function transactionsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof transactionsQueryKey>): Promise<
  RainbowTransaction[]
> {
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency.toLowerCase(),
    },
    scope: ['transactions'],
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      refractionAddressWs.removeEventListener(
        refractionAddressMessages.ADDRESS_TRANSACTIONS.RECEIVED,
        resolver,
      );
      resolve(
        queryClient.getQueryData(transactionsQueryKey({ address, currency })) ||
          [],
      );
    }, TRANSACTIONS_TIMEOUT_DURATION);
    const resolver = (message: TransactionsReceivedMessage) => {
      clearTimeout(timeout);
      refractionAddressWs.removeEventListener(
        refractionAddressMessages.ADDRESS_TRANSACTIONS.RECEIVED,
        resolver,
      );
      resolve(parseTransactions(message, currency));
    };
    refractionAddressWs.on(
      refractionAddressMessages.ADDRESS_TRANSACTIONS.RECEIVED,
      resolver,
    );
  });
}

type TransactionsResult = QueryFunctionResult<typeof transactionsQueryFunction>;

export const getTitle = ({
  protocol,
  status,
  type,
}: {
  protocol?: ProtocolType;
  status: TransactionStatus;
  type?: TransactionType;
}) => {
  if (
    protocol &&
    (type === TransactionType.deposit || type === TransactionType.withdraw)
  ) {
    if (
      status === TransactionStatus.deposited ||
      status === TransactionStatus.withdrew ||
      status === TransactionStatus.sent ||
      status === TransactionStatus.received
    ) {
      if (protocol === ProtocolType.compound) {
        return 'Savings';
      } else {
        return ProtocolType?.[protocol];
      }
    }
  }
  return capitalize(status);
};

export const getTransactionLabel = ({
  direction,
  pending,
  protocol,
  status,
  type,
}: {
  direction: TransactionDirection;
  pending: boolean;
  protocol: ProtocolType | undefined;
  status: ZerionTransactionStatus | TransactionStatus;
  type?: TransactionType;
}) => {
  if (status === TransactionStatus.cancelling)
    return TransactionStatus.cancelling;

  if (status === TransactionStatus.cancelled)
    return TransactionStatus.cancelled;

  if (status === TransactionStatus.speeding_up)
    return TransactionStatus.speeding_up;

  if (pending && type === TransactionType.purchase)
    return TransactionStatus.purchasing;

  const isFromAccount = direction === TransactionDirection.out;
  const isToAccount = direction === TransactionDirection.in;
  const isSelf = direction === TransactionDirection.self;

  if (pending && type === TransactionType.authorize)
    return TransactionStatus.approving;

  if (pending && type === TransactionType.deposit) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.depositing;
    } else {
      return TransactionStatus.sending;
    }
  }

  if (pending && type === TransactionType.withdraw) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.withdrawing;
    } else {
      return TransactionStatus.receiving;
    }
  }

  if (pending && isFromAccount) return TransactionStatus.sending;
  if (pending && isToAccount) return TransactionStatus.receiving;

  if (status === TransactionStatus.failed) return TransactionStatus.failed;
  if (status === TransactionStatus.dropped) return TransactionStatus.dropped;

  if (type === TransactionType.trade && isFromAccount)
    return TransactionStatus.swapped;

  if (type === TransactionType.authorize) return TransactionStatus.approved;
  if (type === TransactionType.purchase) return TransactionStatus.purchased;
  if (type === TransactionType.cancel) return TransactionStatus.cancelled;

  if (type === TransactionType.deposit) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.deposited;
    } else {
      return TransactionStatus.sent;
    }
  }

  if (type === TransactionType.withdraw) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.withdrew;
    } else {
      return TransactionStatus.received;
    }
  }

  if (isSelf) return TransactionStatus.self;

  if (isFromAccount) return TransactionStatus.sent;
  if (isToAccount) return TransactionStatus.received;

  return TransactionStatus.unknown;
};

export const getDescription = ({
  name,
  status,
  type,
}: {
  name: string;
  status: TransactionStatus;
  type: TransactionType;
}) => {
  switch (type) {
    case TransactionType.deposit:
      return status === TransactionStatus.depositing ||
        status === TransactionStatus.sending
        ? name
        : `Deposited ${name}`;
    case TransactionType.withdraw:
      return status === TransactionStatus.withdrawing ||
        status === TransactionStatus.receiving
        ? name
        : `Withdrew ${name}`;
    default:
      return name;
  }
};

type ParseTransactionArgs = {
  tx: ZerionTransaction;
  currency: SupportedCurrencyKey;
  network: Network;
};

const parseTransactionWithEmptyChanges = ({
  tx,
  currency,
  network,
}: ParseTransactionArgs): RainbowTransaction => {
  const methodName = 'Signed'; // let's ask BE to grab this for us: https://github.com/rainbow-me/rainbow/blob/develop/src/handlers/transactions.ts#L79
  const updatedAsset = {
    address: ETH_ADDRESS,
    decimals: 18,
    name: 'ethereum',
    symbol: 'ETH',
  };
  const priceUnit = 0;
  const valueUnit = 0;
  const nativeDisplay = convertRawAmountToNativeDisplay(
    0,
    18,
    priceUnit,
    currency,
  );

  return {
    address: ETH_ADDRESS,
    balance: isL2Network(network)
      ? { amount: '', display: '-' }
      : convertRawAmountToBalance(valueUnit, updatedAsset),
    description: methodName || 'Signed',
    from: tx.address_from || '',
    hash: `${tx.hash}-${0}`,
    minedAt: tx.mined_at,
    name: methodName || 'Signed',
    native: nativeDisplay,
    network,
    nonce: tx.nonce,
    pending: false,
    protocol: tx.protocol,
    status: TransactionStatus.contract_interaction,
    symbol: 'contract',
    title: `Contract Interaction`,
    to: tx.address_to,
    type: TransactionType.contract_interaction,
  };
};

function parseTransaction({
  tx,
  currency,
  network,
}: ParseTransactionArgs): RainbowTransaction | RainbowTransaction[] {
  if (tx.changes.length) {
    return tx.changes.map((internalTxn, index) => {
      const address: string =
        internalTxn?.asset?.asset_code?.toLowerCase() ?? '';
      const updatedAsset: {
        address: string;
        decimals: number;
        name: string;
        symbol: string;
      } = {
        address,
        decimals: internalTxn?.asset?.decimals,
        name: internalTxn?.asset?.name,
        symbol: (internalTxn?.asset?.symbol ?? '').toUpperCase(),
      };
      const priceUnit =
        internalTxn.price ?? internalTxn?.asset?.price?.value ?? 0;
      const valueUnit = internalTxn.value || 0;
      const nativeDisplay = convertRawAmountToNativeDisplay(
        valueUnit,
        updatedAsset.decimals,
        priceUnit,
        currency,
      );

      const status = getTransactionLabel({
        direction: internalTxn.direction || tx.direction,
        pending: false,
        protocol: tx.protocol,
        status: tx.status,
        type: tx.type,
      });

      const title = getTitle({
        protocol: tx.protocol,
        status,
        type: tx.type,
      });

      const description = getDescription({
        name: updatedAsset.name,
        status,
        type: tx.type,
      });
      return {
        address:
          updatedAsset.address.toLowerCase() === ETH_ADDRESS
            ? ETH_ADDRESS
            : updatedAsset.address,
        balance: convertRawAmountToBalance(valueUnit, updatedAsset),
        description,
        from: internalTxn.address_from ?? tx.address_from,
        hash: `${tx.hash}-${index}`,
        minedAt: tx.mined_at,
        name: updatedAsset.name,
        native: isL2Network(network)
          ? { amount: '', display: '' }
          : nativeDisplay,
        network,
        nonce: tx.nonce,
        pending: false,
        protocol: tx.protocol,
        status,
        symbol: updatedAsset.symbol,
        title,
        to: internalTxn.address_to ?? tx.address_to,
        type: tx.type,
      };
    });
  }

  return parseTransactionWithEmptyChanges({
    tx,
    currency,
    network,
  });
}

function parseTransactions(
  message: TransactionsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  const data = message?.payload?.transactions || [];
  const parsedTransactions = data
    .map((tx) =>
      parseTransaction({
        tx,
        currency,
        network: (message?.meta?.chain_id as Network) ?? Network.mainnet,
      }),
    )
    .flat();
  return parsedTransactions;
}

// ///////////////////////////////////////////////
// Query Hook

export function useTransactions(
  config: QueryConfig<TransactionsResult, Error, TransactionsQueryKey> = {},
) {
  const { address } = useAccount();
  const { currentCurrency } = useCurrentCurrencyStore();
  return useQuery(
    transactionsQueryKey({ address, currency: currentCurrency }),
    transactionsQueryFunction,
    {
      ...config,
      refetchInterval: TRANSACTIONS_REFETCH_INTERVAL,
    },
  );
}
