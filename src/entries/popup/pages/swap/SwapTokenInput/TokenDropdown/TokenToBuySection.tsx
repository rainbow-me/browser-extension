import React, { ReactElement } from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { Box, Inline, Inset, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { rainbowGradient } from '~/design-system/components/Symbol/gradients';
import { TextStyles } from '~/design-system/styles/core.css';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';
import {
  AssetToBuySection,
  AssetToBuySectionId,
} from '~/entries/popup/hooks/useSearchCurrencyLists';

import { TokenToBuyRow } from '../TokenRow/TokenToBuyRow';

interface SectionProp {
  background?: TextStyles['background'];
  gradient?: React.ReactNode;
  color?: TextStyles['color'];
  symbol: SymbolProps['symbol'];
  title: string;
  webkitBackgroundClip?: TextStyles['WebkitBackgroundClip'];
}

const sectionProps: { [id in AssetToBuySectionId]: SectionProp } = {
  favorites: {
    title: i18n.t('token_search.section_header.favorites'),
    symbol: 'star.fill' as SymbolProps['symbol'],
    color: 'yellow' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
  bridge: {
    title: i18n.t('token_search.section_header.bridge'),
    symbol: 'shuffle' as SymbolProps['symbol'],
    color: 'label' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
  verified: {
    title: i18n.t('token_search.section_header.verified'),
    symbol: 'checkmark.seal.fill' as SymbolProps['symbol'],
    color: 'transparent' as TextStyles['color'],
    gradient: rainbowGradient,
    webkitBackgroundClip: 'text' as TextStyles['WebkitBackgroundClip'],
    background: 'rainbow' as TextStyles['background'],
  },
  unverified: {
    title: i18n.t('token_search.section_header.unverified'),
    symbol: 'exclamationmark.triangle.fill' as SymbolProps['symbol'],
    color: 'labelTertiary' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
  other_networks: {
    title: i18n.t('token_search.section_header.on_other_networks'),
    symbol: 'network' as SymbolProps['symbol'],
    color: 'labelTertiary' as TextStyles['color'],
    gradient: undefined,
    webkitBackgroundClip: undefined,
    background: undefined,
  },
};

const bridgeSectionsColorsByChain = {
  [ChainId.mainnet]: 'mainnet' as TextStyles['color'],
  [ChainId.arbitrum]: 'arbitrum' as TextStyles['color'],
  [ChainId.optimism]: 'optimism' as TextStyles['color'],
  [ChainId.polygon]: 'polygon' as TextStyles['color'],
  [ChainId.base]: 'base' as TextStyles['color'],
  [ChainId.zora]: 'zora' as TextStyles['color'],
  [ChainId.bsc]: 'bsc' as TextStyles['color'],
  [ChainId.avalanche]: 'avalanche' as TextStyles['color'],
};

const VerifiedWrappedTooltip = ({
  children,
  id,
}: {
  children: ReactElement;
  id: string;
}) => {
  if (id !== 'verified') return children;
  return (
    <CursorTooltip
      text={i18n.t('token_search.verified_by_rainbow')}
      textSize="12pt"
      textWeight="medium"
      textColor="labelSecondary"
      arrowAlignment="left"
      align="start"
    >
      {children}
    </CursorTooltip>
  );
};

export const getTokenToBuySectionElements = ({
  assetSection,
  outputChainId,
  onSelectAsset,
  onDropdownChange,
}: {
  assetSection: AssetToBuySection;
  outputChainId?: ChainId;
  onSelectAsset?: (asset: ParsedSearchAsset | null) => void;
  onDropdownChange: (open: boolean) => void;
}) => {
  const { background, gradient, symbol, title, webkitBackgroundClip } =
    sectionProps[assetSection.id];

  let color = bridgeSectionsColorsByChain[outputChainId || ChainId.mainnet];
  if (assetSection.id !== 'bridge') {
    color = sectionProps[assetSection.id].color;
  }

  if (!assetSection?.data?.length) return null;

  return [
    assetSection.id === 'other_networks' ? (
      <Box borderRadius="12px" style={{ height: '52px' }}>
        <Inset horizontal="20px" vertical="8px">
          <Inline space="8px" alignVertical="center">
            <CoinIcon asset={undefined} />
            <Text size="14pt" weight="semibold" color={'labelQuaternary'}>
              {i18n.t('swap.tokens_input.nothing_found')}{' '}
            </Text>
          </Inline>
        </Inset>
      </Box>
    ) : null,
    <Box
      key={'header'}
      paddingHorizontal="15px"
      paddingVertical="12px"
      style={{ height: '38px' }}
    >
      <VerifiedWrappedTooltip id={assetSection.id}>
        <Box paddingHorizontal="5px" width="full">
          <Inline space="4px" alignVertical="center">
            <Symbol
              symbol={symbol}
              color={color}
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
                color={color}
              >
                {title}
              </Text>
            </Box>
          </Inline>
        </Box>
      </VerifiedWrappedTooltip>
    </Box>,
    assetSection.data.map((asset, i) => {
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
    }),
  ].flat();
};
