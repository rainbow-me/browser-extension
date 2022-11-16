import { capitalize, upperCase } from 'lodash';
import React, { Fragment, ReactNode } from 'react';
// @ts-expect-error // no declaration for this yet
import * as CoinIconsImages from 'react-coin-icon/lib/pngs';
import { Address } from 'wagmi';

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
}: {
  asset?: ParsedAsset | ParsedAddressAsset;
  fallbackText?: string;
}) {
  const [showImage, setShowImage] = React.useState(true);
  const sym = asset?.symbol || fallbackText || '';

  const localImage = CoinIconsImages[capitalize(sym)];
  const formattedSymbol = formatSymbol(sym, 36);
  const mainnetAddress = asset?.mainnetAddress;
  const address = (asset?.address || '') as Address;
  const chain = asset?.chainId || ChainId.mainnet;
  const shadowColor = asset?.colors?.primary;

  const IconImage =
    localImage && showImage ? (
      <img
        src={localImage}
        width="100%"
        height="100%"
        onError={() => setShowImage(false)}
      />
    ) : null;
  return (
    <CoinIconWrapper shadowColor={shadowColor} chainId={chain}>
      {IconImage || (
        <FallbackCoinIcon
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
              height: 36,
              width: 36,
              display: 'flex',
            }}
          >
            <Box as={'p'} className={getFallbackTextStyle(sym)}>
              {upperCase(formattedSymbol)}
            </Box>
          </Box>
        </FallbackCoinIcon>
      )}
    </CoinIconWrapper>
  );
}

function ShadowWrapper({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  if (color) {
    return (
      <AccentColorProvider color={color}>
        <Box
          boxShadow={'24px accent'}
          background="fill"
          borderRadius="round"
          style={{
            width: 36,
            height: 36,
            overflow: 'hidden',
            marginRight: '8px',
          }}
        >
          {children}
        </Box>
      </AccentColorProvider>
    );
  }

  return (
    <Box
      background="fill"
      borderRadius="round"
      style={{
        width: 36,
        height: 36,
        overflow: 'hidden',
        marginRight: '8px',
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
}: {
  chainId: ChainId;
  children: React.ReactNode;
  shadowColor?: string;
}) {
  return (
    <Fragment>
      <ShadowWrapper color={shadowColor}>{children}</ShadowWrapper>
      {chainId !== ChainId.mainnet && (
        <Bleed top="12px" left="6px">
          <ChainBadge chainId={chainId} shadow size="extraSmall" />
        </Bleed>
      )}
    </Fragment>
  );
}

function FallbackCoinIcon({
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

  if (imageUrl) {
    return <img src={imageUrl} width="100%" height="100%" />;
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
