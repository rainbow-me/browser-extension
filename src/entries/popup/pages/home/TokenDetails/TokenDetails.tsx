import { useState } from 'react';
import { To, useParams } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useFavoritesStore } from '~/core/state/favorites';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedAddressAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { TextProps } from '~/design-system/components/Text/Text';
import { SymbolName } from '~/design-system/styles/designTokens';
import { Asterisks } from '~/entries/popup/components/Asterisks/Asterisks';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { ROUTES } from '~/entries/popup/urls';

import { About } from './About';
import { TokenApprovals } from './Approvals';
import { LineChart } from './LineChart';

const parsePriceChange = (
  value: number,
): { color: TextProps['color']; symbol: SymbolName | '' } => {
  if (value < 0) return { color: 'red', symbol: 'arrow.down' };
  if (value > 0) return { color: 'green', symbol: 'arrow.up' };
  return { color: 'labelSecondary', symbol: '' };
};

function formatDate(date: number | Date) {
  const currentDate = new Date();
  const targetDate = new Date(date);

  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);

  if (currentDate.toDateString() === targetDate.toDateString())
    return i18n.t('activity.today');
  if (yesterday.toDateString() === targetDate.toDateString())
    return i18n.t('activity.yesterday');

  return targetDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function PriceChange({
  changePercentage = 0,
  date,
}: {
  changePercentage?: number;
  date: Date;
}) {
  const { color, symbol } = parsePriceChange(+changePercentage.toFixed(2));
  return (
    <Box display="flex" flexDirection="column" gap="10px" alignItems="flex-end">
      <Text size="16pt" weight="heavy" color={color}>
        <Inline alignVertical="center" space="4px">
          {symbol && (
            <Symbol color={color} size={12} symbol={symbol} weight="heavy" />
          )}{' '}
          {Math.abs(changePercentage).toFixed(2)} %
        </Inline>
      </Text>
      <Text size="14pt" weight="heavy" color={color}>
        {formatDate(date)}
      </Text>
    </Box>
  );
}

const time = Date.now();
let day = 0;
const dates = Array.from({ length: 50 }).map(() =>
  // eslint-disable-next-line no-plusplus
  new Date(time - ++day * 1000 * 60 * 60 * 24).getTime(),
);

const data = dates.map((date) => ({
  date,
  price: Math.random() * (102 - 98) + 98,
}));

const chartTimeframes = ['1H', '1D', '1W', '1M', '1Y'] as const;
function Chart({ asset }: { asset: ParsedAddressAsset }) {
  const selected = chartTimeframes[1];
  const [date, setDate] = useState(new Date());
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TokenPrice token={asset} />
        <PriceChange
          changePercentage={asset.price?.relative_change_24h}
          date={date}
        />
      </Box>
      <Box>
        <Box style={{ height: '222px' }} marginHorizontal="-20px">
          <LineChart
            data={data}
            onMouseMove={(point) => {
              setDate(point ? new Date(point.date) : new Date());
            }}
            width={POPUP_DIMENSIONS.width}
            height={222}
            paddingY={40}
          />
        </Box>
        <Box display="flex" justifyContent="center" gap="12px">
          {chartTimeframes.map((timeframe) => {
            const isSelected = timeframe === selected;
            return (
              <Button
                key={timeframe}
                height="24px"
                variant={isSelected ? 'tinted' : 'transparentHover'}
                color={isSelected ? 'accent' : 'labelTertiary'}
              >
                {i18n.t(`token_details.${timeframe}`)}
              </Button>
            );
          })}
        </Box>
      </Box>
    </>
  );
}

const HiddenValue = () => <Asterisks color="labelTertiary" size={10} />;
type Amount = [value: string, symbol: string];

function BalanceValue({ balance, value }: { balance: Amount; value: Amount }) {
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const color: TextProps['color'] = hideAssetBalances
    ? 'labelTertiary'
    : 'label';

  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary">
          {i18n.t('token_details.balance')}
        </Text>
        <Text size="14pt" weight="semibold" color={color}>
          <Inline alignVertical="center">
            {hideAssetBalances ? <HiddenValue /> : balance[0]} {balance[1]}
          </Inline>
        </Text>
      </Box>
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary" align="right">
          {i18n.t('token_details.value')}
        </Text>
        <Text size="14pt" weight="semibold" color={color} align="right">
          <Inline alignVertical="center">
            {value[0]} {hideAssetBalances ? <HiddenValue /> : value[1]}
          </Inline>
        </Text>
      </Box>
    </Box>
  );
}

function SwapSend({ token }: { token: ParsedAddressAsset }) {
  const navigate = useRainbowNavigate();
  const { setSelectedToken } = useSelectedTokenStore();
  const selectTokenAndNavigate = (to: To) => {
    setSelectedToken(token);
    navigate(to);
  };
  return (
    <Box display="flex" gap="8px">
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="arrow.triangle.swap"
        onClick={() => selectTokenAndNavigate(ROUTES.SWAP)}
      >
        {i18n.t('token_details.swap')}
      </Button>
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="paperplane.fill"
        onClick={() => selectTokenAndNavigate(ROUTES.SEND)}
      >
        {i18n.t('token_details.send')}
      </Button>
    </Box>
  );
}

function NetworkBanner({
  tokenSymbol,
  chainId,
}: {
  tokenSymbol: string;
  chainId: ChainId;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      background="surfacePrimaryElevated"
      borderColor="separatorTertiary"
      borderWidth="1px"
      borderRadius="12px"
      padding="8px"
      gap="4px"
    >
      <ChainBadge chainId={chainId} size="14px" />
      <Text size="12pt" weight="semibold" color="labelSecondary">
        This {tokenSymbol} is on the {ChainNameDisplay[chainId]} network
      </Text>
      <Tooltip text="lalala" textSize="12pt">
        <Box style={{ marginLeft: 'auto', height: 14 }}>
          <Symbol
            symbol="info.circle.fill"
            color="labelTertiary"
            size={14}
            weight="semibold"
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

function TokenPrice({ token }: { token: ParsedAddressAsset }) {
  const coinIconAsset = token;
  // CoinIcon displays a ChainBadge when chainId !== mainnet
  coinIconAsset.chainId = ChainId.mainnet;
  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <CoinIcon asset={coinIconAsset} size={40} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="10px"
      >
        <Text size="16pt" weight="heavy">
          {token.native.price?.display}
        </Text>
        <Box style={{ maxWidth: '150px' }}>
          <TextOverflow
            color="accent"
            size="14pt"
            weight="heavy"
            // cursor="text"
          >
            {token.name}
          </TextOverflow>
        </Box>
      </Box>
    </Box>
  );
}

function FavoriteButton({ token }: { token: ParsedAddressAsset }) {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const isFavorite = favorites[token.chainId]?.includes(token.address);
  return (
    <ButtonSymbol
      symbol="star.fill"
      height="32px"
      variant="transparentHover"
      color={isFavorite ? 'yellow' : 'labelSecondary'}
      onClick={() => (isFavorite ? removeFavorite(token) : addFavorite(token))}
    />
  );
}

export function TokenDetails() {
  const { uniqueId } = useParams<{ uniqueId: UniqueId }>();
  const navigate = useRainbowNavigate();

  const asset = useUserAsset(uniqueId);
  if (!asset) {
    navigate(ROUTES.HOME);
    return null;
  }

  return (
    <AccentColorProviderWrapper
      color={asset.colors?.primary || asset.colors?.fallback}
    >
      <Box
        display="flex"
        flexDirection="column"
        background="surfacePrimaryElevatedSecondary"
        borderColor="separatorTertiary"
        borderWidth="1px"
        style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
      >
        <Navbar
          leftComponent={<Navbar.BackButton />}
          rightComponent={
            <Inline alignVertical="center" space="7px">
              <FavoriteButton token={asset} />
              <ButtonSymbol
                symbol="ellipsis.circle"
                height="32px"
                variant="transparentHover"
                color="labelSecondary"
              />
            </Inline>
          }
        />
        <Box padding="20px" gap="16px" display="flex" flexDirection="column">
          <Chart asset={asset} />

          <Separator color="separatorTertiary" />

          <BalanceValue
            balance={asset.balance.display.split(' ') as Amount}
            value={asset.native.balance.display.split(' ').reverse() as Amount}
          />

          <SwapSend token={asset} />

          {asset.chainId !== ChainId.mainnet && (
            <NetworkBanner tokenSymbol={asset.symbol} chainId={asset.chainId} />
          )}
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap="24px"
        paddingHorizontal="20px"
        paddingVertical="24px"
      >
        <TokenApprovals />

        <Separator color="separatorTertiary" />

        <About token={asset} />
      </Box>
    </AccentColorProviderWrapper>
  );
}
