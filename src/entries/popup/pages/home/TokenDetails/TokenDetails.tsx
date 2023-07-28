import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, To, useParams } from 'react-router-dom';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { ETH_ADDRESS } from '~/core/references';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useFavoritesStore } from '~/core/state/favorites';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedAddressAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import {
  FormattedCurrencyParts,
  formatCurrency,
  formatCurrencyParts,
} from '~/core/utils/formatNumber';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { ROUTES } from '~/entries/popup/urls';

import { About } from './About';
import { ChartData, LineChart } from './LineChart';

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

const chartTimes = ['hour', 'day', 'week', 'month', 'year'] as const;
type ChartTime = typeof chartTimes[number];
const getChartTimeArg = (selected: ChartTime) =>
  chartTimes.reduce(
    (args, time) => ({ ...args, [time]: time === selected }),
    {} as Record<ChartTime, boolean>,
  );
const usePriceChart = ({
  address,
  chainId,
  time,
}: {
  address: Address | typeof ETH_ADDRESS;
  chainId: ChainId;
  time: ChartTime;
}) => {
  return useQuery({
    queryFn: async () => {
      const priceChart = await metadataClient
        .priceChart({ address, chainId, ...getChartTimeArg(time) })
        .then((d) => d.token?.priceCharts[time]);
      const points = priceChart?.points as [timestamp: number, price: number][];
      return points.reduce((result, point) => {
        result.push({ timestamp: point[0], price: point[1] });
        return result;
      }, [] as ChartData[]);
    },
    queryKey: createQueryKey('price chart', { address, chainId, time }),
  });
};

function Chart({ token }: { token: ParsedAddressAsset }) {
  const [selectedTime, setSelectedTime] = useState<ChartTime>('day');
  const [date, setDate] = useState(new Date());

  const { data } = usePriceChart({
    address: token.address,
    chainId: token.chainId,
    time: selectedTime,
  });

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TokenPrice token={token} />
        <PriceChange
          changePercentage={token.price?.relative_change_24h}
          date={date}
        />
      </Box>
      <Box>
        <Box style={{ height: '222px' }} marginHorizontal="-20px">
          {data && (
            <LineChart
              data={data}
              onMouseMove={(point) => {
                setDate(point ? new Date(point.timestamp * 1000) : new Date());
              }}
              width={POPUP_DIMENSIONS.width}
              height={222}
              paddingY={40}
            />
          )}
        </Box>
        <Box display="flex" justifyContent="center" gap="12px">
          {chartTimes.map((time) => {
            const isSelected = time === selectedTime;
            return (
              <Button
                onClick={() => setSelectedTime(time)}
                key={time}
                height="24px"
                variant={isSelected ? 'tinted' : 'transparentHover'}
                color={isSelected ? 'accent' : 'labelTertiary'}
              >
                {i18n.t(`token_details.${time}`)}
              </Button>
            );
          })}
        </Box>
      </Box>
    </>
  );
}

const HiddenValue = () => <Asterisks color="labelTertiary" size={10} />;

function BalanceValue({
  balance,
  nativeBalance,
}: {
  balance: FormattedCurrencyParts;
  nativeBalance: FormattedCurrencyParts;
}) {
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
        <Inline alignVertical="center">
          <Text
            size="14pt"
            weight="semibold"
            color={color}
            cursor="text"
            userSelect="all"
          >
            {hideAssetBalances ? <HiddenValue /> : balance.value}{' '}
            {balance.symbol}
          </Text>
        </Inline>
      </Box>
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary" align="right">
          {i18n.t('token_details.value')}
        </Text>
        <Inline alignVertical="center">
          <Text
            size="14pt"
            weight="semibold"
            color={color}
            align="right"
            cursor="text"
            userSelect="all"
          >
            {nativeBalance.symbolAtStart && nativeBalance.symbol}{' '}
            {hideAssetBalances ? <HiddenValue /> : nativeBalance.value}{' '}
            {!nativeBalance.symbolAtStart && nativeBalance.symbol}
          </Text>
        </Inline>
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
  if (chainId === ChainId.mainnet) return null;
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
        {i18n.t('token_details.this_token_is_on_network', {
          symbol: tokenSymbol,
          chainName: ChainNameDisplay[chainId],
        })}
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
  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <CoinIcon badge={false} asset={coinIconAsset} size={40} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="10px"
      >
        <Text size="16pt" weight="heavy">
          {formatCurrency(token.native.price?.amount)}
        </Text>
        <Box style={{ maxWidth: '150px' }}>
          <TextOverflow color="accent" size="14pt" weight="heavy">
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

export const getCoingeckoUrl = ({
  address,
  mainnetAddress,
}: {
  address: Address | typeof ETH_ADDRESS;
  mainnetAddress?: Address;
}) => {
  if ([mainnetAddress, address].includes(ETH_ADDRESS))
    return `https://www.coingecko.com/en/coins/ethereum`;
  return `https://www.coingecko.com/en/coins/${mainnetAddress || address}`;
};

function MoreOptions({ token }: { token: ParsedAddressAsset }) {
  const explorer = getTokenBlockExplorer(token);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <ButtonSymbol
            symbol="ellipsis.circle"
            height="32px"
            variant="transparentHover"
            color="labelSecondary"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AccentColorProviderWrapper
          color={token.colors?.primary || token.colors?.fallback}
        >
          <DropdownMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => {
              navigator.clipboard.writeText(token.address);
              triggerToast({
                title: i18n.t('wallet_header.copy_toast'),
                description: truncateAddress(token.address),
              });
            }}
          >
            <Stack space="8px">
              <Text size="14pt" weight="semibold">
                {i18n.t('token_details.more_options.copy_address')}
              </Text>
              <Text size="11pt" color="labelTertiary" weight="medium">
                {truncateAddress(token.address)}
              </Text>
            </Stack>
          </DropdownMenuItem>
          <DropdownMenuItem
            symbolLeft="safari"
            external
            onSelect={() => window.open(getCoingeckoUrl(token), '_blank')}
          >
            CoinGecko
          </DropdownMenuItem>
          <DropdownMenuItem
            symbolLeft="binoculars.fill"
            external
            onSelect={() => window.open(explorer.url, '_blank')}
          >
            {explorer.name}
          </DropdownMenuItem>

          {/* <Separator color="separatorSecondary" />

          <DropdownMenuItem emoji="🙈">
            {i18n.t('token_details.more_options.hide')}
          </DropdownMenuItem>
          <DropdownMenuItem emoji="🆘">
            {i18n.t('token_details.more_options.report')}
          </DropdownMenuItem> */}
        </AccentColorProviderWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TokenDetails() {
  const { uniqueId } = useParams<{ uniqueId: UniqueId }>();

  const { data: token, isFetched } = useUserAsset(uniqueId);

  if (!uniqueId || (isFetched && !token)) return <Navigate to={ROUTES.HOME} />;
  if (!token) return null;

  const tokenBalance = {
    ...formatCurrencyParts(token.balance.amount),
    symbol: token.symbol,
  };
  const tokenNativeBalance = formatCurrencyParts(token.native.balance.amount);

  return (
    <AccentColorProviderWrapper
      color={token.colors?.primary || token.colors?.fallback}
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
              <FavoriteButton token={token} />
              <MoreOptions token={token} />
            </Inline>
          }
        />
        <Box padding="20px" gap="16px" display="flex" flexDirection="column">
          <Chart token={token} />

          <Separator color="separatorTertiary" />

          <BalanceValue
            balance={tokenBalance}
            nativeBalance={tokenNativeBalance}
          />

          <SwapSend token={token} />

          <NetworkBanner tokenSymbol={token.symbol} chainId={token.chainId} />
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap="24px"
        paddingHorizontal="20px"
        paddingVertical="24px"
      >
        {/* <TokenApprovals /> */}

        {/* <Separator color="separatorTertiary" /> */}

        <About token={token} />
      </Box>
    </AccentColorProviderWrapper>
  );
}
