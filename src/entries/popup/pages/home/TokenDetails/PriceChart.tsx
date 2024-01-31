import { useQuery } from '@tanstack/react-query';
import { useReducer, useState } from 'react';

import { metadataClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { AddressOrEth, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isDefaultSupportedChain, isTestnetChainId } from '~/core/utils/chains';
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

const parsePriceChange = (
  value: number,
): { color: TextProps['color']; symbol: SymbolName | '' } => {
  if (value < 0) return { color: 'red', symbol: 'arrow.down' };
  if (value > 0) return { color: 'green', symbol: 'arrow.up' };
  return { color: 'labelSecondary', symbol: '' };
};

type PriceChange = {
  changePercentage?: number;
  date: number;
};

function PriceChange({ changePercentage = 0, date }: PriceChange) {
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

function TokenPrice({
  token,
  hasPriceData,
  isLoading,
  fallbackPrice,
}: {
  token: ParsedUserAsset;
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
        <Text size="16pt" weight="heavy" cursor="text" userSelect="all">
          {!isLoading && !hasPriceData && !fallbackPrice
            ? i18n.t('token_details.not_available')
            : formatCurrency(token.native.price?.amount || fallbackPrice)}
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
  return priceChart?.points?.reduce((result, point) => {
    result.push({ timestamp: point[0], price: point[1] });
    return result;
  }, [] as ChartData[]);
};
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
  return useQuery({
    queryFn: async () => {
      const chart = await fetchPriceChart(time, chainId, address);
      if (!chart && mainnetAddress)
        return fetchPriceChart(time, ChainId.mainnet, mainnetAddress);
      return chart || null;
    },
    queryKey: createQueryKey('price chart', { address, chainId, time }),
    keepPreviousData: true,
    staleTime: 1 * 60 * 1000, // 1min
    enabled: isDefaultSupportedChain({ chainId }),
  });
};

const percentDiff = (current = 1, last = 0) =>
  ((current - last) / current) * 100;

const now = new Date();
const chartTimeToTimestamp = {
  hour: new Date().setHours(now.getHours() - 1),
  day: new Date().setHours(now.getDay() - 1),
  week: new Date().setDate(now.getDay() - 7),
  month: new Date().setMonth(now.getMonth() - 1),
  year: new Date().setFullYear(now.getFullYear() - 1),
} satisfies Record<ChartTime, number>;

export function PriceChart({ token }: { token: ParsedUserAsset }) {
  const [selectedTime, setSelectedTime] = useState<ChartTime>('day');
  const shouldHaveData = !isTestnetChainId({ chainId: token.chainId });

  const { data, isLoading } = usePriceChart({
    mainnetAddress: token.mainnetAddress,
    address: token.address,
    chainId: token.chainId,
    time: selectedTime,
  });

  const lastPrice =
    (data && data[data.length - 1]?.price) || token.price?.value;
  const selectedTimePriceChange = {
    date: chartTimeToTimestamp[selectedTime],
    changePercentage:
      percentDiff(lastPrice, data?.[0]?.price || token.price?.value) || 0,
  };

  const [indicatorPointPriceChange, setIndicatorPoint] = useReducer<
    (s: PriceChange | null, point: ChartPoint | undefined) => PriceChange | null
  >((s, point) => {
    if (!point || !data) return null;
    return {
      date: point.timestamp * 1000,
      changePercentage: percentDiff(lastPrice, point.price),
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
        </>
      )}
    </>
  );
}
