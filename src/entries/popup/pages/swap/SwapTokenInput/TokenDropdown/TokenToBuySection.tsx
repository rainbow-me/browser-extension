import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { SearchAsset } from '~/core/types/search';
import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { rainbowGradient } from '~/design-system/components/Symbol/gradients';
import { TextStyles } from '~/design-system/styles/core.css';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import {
  AssetToBuySection,
  AssetToBuySectionId,
} from '~/entries/popup/hooks/useSearchCurrencyLists';
import { useVirtualizedAssets } from '~/entries/popup/hooks/useVirtualizedAssets';

import { TokenToBuyRow } from '../TokenRow/TokenToBuyRow';

interface SectionProp {
  title: string;
  symbol: SymbolProps['symbol'];
  headerColor?: TextStyles['color'];
  gradient?: React.ReactNode;
  webkitBackgroundClip?: TextStyles['WebkitBackgroundClip'];
  background?: TextStyles['background'];
}
const sectionProps: { [id in AssetToBuySectionId]: SectionProp } = {
  favorites: {
    title: i18n.t('token_search.section_header.favorites'),
    symbol: 'star.fill' as SymbolProps['symbol'],
    headerColor: 'yellow' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
  bridge: {
    title: i18n.t('token_search.section_header.bridge'),
    symbol: 'shuffle' as SymbolProps['symbol'],
    headerColor: 'labelTertiary' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
  verified: {
    title: i18n.t('token_search.section_header.verified'),
    symbol: 'checkmark.seal.fill' as SymbolProps['symbol'],
    headerColor: 'transparent' as TextStyles['color'],
    gradient: rainbowGradient,
    webkitBackgroundClip: 'text' as TextStyles['WebkitBackgroundClip'],
    background: 'rainbow' as TextStyles['background'],
  },
  unverified: {
    title: i18n.t('token_search.section_header.unverified'),
    symbol: 'exclamationmark.triangle.fill' as SymbolProps['symbol'],
    headerColor: 'labelTertiary' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
  other_networks: {
    title: i18n.t('token_search.section_header.on_other_networks'),
    symbol: 'network' as SymbolProps['symbol'],
    headerColor: 'labelTertiary' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
};

export const TokenToBuySection = ({
  assetSection,
  onSelectAsset,
  onDropdownChange,
}: {
  assetSection: AssetToBuySection;
  onSelectAsset?: (asset: ParsedSearchAsset | null) => void;
  onDropdownChange: (open: boolean) => void;
}) => {
  const { containerRef, assetsRowVirtualizer } = useVirtualizedAssets({
    assets: assetSection.data,
    size: 5,
  });

  const otherNetworksSection = assetSection.id === 'other_networks';

  const {
    background,
    gradient,
    headerColor,
    symbol,
    title,
    webkitBackgroundClip,
  } = sectionProps[assetSection.id];

  if (!assetSection.data.length) return null;
  return (
    <Box testId={`${assetSection.id}-token-to-buy-section`} paddingTop="12px">
      <Stack space="16px">
        {otherNetworksSection ? (
          <Box borderRadius="12px" style={{ height: '52px' }}>
            <Inset horizontal="20px" vertical="8px">
              <Inline space="8px" alignVertical="center">
                <CoinIcon asset={undefined} />
                <Text size="14pt" weight="semibold" color={'labelQuaternary'}>
                  {i18n.t('swap.tokens_input.nothing_found')}
                </Text>
              </Inline>
            </Inset>
          </Box>
        ) : null}

        <Box paddingHorizontal="20px" width="full">
          <Inline space="4px" alignVertical="center">
            <Symbol
              symbol={symbol}
              color={headerColor}
              weight="semibold"
              size={14}
              gradient={gradient}
            />
            <Box style={{ width: 225 }}>
              <Text
                webkitBackgroundClip={webkitBackgroundClip}
                background={background}
                size="14pt"
                weight="semibold"
                color={headerColor}
              >
                {title}
              </Text>
            </Box>
          </Inline>
        </Box>

        <Box ref={containerRef}>
          {assetsRowVirtualizer?.getVirtualItems().map((virtualItem, i) => {
            const { index } = virtualItem;
            const asset = assetSection.data?.[index] as SearchAsset;
            return (
              <Box
                paddingHorizontal="8px"
                key={`${asset?.uniqueId}-${i}-${assetSection.id}`}
                onClick={() => onSelectAsset?.(asset as ParsedSearchAsset)}
                testId={`${asset?.uniqueId}-${assetSection.id}-token-to-buy-row`}
              >
                <TokenToBuyRow
                  onDropdownChange={onDropdownChange}
                  asset={asset}
                  testId={`${asset?.uniqueId}-${assetSection.id}-token-to-buy-row`}
                />
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
};
