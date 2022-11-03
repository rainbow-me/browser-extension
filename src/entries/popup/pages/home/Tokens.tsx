import { capitalize, upperCase } from 'lodash';
import * as React from 'react';
// @ts-expect-error // no declaration for this yet
import * as CoinIconsImages from 'react-coin-icon/lib/pngs';
import { Address, useAccount } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import { isL2Chain } from '~/core/utils/chains';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';

import { useUserAsset } from '../../hooks/useUserAsset';
import { colors } from '../../utils/emojiAvatarBackgroundColors';
import { pseudoRandomArrayItemFromString } from '../../utils/pseudoRandomArrayItemFromString';

export function Tokens() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets } = useUserAssets(
    { address, currency },
    { select: selectUserAssetsList },
  );
  return (
    <Stack space="20px">
      {assets?.map((asset, i) => (
        <AssetRow key={`${asset?.uniqueId}-${i}`} uniqueId={asset?.uniqueId} />
      ))}
    </Stack>
  );
}

type AssetRowProps = {
  uniqueId: UniqueId;
};

function AssetRow({ uniqueId }: AssetRowProps) {
  const [showImage, setShowImage] = React.useState(true);
  const asset = useUserAsset(uniqueId);

  const priceChange = asset?.native?.price?.change;
  const priceChangeDisplay = priceChange?.length ? priceChange : '-';
  const priceChangeColor =
    priceChangeDisplay[0] !== '-' ? 'green' : 'labelTertiary';

  const address = asset?.address;
  const balanceDisplay = asset?.balance?.display;
  const chain = asset?.chainName || ChainName.mainnet;
  const mainnetAddress = asset?.mainnetAddress;
  const name = asset?.name;
  const nativeBalanceDisplay = asset?.native?.balance?.display;
  const symbol = asset?.symbol;

  const localImage = CoinIconsImages[capitalize(symbol)];

  return (
    <Box style={{ height: '52px' }}>
      <Inset horizontal="20px" vertical="8px">
        <Box
          height="full"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Inline space="8px">
            {/* <Box
              background="fill"
              borderRadius="round"
              style={{
                width: '36px',
                height: '36px',
                overflow: 'hidden',
              }}
            >
              <CoinIcon uniqueId={uniqueId} />
              {showImage ? (
                <img
                  src={
                    localImage ??
                    getCloudinaryUrl({ address, chain, mainnetAddress })
                  }
                  width="100%"
                  height="100%"
                  onError={() => setShowImage(false)}
                />
              ) : (
                <Box height="full" alignItems="center">
                  <FallbackCoinIcon
                    address={address}
                    chain={chain}
                    mainnetAddress={mainnetAddress}
                    color={pseudoRandomArrayItemFromString<string>(
                      address || '',
                      colors,
                    )}
                    height={36}
                    symbol={symbol || ''}
                    width={36}
                  />
                </Box>
              )}
            </Box> */}
            <Box display="flex" style={{ alignItems: 'center' }}>
              <Stack space="8px">
                <Text size="14pt" weight="semibold">
                  {name}
                </Text>
                <Text color="labelTertiary" size="12pt" weight="semibold">
                  {nativeBalanceDisplay}
                </Text>
              </Stack>
            </Box>
          </Inline>
          <Box display="flex" style={{ alignItems: 'center' }}>
            <Stack space="8px">
              <Text size="14pt" weight="semibold">
                {balanceDisplay}
              </Text>
              <Text
                color={priceChangeColor}
                size="12pt"
                weight="semibold"
                align="right"
              >
                {priceChangeDisplay}
              </Text>
            </Stack>
          </Box>
        </Box>
      </Inset>
    </Box>
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

const ImageState = {
  ERROR: 'ERROR',
  LOADED: 'LOADED',
} as const;
const imagesCache: { [imageUrl: string]: keyof typeof ImageState } = {};

function FallbackCoinIcon({
  address,
  color = '#3A3D51',
  chain,
  height,
  mainnetAddress,
  symbol = '',
  width,
}: {
  address: Address;
  chain: ChainName;
  color?: string;
  height: number;
  mainnetAddress?: Address;
  symbol: string;
  width: number;
}) {
  const imageUrl = getCloudinaryUrl({ address, chain, mainnetAddress });
  const formattedSymbol = formatSymbol(symbol, width);
  const fontSize = buildFallbackFontSize(formattedSymbol, width);
  const key = `${symbol}-${imageUrl}`;
  const isLoaded = imagesCache[key] === ImageState.LOADED;
  const onLoad = React.useCallback(() => {
    if (imagesCache[key] === ImageState.LOADED) {
      return;
    }
    imagesCache[key] = ImageState.LOADED;
    // forceUpdate();
  }, [key]);
  const onError = React.useCallback(() => {
    imagesCache[key] = ImageState.ERROR;
    // forceUpdate();
  }, [key]);

  return isLoaded ? (
    <img
      src={imageUrl}
      width="100%"
      height="100%"
      onError={onError}
      onLoad={onLoad}
    />
  ) : (
    <Box
      justifyContent="center"
      flexDirection="column"
      style={{
        backgroundColor: color,
        height,
        width,
        display: 'flex',
      }}
    >
      <Text color="label" weight="bold" size={fontSize} align="center">
        {upperCase(formattedSymbol)}
      </Text>
    </Box>
  );
}

function CoinIconWrapper({ children }: { children: JSX.Element | null }) {
  return (
    <Box
      background="fill"
      borderRadius="round"
      style={{
        width: '36px',
        height: '36px',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}
function CoinIcon({ uniqueId }: { uniqueId: UniqueId }) {
  const asset = useUserAsset(uniqueId);
  const [showImage, setShowImage] = React.useState(true);
  if (!asset) return null;

  const localImage = CoinIconsImages[capitalize(asset?.symbol)];
  const { address, chainName: chain, mainnetAddress, symbol } = asset;
  const IconImage =
    localImage && showImage ? (
      <img
        src={localImage ?? getCloudinaryUrl({ address, chain, mainnetAddress })}
        width="100%"
        height="100%"
        onError={() => setShowImage(false)}
      />
    ) : null;
  const foo = (
    <FallbackCoinIcon
      address={address}
      chain={chain}
      color={pseudoRandomArrayItemFromString<string>(address || '', colors)}
      height={36}
      mainnetAddress={mainnetAddress}
      symbol={symbol}
      width={36}
    />
  );
  return (
    <CoinIconWrapper>
      <img
        src={localImage ?? getCloudinaryUrl({ address, chain, mainnetAddress })}
        width="100%"
        height="100%"
        onError={() => setShowImage(false)}
      />
    </CoinIconWrapper>
  );
}

const getCloudinaryUrl = ({
  address,
  chain,
  mainnetAddress,
}: {
  address?: Address;
  chain: ChainName;
  mainnetAddress?: Address;
}) => {
  if (!address && !mainnetAddress) return '';
  const addy = mainnetAddress ?? address;
  let network = 'ethereum';
  if (!mainnetAddress && isL2Chain(chain)) {
    network = chain;
  }
  return `https://rainbowme-res.cloudinary.com/image/upload/assets/${network}/${addy}.png`;
};
