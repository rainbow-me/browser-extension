import { useQuery } from '@tanstack/react-query';
import { memo, useReducer, useState } from 'react';

import { metadataClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import { queryClient } from '~/core/react-query';
import { networkStore } from '~/core/state/networks/networks';
import { AddressOrEth, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { getChain } from '~/core/utils/chains';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { formatDate } from '~/core/utils/formatDate';
import { formatCurrency } from '~/core/utils/formatNumber';
import {
  Box,
  Button,
  Inline,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { TextProps } from '~/design-system/components/Text/Text';
import { SymbolName } from '~/design-system/styles/designTokens';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';

import { ChartData, ChartPoint, LineChart } from './LineChart';
import { ParsedTokenInfo } from './useTokenInfo';

const parsePriceChange = (
  changePercentage: number,
): { label: string; color: TextProps['color']; symbol: SymbolName | '' } => {
  const label = Math.abs(changePercentage).toFixed(2) + ' %';

  if (changePercentage === Infinity)
    return { label: '∞ %', color: 'green', symbol: '' };

  if (changePercentage < 0)
    return { label, color: 'red', symbol: 'arrow.down' };

  if (changePercentage > 0)
    return { label, color: 'green', symbol: 'arrow.up' };

  return { label, color: 'labelSecondary', symbol: '' };
};

type PriceChange = {
  changePercentage?: number;
  date: number;
};

const PriceChange = memo(function PriceChange({
  changePercentage = 0,
  date,
}: PriceChange) {
  const { color, symbol, label } = parsePriceChange(changePercentage);
  return (
    <Box display="flex" flexDirection="column" gap="10px" alignItems="flex-end">
      <Inline alignVertical="center" space="4px">
        {symbol && (
          <Symbol color={color} size={12} symbol={symbol} weight="heavy" />
        )}
        <Text
          size="16pt"
          weight="heavy"
          color={color}
          cursor="text"
          userSelect="text"
        >
          {label}
        </Text>
      </Inline>
      <Text size="14pt" weight="heavy" color={color}>
        {formatDate(date)}
      </Text>
    </Box>
  );
});

const TokenPrice = memo(function TokenPrice({
  token,
  tokenInfo,
  hasPriceData,
  isLoading,
  fallbackPrice,
}: {
  token: ParsedUserAsset | SearchAsset;
  tokenInfo: ParsedTokenInfo;
  hasPriceData: boolean;
  isLoading: boolean;
  fallbackPrice?: number;
}) {
  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <CoinIcon asset={token} size={40} badge={false} />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="10px"
      >
        <Text size="16pt" weight="heavy" cursor="text" userSelect="text">
          {!isLoading && !hasPriceData && !fallbackPrice
            ? i18n.t('token_details.not_available')
            : formatCurrency(
                'native' in token
                  ? token.native.price?.amount || fallbackPrice
                  : tokenInfo?.price?.value || fallbackPrice,
              )}
        </Text>
        <Box style={{ maxWidth: '150px' }}>
          <TextOverflow
            color="accent"
            size="14pt"
            weight="heavy"
            testId={`token-price-name-${token.address}`}
          >
            {token.name}
          </TextOverflow>
        </Box>
      </Box>
    </Box>
  );
});

const chartTimes = ['hour', 'day', 'week', 'month', 'year'] as const;
type ChartTime = (typeof chartTimes)[number];
const getChartTimeArg = (selected: ChartTime) =>
  chartTimes.reduce(
    (args, time) => ({ ...args, [time]: time === selected }),
    {} as Record<ChartTime, boolean>,
  );

type PriceChartTimeData = { points?: [timestamp: number, price: number][] };
const fetchPriceChart = async (
  time: ChartTime,
  chainId: ChainId,
  address: AddressOrEth,
) => {
  const priceChart = await metadataClient
    .priceChart({ address, chainId, ...getChartTimeArg(time) })
    .then((d) => d.token?.priceCharts[time] as PriceChartTimeData);

  return (
    priceChart?.points?.reduce((result, point) => {
      result.push({ timestamp: point[0], price: point[1] });
      return result;
    }, [] as ChartData[]) ?? null
  );
};
type PriceChartQueryKeyArgs = {
  address: AddressOrEth;
  chainId: ChainId;
  time?: ChartTime;
};
const priceChartQueryKey = ({
  address,
  chainId,
  time,
}: PriceChartQueryKeyArgs) => ['price chart', { address, chainId, time }];
export function getPriceChartQueryCache({
  address,
  chainId,
  time,
}: PriceChartQueryKeyArgs) {
  return queryClient.getQueriesData({
    queryKey: ['price chart'],
    predicate(query) {
      const queryArgs = query.queryKey[1] as PriceChartQueryKeyArgs;
      if (queryArgs.address !== address || queryArgs.chainId !== chainId) {
        return false;
      }
      if (!time) return true;
      if (queryArgs.time === time) return true;
      return false;
    },
    exact: false,
  })[0];
}
const usePriceChart = ({
  mainnetAddress,
  address,
  chainId,
  time,
}: {
  mainnetAddress?: AddressOrEth;
  address: AddressOrEth;
  chainId: ChainId;
  time: ChartTime;
}) => {
  const supportedChains = networkStore((state) =>
    state.getSupportedChains(true),
  );
  return useQuery({
    queryFn: async () => {
      const chart = await fetchPriceChart(time, chainId, address);
      if (!chart && mainnetAddress)
        return fetchPriceChart(time, ChainId.mainnet, mainnetAddress);
      return chart || null;
    },
    queryKey: priceChartQueryKey({ address, chainId, time }),
    placeholderData: (previousData) => previousData,
    staleTime: 1 * 60 * 1000, // 1min
    enabled: !!supportedChains[chainId],
  });
};

const percentDiff = (current = 1, last = 0) =>
  ((current - last) / last) * 100 || 0;

const now = new Date();
const chartTimeToTimestamp = {
  hour: new Date().setHours(now.getHours() - 1),
  day: new Date().setHours(now.getDay() - 1),
  week: new Date().setDate(now.getDay() - 7),
  month: new Date().setMonth(now.getMonth() - 1),
  year: new Date().setFullYear(now.getFullYear() - 1),
} satisfies Record<ChartTime, number>;

const SelectChartTime = memo(function SelectChartTime({
  selectedTime,
  setSelectedTime,
}: {
  selectedTime: ChartTime;
  setSelectedTime: (time: ChartTime) => void;
}) {
  return (
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
            tabIndex={0}
          >
            {i18n.t(`token_details.${time}`)}
          </Button>
        );
      })}
    </Box>
  );
});

export function PriceChart({
  token,
  tokenInfo,
}: {
  token: ParsedUserAsset | SearchAsset;
  tokenInfo: ParsedTokenInfo;
}) {
  const [selectedTime, setSelectedTime] = useState<ChartTime>('day');
  const shouldHaveData = !getChain({ chainId: token.chainId }).testnet;

  const { data, isLoading } = usePriceChart({
    mainnetAddress: token.mainnetAddress,
    address: token.address,
    chainId: Number(token.chainId),
    time: selectedTime,
  });

  const priceAtBeginningOfSelectedTime = data?.[0]?.price;
  const tokenPriceValue = 'price' in token ? token.price?.value : undefined;
  const lastPrice =
    (data && data[data.length - 1]?.price) || tokenPriceValue || 0;

  const selectedTimePriceChange = {
    date: chartTimeToTimestamp[selectedTime],
    changePercentage:
      percentDiff(lastPrice, priceAtBeginningOfSelectedTime) || 0,
  };

  const [indicatorPointPriceChange, setIndicatorPoint] = useReducer<
    (s: PriceChange | null, point: ChartPoint | undefined) => PriceChange | null
  >((s, point) => {
    if (!point || !data) return null;
    return {
      date: point.timestamp * 1000,
      changePercentage: percentDiff(
        point.price,
        priceAtBeginningOfSelectedTime,
      ),
    };
  }, null);

  const { changePercentage, date } =
    indicatorPointPriceChange || selectedTimePriceChange;

  const hasPriceData = shouldHaveData && !!data;

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TokenPrice
          hasPriceData={hasPriceData}
          isLoading={isLoading}
          token={token}
          tokenInfo={tokenInfo}
          fallbackPrice={lastPrice}
        />
        <PriceChange changePercentage={changePercentage} date={date} />
      </Box>
      {((shouldHaveData && isLoading) || hasPriceData) && (
        <>
          <Box style={{ height: '222px' }} marginHorizontal="-20px">
            {data && (
              <LineChart
                data={data}
                onMouseMove={setIndicatorPoint}
                width={POPUP_DIMENSIONS.width}
                height={222}
                paddingY={40}
              />
            )}
          </Box>
          <SelectChartTime
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        </>
      )}
    </>
  );
}
