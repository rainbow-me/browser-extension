import { formatUnits } from '@ethersproject/units';
import { ReactNode } from 'react';

import { i18n } from '~/core/languages';
import { formatNumber } from '~/core/utils/formatNumber';
import { Inline, Stack, Symbol, Text } from '~/design-system';
import { TextColor } from '~/design-system/styles/designTokens';

import { CoinIcon, NFTIcon } from '../../components/CoinIcon/CoinIcon';
import { Spinner } from '../../components/Spinner/Spinner';

import {
  SimulationError,
  TransactionSimulation,
} from './useSimulateTransaction';

export function SimulationNoChangesDetected() {
  return (
    <Inline space="8px" alignVertical="center">
      <Symbol
        symbol="waveform.badge.magnifyingglass"
        color="labelTertiary"
        size={16}
        weight="medium"
      />
      <Text size="14pt" weight="semibold" color="labelTertiary">
        {i18n.t('simulation.no_changes')}
      </Text>
    </Inline>
  );
}

function SimulatedChangeRow({
  asset,
  quantity,
  symbol,
  color,
  label,
}: {
  asset: TransactionSimulation['in'][0]['asset'];
  // eslint-disable-next-line @typescript-eslint/ban-types
  quantity: (string & {}) | 'UNLIMITED';
  symbol: ReactNode;
  color: TextColor;
  label: string;
}) {
  return (
    <Inline space="24px" alignHorizontal="justify" alignVertical="center">
      <Inline space="12px" alignVertical="center">
        {symbol}
        <Text size="14pt" weight="bold" color="label">
          {label}
        </Text>
      </Inline>
      <Inline space="6px" alignVertical="center">
        {asset?.type === 'nft' ? (
          <NFTIcon asset={asset} size={16} />
        ) : (
          <CoinIcon asset={asset} size={14} />
        )}
        <Text size="14pt" weight="bold" color={color}>
          {quantity === 'UNLIMITED'
            ? i18n.t('approvals.unlimited')
            : formatNumber(formatUnits(quantity, asset.decimals))}{' '}
          {asset.symbol}
        </Text>
      </Inline>
    </Inline>
  );
}

export function SimulationOverview({
  simulation,
  status,
  error,
}: {
  simulation: TransactionSimulation | undefined;
  status: 'loading' | 'error' | 'success';
  error: SimulationError | null;
}) {
  const isMalicious = simulation?.scanning.result !== 'OK';
  return (
    <>
      {status === 'loading' && (
        <Inline alignVertical="center" space="8px">
          <Spinner size={16} color="blue" />
          <Text size="14pt" weight="semibold" color="blue">
            {i18n.t('simulation.loading')}
          </Text>
        </Inline>
      )}

      {status === 'error' && (
        <Inline alignVertical="center" space="8px">
          <Symbol symbol="xmark.circle" size={16} color="red" weight="bold" />
          <Text size="14pt" weight="semibold" color="red">
            {error === 'REVERT'
              ? i18n.t('simulation.reverted')
              : i18n.t('simulation.error')}
          </Text>
        </Inline>
      )}

      {status === 'success' &&
        (!simulation?.hasChanges ? (
          <SimulationNoChangesDetected />
        ) : (
          <Stack space="14px">
            {simulation.in.map(({ asset, quantity }, i) => (
              <SimulatedChangeRow
                key={`${asset.address}${i}`}
                asset={asset}
                quantity={quantity}
                color="green"
                symbol={
                  <Symbol
                    size={14}
                    symbol="arrow.up.circle.fill"
                    weight="bold"
                    color="green"
                  />
                }
                label={i18n.t('simulation.received')}
              />
            ))}
            {simulation.out.map(({ asset, quantity }, i) => (
              <SimulatedChangeRow
                key={`${asset.address}${i}`}
                asset={asset}
                quantity={quantity}
                color="red"
                symbol={
                  <Symbol
                    size={14}
                    symbol="arrow.down.circle.fill"
                    weight="bold"
                    color="red"
                  />
                }
                label={i18n.t('simulation.sent')}
              />
            ))}
            {simulation.approvals.map(({ asset, quantityAllowed }, i) => (
              <SimulatedChangeRow
                key={`${asset.address}${i}`}
                asset={asset}
                quantity={quantityAllowed}
                color="label"
                symbol={
                  <Symbol
                    size={14}
                    symbol="checkmark.seal.fill"
                    weight="bold"
                    color={isMalicious ? 'red' : 'blue'}
                  />
                }
                label={i18n.t('simulation.approved')}
              />
            ))}
          </Stack>
        ))}
    </>
  );
}
