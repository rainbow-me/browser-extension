import React, { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { UniqueId } from '~/core/types/assets';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Symbol,
  Text,
} from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { CoinbaseIcon } from '../../components/CoinbaseIcon/CoinbaseIcon';
import { WalletIcon } from '../../components/WalletIcon/WalletIcon';

const { innerWidth: windowWidth } = window;
const TEXT_MAX_WIDTH = windowWidth - 150;

export function Tokens() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets = [] } = useUserAssets(
    { address, currency },
    { select: selectUserAssetsList },
  );

  const { data: balance } = useBalance({ addressOrName: address });

  if (balance?.formatted === '0.0') {
    return (
      <Inset horizontal="20px">
        <Box paddingBottom="8px">
          <a href="https://www.coinbase.com/" target="_blank" rel="noreferrer">
            <Box
              background={{
                default: 'surfaceSecondaryElevated',
              }}
              borderRadius="16px"
              borderColor="separatorTertiary"
              boxShadow="12px"
            >
              <Inset horizontal="16px" vertical="16px">
                <Box paddingBottom="12px">
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Box>
                      <Inline alignVertical="center" space="8px">
                        <CoinbaseIcon />
                        <Text
                          as="p"
                          size="14pt"
                          color="label"
                          weight="semibold"
                        >
                          {i18n.t('tokens_tab.coinbase_title')}
                        </Text>
                      </Inline>
                    </Box>
                    <Symbol
                      size={12}
                      symbol="arrow.up.forward.circle"
                      weight="semibold"
                      color="labelTertiary"
                    />
                  </Inline>
                </Box>
                <Text as="p" size="11pt" color="labelSecondary" weight="bold">
                  {i18n.t('tokens_tab.coinbase_description')}
                </Text>
              </Inset>
            </Box>
          </a>
        </Box>

        <Box
          background={{
            default: 'surfacePrimaryElevated',
          }}
          borderRadius="16px"
          borderColor="separatorTertiary"
          boxShadow="12px"
          borderWidth="1px"
        >
          <Inset horizontal="16px" vertical="16px">
            <Box paddingBottom="12px">
              <Inline alignVertical="center" space="8px">
                <WalletIcon />
                <Text as="p" size="14pt" color="label" weight="semibold">
                  {i18n.t('tokens_tab.send_from_wallet')}
                </Text>
              </Inline>
            </Box>
            <Text as="p" size="11pt" color="labelSecondary" weight="bold">
              {i18n.t('tokens_tab.send_description_1')}{' '}
              <Box
                background="fillSecondary"
                as="span"
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  lineHeight: '16px',
                }}
              >
                C
              </Box>{' '}
              {i18n.t('tokens_tab.send_description_2')}
            </Text>
          </Inset>
        </Box>
      </Inset>
    );
  }
  return (
    <Box
      style={{
        overflow: 'auto',
      }}
      marginTop="-16px"
    >
      {assets?.map((asset, i) => (
        <AssetRow key={`${asset?.uniqueId}-${i}`} uniqueId={asset?.uniqueId} />
      ))}
    </Box>
  );
}

type AssetRowProps = {
  uniqueId: UniqueId;
};

export function AssetRow({ uniqueId }: AssetRowProps) {
  const asset = useUserAsset(uniqueId);
  const name = asset?.name;
  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const priceChange = asset?.native?.price?.change;
  const priceChangeDisplay = priceChange?.length ? priceChange : '-';
  const priceChangeColor =
    priceChangeDisplay[0] !== '-' ? 'green' : 'labelTertiary';

  const balanceDisplay = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline space="4px">
          <Asterisks color="labelTertiary" size={8} />
          <TextOverflow
            maxWidth={TEXT_MAX_WIDTH}
            color="labelTertiary"
            size="12pt"
            weight="semibold"
          >
            {asset?.symbol}
          </TextOverflow>
        </Inline>
      ) : (
        <TextOverflow
          maxWidth={TEXT_MAX_WIDTH}
          color="labelTertiary"
          size="12pt"
          weight="semibold"
        >
          {asset?.balance?.display}
        </TextOverflow>
      ),
    [asset?.balance?.display, asset?.symbol, hideAssetBalances],
  );
  const nativeBalanceDisplay = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline alignHorizontal="right">
          <TextOverflow
            maxWidth={TEXT_MAX_WIDTH}
            size="14pt"
            weight="semibold"
            align="right"
          >
            {supportedCurrencies[currentCurrency].symbol}
          </TextOverflow>
          <Asterisks color="label" size={10} />
        </Inline>
      ) : (
        <Text size="14pt" weight="semibold" align="right">
          {asset?.native?.balance?.display}
        </Text>
      ),
    [asset?.native?.balance?.display, hideAssetBalances, currentCurrency],
  );

  const topRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Text size="14pt" weight="semibold">
              {name}
            </Text>
          </Box>
        </Column>
        <Column>
          <Box paddingVertical="4px">{nativeBalanceDisplay}</Box>
        </Column>
      </Columns>
    ),
    [name, nativeBalanceDisplay],
  );

  const bottomRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">{balanceDisplay}</Box>
        </Column>
        <Column>
          <Box paddingVertical="4px">
            <Text
              color={priceChangeColor}
              size="12pt"
              weight="semibold"
              align="right"
            >
              {priceChangeDisplay}
            </Text>
          </Box>
        </Column>
      </Columns>
    ),
    [balanceDisplay, priceChangeColor, priceChangeDisplay],
  );

  return <CoinRow asset={asset} topRow={topRow} bottomRow={bottomRow} />;
}
