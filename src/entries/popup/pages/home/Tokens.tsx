import { capitalize, upperCase } from 'lodash';
import * as React from 'react';
// @ts-expect-error // no declaration for this yet
import * as CoinIconsImages from 'react-coin-icon/lib/pngs';
import { useAccount } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { ChainName } from '~/core/types/chains';
import { isL2Chain } from '~/core/utils/chains';
import { Box, Inline, Inset, Stack, Text } from '~/design-system';

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
      {assets?.map((asset) => (
        <AssetRow
          address={asset?.address}
          mainnetAddress={asset?.mainnetAddress}
          name={asset?.name}
          chain={asset?.chainName}
          balance={asset?.native?.balance?.display}
          priceChange={asset?.native?.price?.change}
          quantity={asset?.balance?.display}
          symbol={asset?.symbol}
          key={asset?.uniqueId}
        />
      ))}
    </Stack>
  );
}

type AssetRowProps = {
  address: string;
  mainnetAddress?: string;
  name: string;
  balance: string;
  chain: ChainName;
  priceChange?: string;
  quantity: string;
  symbol: string;
};

function AssetRow({
  address,
  mainnetAddress,
  name,
  balance,
  chain,
  priceChange,
  quantity,
  symbol,
}: AssetRowProps) {
  const [showImage, setShowImage] = React.useState(true);
  const priceChangeString = priceChange?.length ? priceChange : '-';
  const priceChangeColor =
    priceChangeString[0] !== '-' ? 'green' : 'labelTertiary';
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
            <Box
              background="fill"
              borderRadius="round"
              style={{
                width: '36px',
                height: '36px',
                overflow: 'hidden',
              }}
            >
              {showImage ? (
                <img
                  src={
                    localImage ??
                    getCloudinaryUrl(address, chain, mainnetAddress)
                  }
                  width="100%"
                  height="100%"
                  onError={() => setShowImage(false)}
                />
              ) : (
                <Box height="full" alignItems="center">
                  <FallbackIcon
                    color={pseudoRandomArrayItemFromString<string>(
                      address,
                      colors,
                    )}
                    height={36}
                    symbol={symbol}
                    width={36}
                  />
                </Box>
              )}
            </Box>
            <Box display="flex" style={{ alignItems: 'center' }}>
              <Stack space="8px">
                <Text size="14pt" weight="semibold">
                  {name}
                </Text>
                <Text color="labelTertiary" size="12pt" weight="semibold">
                  {quantity}
                </Text>
              </Stack>
            </Box>
          </Inline>
          <Box display="flex" style={{ alignItems: 'center' }}>
            <Stack space="8px">
              <Text size="14pt" weight="semibold">
                {balance}
              </Text>
              <Text
                color={priceChangeColor}
                size="12pt"
                weight="semibold"
                align="right"
              >
                {priceChangeString}
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
  else if (width < 30 || symbol.length > 4) return '9pt';
  else if (symbol.length === 4) return '11pt';
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
      .substring(0, width < 30 ? 1 : 5);
  }

  return _cache[key];
}

function FallbackIcon({
  color = '#3A3D51',
  height,
  symbol = '',
  width,
}: {
  color?: string;
  height: number;
  symbol: string;
  width: number;
}) {
  const formattedSymbol = formatSymbol(symbol, width);

  const fontSize = buildFallbackFontSize(formattedSymbol, width);

  return (
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

const getCloudinaryUrl = (
  address: string,
  chain: ChainName,
  mainnetAddress?: string,
) => {
  console.log('mainnet address: ', mainnetAddress);
  const addy = mainnetAddress ?? address;
  let network = 'ethereum';
  if (!mainnetAddress && isL2Chain(chain)) {
    network = chain;
  }
  return `https://rainbowme-res.cloudinary.com/image/upload/assets/${network}/${addy}.png`;
};
