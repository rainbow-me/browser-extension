import React, { useCallback, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useFavoritesStore } from '~/core/state/favorites';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain, isL2Chain } from '~/core/utils/chains';
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

import { RowHighlightWrapper } from './RowHighlightWrapper';

const { innerWidth: windowWidth } = window;
const TEXT_MAX_WIDTH = windowWidth - 180;

export type TokenToBuyRowProps = {
  asset: SearchAsset;
  onDropdownChange: (open: boolean) => void;
};

export function TokenToBuyRow({ asset, onDropdownChange }: TokenToBuyRowProps) {
  const { addFavorite, favorites, removeFavorite } = useFavoritesStore();
  const isFavorite = useMemo(
    () => favorites[asset?.chainId]?.includes(asset?.address),
    [asset, favorites],
  );
  const leftColumn = useMemo(
    () => (
      <Rows space="8px">
        <Row>
          <TextOverflow
            maxWidth={TEXT_MAX_WIDTH}
            size="14pt"
            weight="semibold"
            color="label"
          >
            {asset?.name}
          </TextOverflow>
        </Row>
        <Row>
          <TextOverflow
            maxWidth={TEXT_MAX_WIDTH}
            size="12pt"
            weight="semibold"
            color="labelTertiary"
          >
            {asset?.symbol}
          </TextOverflow>
        </Row>
      </Rows>
    ),
    [asset?.name, asset?.symbol],
  );

  const viewOnExplorer = useCallback(() => {
    const explorer = getBlockExplorerHostForChain(
      asset?.chainId || ChainId.mainnet,
    );
    goToNewTab({
      url: getExplorerUrl(explorer, asset?.address),
    });
  }, [asset?.address, asset?.chainId]);

  const onValueChange = useCallback(
    (value: string) => {
      switch (value) {
        case 'copy':
          navigator.clipboard.writeText(asset?.address as string);
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
      } else {
        addFavorite({ address, chainId });
      }
    },
    [addFavorite, asset, isFavorite, removeFavorite],
  );

  const rightColumn = useMemo(
    () => (
      <Inline space="8px">
        {!asset?.isNativeAsset ? (
          <DropdownMenu onOpenChange={onDropdownChange}>
            <DropdownMenuTrigger asChild>
              <Box>
                <ButtonSymbol
                  symbol="info"
                  height="24px"
                  variant="plain"
                  color="fillHorizontal"
                  symbolColor="labelSecondary"
                />
              </Box>
            </DropdownMenuTrigger>
            <DropdownMenuContent marginRight="32px">
              <Stack space="4px">
                <Box paddingTop="8px" paddingBottom="12px">
                  <TextOverflow
                    maxWidth={200}
                    align="center"
                    size="14pt"
                    weight="bold"
                    color="label"
                  >{`${asset?.name} (${asset?.symbol})`}</TextOverflow>
                </Box>
                <Stack space="4px">
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup onValueChange={onValueChange}>
                    <DropdownMenuRadioItem value="copy">
                      <Box width="full">
                        <Inline space="8px" alignVertical="center">
                          <Inline alignVertical="center">
                            <Symbol
                              symbol="doc.on.doc.fill"
                              weight="semibold"
                              size={18}
                            />
                          </Inline>

                          <Stack space="6px">
                            <Text weight="semibold" size="14pt" color="label">
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
                                  isL2Chain(asset?.chainId || ChainId.mainnet)
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
                  </DropdownMenuRadioGroup>
                </Stack>
              </Stack>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <ButtonSymbol
          symbol="star.fill"
          height="24px"
          variant="plain"
          color="fillHorizontal"
          symbolColor={isFavorite ? 'yellow' : 'labelSecondary'}
          onClick={onToggleFavorite}
        />
      </Inline>
    ),
    [
      asset?.address,
      asset?.chainId,
      asset?.isNativeAsset,
      asset?.name,
      asset?.symbol,
      isFavorite,
      onToggleFavorite,
      onValueChange,
      onDropdownChange,
    ],
  );

  return (
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
  );
}
