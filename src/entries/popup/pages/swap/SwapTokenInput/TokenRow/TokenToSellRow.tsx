import { useMemo } from 'react';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { UniqueId } from '~/core/types/assets';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';
import { Asterisks } from '~/entries/popup/components/Asterisks/Asterisks';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';

import { RowHighlightWrapper } from './RowHighlightWrapper';

export type TokenToSellRowProps = {
  uniqueId: UniqueId;
};

export function TokenToSellRow({ uniqueId }: TokenToSellRowProps) {
  const { data: asset } = useUserAsset(uniqueId);
  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const balanceDisplay = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline space="4px">
          <Asterisks color="labelTertiary" size={8} />
          <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
            {asset?.symbol}
          </TextOverflow>
        </Inline>
      ) : (
        <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
          {asset?.balance?.display}
        </TextOverflow>
      ),
    [asset?.balance?.display, asset?.symbol, hideAssetBalances],
  );

  const nativeBalanceDisplay = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline alignHorizontal="right">
          <TextOverflow size="14pt" weight="semibold" align="right">
            {supportedCurrencies[currentCurrency].symbol}
          </TextOverflow>
          <Asterisks color="label" size={10} />
        </Inline>
      ) : (
        <TextOverflow size="14pt" weight="semibold" align="right">
          {asset?.native?.balance?.display}
        </TextOverflow>
      ),
    [asset?.native?.balance?.display, hideAssetBalances, currentCurrency],
  );

  const leftColumn = useMemo(
    () => (
      <Rows>
        <Row>
          <Box paddingVertical="4px">
            <TextOverflow size="14pt" weight="semibold">
              {asset?.name}
            </TextOverflow>
          </Box>
        </Row>
        <Row>
          <Box paddingVertical="4px">{balanceDisplay}</Box>
        </Row>
      </Rows>
    ),
    [asset?.name, balanceDisplay],
  );

  const rightColumn = useMemo(
    () => (
      <Box
        borderColor="buttonStroke"
        borderRadius="round"
        borderWidth="1px"
        padding="8px"
        background="surfaceMenu"
      >
        {nativeBalanceDisplay}
      </Box>
    ),
    [nativeBalanceDisplay],
  );

  return (
    <Lens
      borderRadius="12px"
      forceAvatarColor
      testId={`sell-row-${uniqueId}-active-element-item`}
    >
      <Box
        className={rowTransparentAccentHighlight}
        borderRadius="12px"
        style={{ height: '52px' }}
      >
        <RowHighlightWrapper>
          <Inset horizontal="12px" vertical="8px">
            <Rows>
              <Row>
                <Columns alignVertical="center" space="8px">
                  <Column width="content">
                    <CoinIcon asset={asset} />
                  </Column>
                  <Column>{leftColumn}</Column>
                  <Column width="content">{rightColumn}</Column>
                </Columns>
              </Row>
            </Rows>
          </Inset>
        </RowHighlightWrapper>
      </Box>
    </Lens>
  );
}
