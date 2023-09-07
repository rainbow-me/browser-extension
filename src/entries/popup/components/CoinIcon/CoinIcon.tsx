import { upperCase } from 'lodash';
import React, { Fragment, ReactNode, useState } from 'react';

import EthIcon from 'static/assets/ethIcon.png';
import { ETH_ADDRESS } from '~/core/references';
import {
  AddressOrEth,
  ParsedAsset,
  ParsedSearchAsset,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { AccentColorProvider, Box } from '~/design-system';
import { colors as emojiColors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';
import { pseudoRandomArrayItemFromString } from '~/entries/popup/utils/pseudoRandomArrayItemFromString';

import { ChainBadge, ChainIconProps } from '../ChainBadge/ChainBadge';
import ExternalImage from '../ExternalImage/ExternalImage';

import {
  fallbackTextStyleExtraLarge,
  fallbackTextStyleLarge,
  fallbackTextStyleMedium,
  fallbackTextStyleSmall,
  fallbackTextStyleTiny,
  fallbackTextStyleXSmall,
  fallbackTextStyleXXSmall,
} from './CoinIcon.css';

export function CoinIcon({
  asset,
  fallbackText,
  size = 36,
  badge,
  badgePositionBottom = 0,
  badgePositionLeft = -6,
  badgeSize = '16',
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
  badgePositionBottom?: number;
  badgePositionLeft?: number;
  badgeSize?: ChainIconProps['size'];
}) {
  const sym = asset?.symbol || fallbackText || '';

  const formattedSymbol = formatSymbol(sym, size);
  const mainnetAddress = asset?.mainnetAddress;
  const address = asset?.address;
  const chain = asset?.chainId || ChainId.mainnet;
  const shadowColor = asset?.colors?.primary || '#808088';

  return (
    <CoinIconWrapper
      badge={badge}
      badgePositionBottom={badgePositionBottom}
      badgePositionLeft={badgePositionLeft}
      badgeSize={badgeSize}
      size={size}
      shadowColor={shadowColor}
      chainId={chain}
    >
      <CloudinaryCoinIcon
        address={address}
        chainId={chain}
        mainnetAddress={mainnetAddress}
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
          <Box as={'p'} className={getFallbackTextStyle(size, sym)}>
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
        boxShadow={size < 30 ? '12px accent' : '24px accent'}
        background="transparent"
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
  badgePositionBottom,
  badgePositionLeft,
  badgeSize,
}: {
  chainId: ChainId;
  children: React.ReactNode;
  shadowColor: string;
  size: number;
  badge?: boolean;
  badgePositionBottom: number;
  badgePositionLeft: number;
  badgeSize: ChainIconProps['size'];
}) {
  return (
    <Box position="relative" style={{ height: size, width: size }}>
      <ShadowWrapper color={shadowColor} size={size}>
        {children}
      </ShadowWrapper>
      {badge && chainId !== ChainId.mainnet && (
        <Box
          display="flex"
          height="fit"
          position="absolute"
          style={{ bottom: badgePositionBottom, left: badgePositionLeft }}
          width="fit"
        >
          <ChainBadge chainId={chainId} shadow size={badgeSize} />
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
  address?: AddressOrEth;
  chainId: ChainId;
  mainnetAddress?: AddressOrEth;
  children: React.ReactNode;
  size: number;
  url?: string;
}) {
  let src = url;
  const eth = ETH_ADDRESS;

  if (address === eth || mainnetAddress === eth) {
    src = EthIcon;
  }

  if (src) {
    return <ExternalImage src={src} width={size} height={size} />;
  }

  return <Fragment>{children}</Fragment>;
}

function getFallbackTextStyle(size: number, text: string) {
  if (!text) return undefined;

  if (size < 30) {
    if (text.length > 4) return fallbackTextStyleTiny;
    else if (text.length === 4) return fallbackTextStyleXXSmall;
    else if (text.length === 3) return fallbackTextStyleXSmall;
    return fallbackTextStyleSmall;
  } else {
    if (text.length > 4) return fallbackTextStyleSmall;
    else if (text.length === 4) return fallbackTextStyleMedium;
    else if (text.length === 3) return fallbackTextStyleLarge;
    return fallbackTextStyleExtraLarge;
  }
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
  20: '6px',
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
  const [badSrc, setBadSrc] = useState(false);
  if (!asset.icon_url || badSrc)
    return (
      <CoinIcon
        asset={asset}
        fallbackText={asset.name}
        size={size}
        badge={badge}
      />
    );
  return (
    <Box position="relative" style={{ minWidth: size, height: size }}>
      <Box
        as="img"
        src={asset.icon_url}
        style={{ height: size, width: size }}
        borderRadius={nftRadiusBySize[size]}
        onError={() => setBadSrc(true)}
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
  badge = true,
}: {
  size?: number;
  under: ParsedAsset;
  over: ParsedAsset;
  badge?: boolean;
}) {
  const overSize = size * 0.75;
  const underSize = size * 0.67;

  const chainId = over.chainId;

  return (
    <Box position="relative" style={{ minWidth: size, height: size }}>
      <Box
        position="absolute"
        top="0"
        left="0"
        style={{
          zIndex: 1,
          clipPath: `url(#underTokenClip)`,
          width: underSize * 0.924544,
          height: underSize * 0.924544,
        }}
      >
        <CoinIcon
          asset={under}
          size={underSize}
          fallbackText={under.symbol}
          badge={false}
        />
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <clipPath id="underTokenClip" clipPathUnits="objectBoundingBox">
            <path d="M0.56,0 C0.251,0,0,0.251,0,0.56 C0,0.731,0.077,0.885,0.199,0.988 C0.237,1,0.29,0.983,0.29,0.933 V0.933 C0.29,0.578,0.578,0.29,0.933,0.29 V0.29 C0.983,0.29,1,0.237,0.988,0.199 C0.885,0.077,0.731,0,0.56,0"></path>
          </clipPath>
        </svg>
      </Box>
      <Box
        position="absolute"
        bottom="0"
        right="0"
        borderRadius="round"
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
        {badge && chainId !== ChainId.mainnet && (
          <ChainBadge chainId={chainId} shadow size="16" />
        )}
      </Box>
    </Box>
  );
}
