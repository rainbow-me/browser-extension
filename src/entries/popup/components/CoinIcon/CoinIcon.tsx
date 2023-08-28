import { upperCase } from 'lodash';
import React, { Fragment, ReactNode } from 'react';

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
