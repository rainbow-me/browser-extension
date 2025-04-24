import React, { useCallback, useMemo } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { useFavoritesStore } from '~/core/state/favorites';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import { getExplorerUrl, goToNewTab } from '~/core/utils/tabs';
import {
  Bleed,
  Box,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';

import { RowHighlightWrapper } from './RowHighlightWrapper';

export type TokenToBuyRowProps = {
  asset: SearchAsset;
  testId: string;
  onDropdownChange: (open: boolean) => void;
};

export function TokenToBuyRow({
  asset,
  testId,
  onDropdownChange,
}: TokenToBuyRowProps) {
  const { addFavorite, favorites, removeFavorite } = useFavoritesStore();
  const isFavorite = useMemo(
    () => favorites[asset?.chainId]?.includes(asset?.address),
    [asset, favorites],
  );
  const leftColumn = useMemo(
    () => (
      <Rows space="8px">
        <Row>
          <TextOverflow size="14pt" weight="semibold" color="label">
            {asset?.name}
          </TextOverflow>
        </Row>
        <Row>
          <TextOverflow size="12pt" weight="semibold" color="labelTertiary">
            {asset?.symbol}
          </TextOverflow>
        </Row>
      </Rows>
    ),
    [asset?.name, asset?.symbol],
  );
  const explorer = getBlockExplorerHostForChain(
    asset?.chainId || ChainId.mainnet,
  );

  const viewOnExplorer = useCallback(() => {
    explorer &&
      goToNewTab({
        url: getExplorerUrl(explorer, asset?.address),
        active: false,
      });
  }, [asset?.address, explorer]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          navigator.clipboard.writeText(asset?.address as string);
          triggerToast({
            title: i18n.t('wallet_header.copy_toast'),
            description: truncateAddress(asset?.address),
          });
          break;
        case 'view':
          viewOnExplorer();
          break;
      }
    },
    [asset?.address, viewOnExplorer],
  );

  const onToggleFavorite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e?.stopPropagation();
      const { address, chainId } = asset;
      if (isFavorite) {
        removeFavorite({ address, chainId });
        analytics.track(
          event.tokenUnfavorited,
          {
            token: { address, chainId },
            favorites: { favoritesLength: favorites[chainId]?.length || 0 },
          },
        );
      } else {
        addFavorite({ address, chainId });
        analytics.track(
          event.tokenFavorited,
          {
            token: { address, chainId },
            favorites: { favoritesLength: favorites[chainId]?.length || 0 },
          },
        );
      }
    },
    [addFavorite, asset, favorites, isFavorite, removeFavorite],
  );

  const rightColumn = useMemo(
    () => (
      <Inline space="8px">
        {!asset?.isNativeAsset ? (
          <Box onClick={(e) => e.stopPropagation}>
            <DropdownMenu onOpenChange={onDropdownChange}>
              <DropdownMenuTrigger asChild>
                <Box>
                  <ButtonSymbol
                    symbol="info"
                    height="24px"
                    variant="plain"
                    color="fillHorizontal"
                    symbolColor="labelSecondary"
                    testId={`${testId}-info-button`}
                  />
                </Box>
              </DropdownMenuTrigger>
              <DropdownMenuContent marginRight="12px">
                <Stack space="4px">
                  <Box paddingTop="8px" paddingBottom="12px">
                    <TextOverflow
                      align="center"
                      size="14pt"
                      weight="bold"
                      color="label"
                    >{`${asset?.name} (${asset?.symbol})`}</TextOverflow>
                  </Box>
                  <Stack space="4px">
                    <DropdownMenuSeparator />
                    <Box onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuRadioGroup onValueChange={onValueChange}>
                        <DropdownMenuRadioItem
                          onSelect={(e) => e.stopPropagation()}
                          value="copy"
                        >
                          <Box
                            testId={`${testId}-info-button-copy`}
                            // onClick={(e) => e.stopPropagation()}
                            width="full"
                          >
                            <Inline space="8px" alignVertical="center">
                              <Inline alignVertical="center">
                                <Symbol
                                  symbol="doc.on.doc.fill"
                                  weight="semibold"
                                  size={18}
                                />
                              </Inline>

                              <Stack space="6px">
                                <Text
                                  weight="semibold"
                                  size="14pt"
                                  color="label"
                                >
                                  {i18n.t('contacts.copy_address')}
                                </Text>
                                <Text
                                  weight="regular"
                                  size="11pt"
                                  color="labelTertiary"
                                >
                                  {truncateAddress(asset?.address)}
                                </Text>
                              </Stack>
                            </Inline>
                          </Box>
                        </DropdownMenuRadioItem>

                        {explorer && (
                          <DropdownMenuRadioItem value="view">
                            <Box width="full">
                              <Inline
                                alignVertical="center"
                                alignHorizontal="justify"
                              >
                                <Inline alignVertical="center" space="8px">
                                  <Inline alignVertical="center">
                                    <Symbol
                                      size={18}
                                      symbol="binoculars.fill"
                                      weight="semibold"
                                    />
                                  </Inline>
                                  <Text size="14pt" weight="semibold">
                                    {i18n.t(
                                      `contacts.${
                                        explorer !== 'etherscan'
                                          ? 'view_on_explorer'
                                          : 'view_on_etherscan'
                                      }`,
                                    )}
                                  </Text>
                                </Inline>
                                <Bleed vertical="8px">
                                  <Symbol
                                    size={14}
                                    symbol="arrow.up.forward.circle"
                                    weight="semibold"
                                    color="labelTertiary"
                                  />
                                </Bleed>
                              </Inline>
                            </Box>
                          </DropdownMenuRadioItem>
                        )}
                      </DropdownMenuRadioGroup>
                    </Box>
                  </Stack>
                </Stack>
              </DropdownMenuContent>
            </DropdownMenu>
          </Box>
        ) : null}
        <CursorTooltip
          align="end"
          arrowAlignment="right"
          arrowCentered
          text={i18n.t(isFavorite ? 'tooltip.unfavorite' : 'tooltip.favorite')}
          textWeight="bold"
          textSize="12pt"
          textColor="labelSecondary"
        >
          <ButtonSymbol
            symbol="star.fill"
            height="24px"
            variant="plain"
            color="fillHorizontal"
            symbolColor={isFavorite ? 'yellow' : 'labelSecondary'}
            onClick={onToggleFavorite}
            testId={`${testId}-favorite-button`}
          />
        </CursorTooltip>
      </Inline>
    ),
    [
      asset?.isNativeAsset,
      asset?.name,
      asset?.symbol,
      asset?.address,
      onDropdownChange,
      testId,
      onValueChange,
      explorer,
      isFavorite,
      onToggleFavorite,
    ],
  );

  return (
    <Lens
      borderRadius="12px"
      forceAvatarColor
      testId={`${testId}-active-element-item`}
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
