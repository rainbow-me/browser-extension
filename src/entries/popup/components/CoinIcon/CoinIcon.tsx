import { capitalize, upperCase } from 'lodash';
import React from 'react';
// @ts-expect-error // no declaration for this yet
import * as CoinIconsImages from 'react-coin-icon/lib/pngs';
import { Address } from 'wagmi';

import { ParsedAddressAsset, UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { deriveAddressAndChainWithUniqueId } from '~/core/utils/address';
import { Bleed, Box, Text } from '~/design-system';
import { useCloudinaryAssetIcon } from '~/entries/popup/hooks/useCloudinaryAssetIcon';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { colors } from '~/entries/popup/utils/emojiAvatarBackgroundColors';
import { pseudoRandomArrayItemFromString } from '~/entries/popup/utils/pseudoRandomArrayItemFromString';

import { ChainBadge } from '../ChainBadge/ChainBadge';

export function CoinIcon({
  symbol,
  uniqueId,
}: {
  symbol?: string;
  uniqueId: UniqueId;
}) {
  const asset = useUserAsset(uniqueId) || ({} as ParsedAddressAsset);
  const [showImage, setShowImage] = React.useState(true);
  const sym = asset?.symbol || symbol || '';

  const localImage = CoinIconsImages[capitalize(sym)];
  const formattedSymbol = formatSymbol(sym, 36);
  const fontSize = buildFallbackFontSize(formattedSymbol, 36);
  const { mainnetAddress } = asset;
  const { address, chain } = deriveAddressAndChainWithUniqueId(uniqueId);
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
    <CoinIconWrapper chainId={chain}>
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
                colors,
              ),
              height: 36,
              width: 36,
              display: 'flex',
            }}
          >
            <Text color="label" weight="bold" size={fontSize} align="center">
              {upperCase(formattedSymbol)}
            </Text>
          </Box>
        </FallbackCoinIcon>
      )}
    </CoinIconWrapper>
  );
}

function CoinIconWrapper({
  chainId,
  children,
}: {
  chainId: ChainId;
  children: React.ReactNode;
}) {
  return (
    <React.Fragment>
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
      {chainId !== ChainId.mainnet && (
        <Bleed top="12px" left="6px">
          <ChainBadge chainId={chainId} size="extraSmall" />
        </Bleed>
      )}
    </React.Fragment>
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
  const imageUrl = useCloudinaryAssetIcon({ address, chainId, mainnetAddress });
  return (
    <React.Fragment>
      {imageUrl && <img src={imageUrl} width="100%" height="100%" />}
      {!imageUrl && children}
    </React.Fragment>
  );
}

function buildFallbackFontSize(symbol: string, width: number) {
  if (!symbol) return undefined;
  else if (width < 30 || symbol.length > 4) return '7pt';
  else if (symbol.length === 4) return '8pt';
  else if (symbol.length === 1 || symbol.length === 2) return '12pt';
  return '11pt';
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
