import { upperCase } from 'lodash';
import React, { Fragment, ReactNode } from 'react';
import { Address } from 'wagmi';

import EthIcon from 'static/assets/ethIcon.png';
import { ETH_ADDRESS } from '~/core/references';
import {
  ParsedAddressAsset,
  ParsedAsset,
  ParsedSearchAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { AccentColorProvider, Bleed, Box } from '~/design-system';
import { colors as emojiColors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';
import { pseudoRandomArrayItemFromString } from '~/entries/popup/utils/pseudoRandomArrayItemFromString';

import { ChainBadge } from '../ChainBadge/ChainBadge';
import ExternalImage from '../ExternalImage/ExternalImage';

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
  asset?:
    | ParsedAsset
    | ParsedAddressAsset
    | ParsedSearchAsset
    | SearchAsset
    | null;
  fallbackText?: string;
  size?: number;
}) {
  const sym = asset?.symbol || fallbackText || '';

  const formattedSymbol = formatSymbol(sym, size);
  const mainnetAddress = asset?.mainnetAddress;
  const address = (asset?.address || '') as Address;
  const chain = asset?.chainId || ChainId.mainnet;
  const shadowColor = asset?.colors?.primary || '#808088';

  return (
    <CoinIconWrapper size={size} shadowColor={shadowColor} chainId={chain}>
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
}: {
  chainId: ChainId;
  children: React.ReactNode;
  shadowColor: string;
  size: number;
}) {
  return (
    <Fragment>
      <ShadowWrapper color={shadowColor} size={size}>
        {children}
      </ShadowWrapper>
      {chainId !== ChainId.mainnet && (
        <Bleed top="16px" left="6px">
          <ChainBadge chainId={chainId} shadow size="16" />
        </Bleed>
      )}
    </Fragment>
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
