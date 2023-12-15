import { upperCase } from 'lodash';
import React, { ReactNode } from 'react';

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
import { AccentColorProvider, Box, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';
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
  const mainnetAddress = asset?.mainnetAddress;
  const address = asset?.address;
  const chain = asset?.chainId || ChainId.mainnet;
  const shadowColor = asset?.colors?.primary || '#808088';
  const isNft =
    (asset as ParsedAsset)?.standard === 'erc-721' ||
    (asset as ParsedAsset)?.standard === 'erc-1155';

  return asset ? (
    <CoinIconWrapper
      badge={badge}
      badgePositionBottom={badgePositionBottom}
      badgePositionLeft={badgePositionLeft}
      badgeSize={badgeSize}
      size={size}
      shadowColor={shadowColor}
      chainId={chain}
      borderRadius={isNft ? nftRadiusBySize[size === 20 ? 20 : 36] : undefined}
    >
      <CloudinaryCoinIcon
        address={address}
        fallbackText={asset?.symbol || fallbackText}
        mainnetAddress={mainnetAddress}
        url={asset?.icon_url}
        size={size}
      />
    </CoinIconWrapper>
  ) : (
    <Box
      background="fillQuaternary"
      borderColor="separatorTertiary"
      borderWidth="1px"
      style={{
        borderRadius: isNft ? nftRadiusBySize[size === 20 ? 20 : 36] : size / 2,
        height: size,
        width: size,
      }}
    />
  );
}

function ShadowWrapper({
  children,
  color,
  size,
  borderRadius,
}: {
  children: ReactNode;
  color: string;
  size: number;
  borderRadius?: BoxStyles['borderRadius'];
}) {
  return (
    <AccentColorProvider color={color}>
      <Box
        boxShadow={size < 30 ? '12px accent' : '24px accent'}
        background="transparent"
        borderRadius={borderRadius || 'round'}
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
  borderRadius,
}: {
  chainId: ChainId;
  children: React.ReactNode;
  shadowColor: string;
  size: number;
  badge?: boolean;
  badgePositionBottom: number;
  badgePositionLeft: number;
  badgeSize: ChainIconProps['size'];
  borderRadius?: BoxStyles['borderRadius'];
}) {
  return (
    <Box position="relative" style={{ height: size, width: size }}>
      <ShadowWrapper
        borderRadius={borderRadius}
        color={shadowColor}
        size={size}
      >
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

const nftRadiusBySize = {
  14: '4px',
  16: '4px',
  20: '6px',
  36: '10px',
} as const;

function CloudinaryCoinIcon({
  address,
  fallbackText,
  mainnetAddress,
  size = 36,
  url,
}: {
  address?: AddressOrEth;
  fallbackText?: string;
  mainnetAddress?: AddressOrEth;
  size: number;
  url?: string;
}) {
  let src = url;
  const eth = ETH_ADDRESS;

  if (address === eth || mainnetAddress === eth) {
    src = EthIcon;
  }

  const formattedSymbol = fallbackText ? formatSymbol(fallbackText, size) : '';

  return (
    <ExternalImage
      customFallback={
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          borderRadius={nftRadiusBySize[size === 20 ? 20 : 36]}
          style={{
            backgroundColor: pseudoRandomArrayItemFromString<string>(
              address || '',
              emojiColors,
            ),
            height: size,
            width: size,
          }}
        >
          <Box as={'p'} className={getFallbackTextStyle(size, formattedSymbol)}>
            {upperCase(formattedSymbol)}
          </Box>
        </Box>
      }
      src={src}
      width={size}
      height={size}
      borderRadius={nftRadiusBySize[size === 20 ? 20 : 36]}
    />
  );
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
      <ExternalImage
        borderRadius={nftRadiusBySize[size]}
        src={asset.icon_url}
        height={size}
        width={size}
      />
      {badge && chainId !== ChainId.mainnet && (
        <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
          <ChainBadge chainId={chainId} shadow size="16" />
        </Box>
      )}
    </Box>
  );
};

export const ContractIcon = ({
  size,
  iconUrl,
  badge,
  chainId,
}: {
  iconUrl?: string;
  size: keyof typeof nftRadiusBySize;
  badge?: boolean;
  chainId?: ChainId;
}) => {
  return (
    <Box position="relative" style={{ height: size, width: size }}>
      <ExternalImage
        borderRadius={nftRadiusBySize[size]}
        customFallback={
          <Box
            alignItems="center"
            background="fillQuaternary"
            borderColor="separatorTertiary"
            borderRadius={nftRadiusBySize[size]}
            borderWidth="1px"
            display="flex"
            height="full"
            justifyContent="center"
            width="full"
          >
            <Box opacity="0.5">
              <Symbol
                color="labelQuaternary"
                size={Math.min(size / 2.3, 24)}
                symbol="safari.fill"
                weight="heavy"
              />
            </Box>
          </Box>
        }
        src={iconUrl}
        width={size}
        height={size}
      />
      {badge && chainId && chainId !== ChainId.mainnet && (
        <Box position="absolute" bottom="0" style={{ zIndex: 2, left: '-6px' }}>
          <ChainBadge chainId={chainId} shadow size="16" />
        </Box>
      )}
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
