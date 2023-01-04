import { upperCase } from 'lodash';
import React, { Fragment, ReactNode } from 'react';
import { Address } from 'wagmi';

import EthIcon from 'static/assets/ethIcon.png';
import { ETH_ADDRESS } from '~/core/references';
import { useCloudinaryAssetIcon } from '~/core/resources/cloudinary';
import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AccentColorProvider, Bleed, Box } from '~/design-system';
import { colors as emojiColors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';
import { pseudoRandomArrayItemFromString } from '~/entries/popup/utils/pseudoRandomArrayItemFromString';

import { ChainBadge } from '../ChainBadge/ChainBadge';

import {
  fallbackTextStyleExtraLarge,
  fallbackTextStyleLarge,
  fallbackTextStyleMedium,
  fallbackTextStyleSmall,
} from './CoinIcon.css';

export function CoinIcon({
  asset,
  fallbackText,
  size = 36,
}: {
  asset?: ParsedAsset | ParsedAddressAsset | null;
  fallbackText?: string;
  size?: number;
}) {
  const sym = asset?.symbol || fallbackText || '';

  const formattedSymbol = formatSymbol(sym, size);
  const mainnetAddress = asset?.mainnetAddress;
  const address = (asset?.address || '') as Address;
  const chain = asset?.chainId || ChainId.mainnet;
  const shadowColor = asset?.colors?.primary;

  return (
    <CoinIconWrapper size={size} shadowColor={shadowColor} chainId={chain}>
      <CloudinaryCoinIcon
        address={address}
        chainId={chain}
        mainnetAddress={mainnetAddress}
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
          <Box as={'p'} className={getFallbackTextStyle(sym)}>
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
  color?: string;
  size: number;
}) {
  if (color) {
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

  return (
    <Box
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
  );
}

function CoinIconWrapper({
  chainId,
  children,
  shadowColor,
  size,
}: {
  chainId: ChainId;
  children: React.ReactNode;
  shadowColor?: string;
  size: number;
}) {
  return (
    <Fragment>
      <ShadowWrapper color={shadowColor} size={size}>
        {children}
      </ShadowWrapper>
      {chainId !== ChainId.mainnet && (
        <Bleed top="16px" left="6px">
          <ChainBadge chainId={chainId} shadow size="extraSmall" />
        </Bleed>
      )}
    </Fragment>
  );
}

function CloudinaryCoinIcon({
  address,
  chainId,
  mainnetAddress,
  children,
}: {
  address: Address;
  chainId: ChainId;
  mainnetAddress?: Address;
  children: React.ReactNode;
}) {
  const { data: imageUrl } = useCloudinaryAssetIcon({
    address,
    chainId,
    mainnetAddress,
  });
  let src = imageUrl;
  const eth = ETH_ADDRESS as Address;

  if (address === eth || mainnetAddress === eth) {
    src = EthIcon;
  }

  if (src) {
    return <img src={src} width="100%" height="100%" />;
  }

  return <Fragment>{children}</Fragment>;
}

function getFallbackTextStyle(text: string) {
  if (!text) return undefined;
  else if (text.length > 4) return fallbackTextStyleSmall;
  else if (text.length === 4) return fallbackTextStyleMedium;
  else if (text.length === 3) return fallbackTextStyleLarge;
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
