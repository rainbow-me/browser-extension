import { upperCase } from 'lodash';
import React, { Fragment, ReactNode } from 'react';
import { Address } from 'wagmi';

import EthIcon from 'static/assets/ethIcon.png';
import { ETH_ADDRESS } from '~/core/references';
import {
  ParsedAsset,
  ParsedSearchAsset,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { AccentColorProvider, Box } from '~/design-system';
import { colors as emojiColors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';
import { pseudoRandomArrayItemFromString } from '~/entries/popup/utils/pseudoRandomArrayItemFromString';

import { ChainBadge } from '../ChainBadge/ChainBadge';
import ExternalImage from '../ExternalImage/ExternalImage';

import {
  fallbackTextStyleExtraLarge,
  fallbackTextStyleExtraSmall,
  fallbackTextStyleLarge,
  fallbackTextStyleMedium,
  fallbackTextStyleSmall,
} from './CoinIcon.css';

export function CoinIcon({
  asset,
  fallbackText,
  size = 36,
  badge,
}: {
  asset?:
    | ParsedAsset
    | ParsedUserAsset
    | ParsedSearchAsset
    | SearchAsset
    | null;
  fallbackText?: string;
  size?: number;
  badge?: boolean;
}) {
  const sym = asset?.symbol || fallbackText || '';

  const formattedSymbol = formatSymbol(sym, size);
  const mainnetAddress = asset?.mainnetAddress;
  const address = (asset?.address || '') as Address;
  const chain = asset?.chainId || ChainId.mainnet;
  const shadowColor = asset?.colors?.primary || '#808088';

  return (
    <CoinIconWrapper
      badge={badge}
      size={size}
      shadowColor={shadowColor}
      chainId={chain}
    >
      <CloudinaryCoinIcon
        address={address}
        chainId={chain}
        mainnetAddress={(mainnetAddress || '') as Address}
        url={asset?.icon_url}
        size={size}
      >
        <Box
          justifyContent="center"
          flexDirection="column"
          style={{
            backgroundColor: pseudoRandomArrayItemFromString<string>(
              address || '',
              emojiColors,
            ),
            height: size,
            width: size,
            display: 'flex',
          }}
        >
          <Box as={'p'} className={getFallbackTextStyle(sym, size)}>
            {upperCase(formattedSymbol)}
          </Box>
        </Box>
      </CloudinaryCoinIcon>
    </CoinIconWrapper>
  );
}

function ShadowWrapper({
  children,
  color,
  size,
}: {
  children: ReactNode;
  color: string;
  size: number;
}) {
  return (
    <AccentColorProvider color={color}>
      <Box
        boxShadow={'24px accent'}
        background="fillSecondary"
        borderRadius="round"
        style={{
          width: size,
          height: size,
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </AccentColorProvider>
  );
}

function CoinIconWrapper({
  chainId,
  children,
  shadowColor,
  size,
  badge = true,
}: {
  chainId: ChainId;
  children: React.ReactNode;
  shadowColor: string;
  size: number;
  badge?: boolean;
}) {
  return (
    <Box position="relative">
      <ShadowWrapper color={shadowColor} size={size}>
        {children}
      </ShadowWrapper>
      {badge && chainId !== ChainId.mainnet && (
        <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
          <ChainBadge chainId={chainId} shadow size="16" />
        </Box>
      )}
    </Box>
  );
}

function CloudinaryCoinIcon({
  address,
  mainnetAddress,
  children,
  size = 36,
  url,
}: {
  address: Address;
  chainId: ChainId;
  mainnetAddress?: Address;
  children: React.ReactNode;
  size: number;
  url?: string;
}) {
  let src = url;
  const eth = ETH_ADDRESS as Address;

  if (address === eth || mainnetAddress === eth) {
    src = EthIcon;
  }

  if (src) {
    return <ExternalImage src={src} width={size} height={size} />;
  }

  return <Fragment>{children}</Fragment>;
}

function getFallbackTextStyle(text: string, size: number) {
  if (!text) return undefined;

  if (size < 24) return fallbackTextStyleExtraSmall;
  if (text.length > 4) {
    if (size < 28) return fallbackTextStyleExtraSmall;
    return fallbackTextStyleSmall;
  }
  if (size < 28) return fallbackTextStyleSmall;
  if (text.length === 4) return fallbackTextStyleMedium;
  if (text.length === 3) return fallbackTextStyleLarge;
  return fallbackTextStyleExtraLarge;
}

const _cache: Record<string, string> = {};
function formatSymbol(symbol: string, width: number) {
  if (!symbol) return '';

  const key = `${symbol}-${width}`;

  if (!_cache[key]) {
    _cache[key] = symbol
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 5)
      .toUpperCase();
  }

  return _cache[key];
}

const nftRadiusBySize = {
  14: '4px',
  16: '4px',
  36: '10px',
} as const;
export const NFTIcon = ({
  asset,
  size,
  badge = false,
}: {
  asset: ParsedAsset;
  size: keyof typeof nftRadiusBySize;
  badge?: boolean;
}) => {
  const chainId = asset.chainId;
  return (
    <Box position="relative" style={{ minWidth: size, height: size }}>
      <Box
        as="img"
        src={asset.icon_url}
        style={{ height: size, width: size }}
        borderRadius={nftRadiusBySize[size]}
      />
      <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
        {badge && chainId !== ChainId.mainnet && (
          <ChainBadge chainId={chainId} shadow size="16" />
        )}
      </Box>
    </Box>
  );
};

export function TwoCoinsIcon({
  size = 36,
  under,
  over,
}: {
  size?: number;
  under: ParsedAsset;
  over: ParsedAsset;
}) {
  const overSize = size * 0.75;
  const underSize = size * 0.67;

  const chainId = over.chainId;

  return (
    <Box position="relative" style={{ minWidth: size, height: size }}>
      <Box position="absolute" top="0" left="0" style={{ zIndex: 1 }}>
        <CoinIcon
          asset={under}
          size={underSize}
          fallbackText={under.symbol}
          badge={false}
        />
      </Box>
      <Box
        position="absolute"
        bottom="0"
        right="0"
        marginRight="-3px"
        marginBottom="-3px"
        borderRadius="round"
        borderWidth="3px"
        borderColor="surfaceSecondary"
        style={{ zIndex: 2 }}
      >
        <CoinIcon
          asset={over}
          size={overSize}
          fallbackText={over.symbol}
          badge={false}
        />
      </Box>
      <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
        {chainId !== ChainId.mainnet && (
          <ChainBadge chainId={chainId} shadow size="16" />
        )}
      </Box>
    </Box>
  );
}
