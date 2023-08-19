import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Address } from 'wagmi';

import { metadataClient } from '~/core/graphql';
import { i18n } from '~/core/languages';
import { createQueryKey } from '~/core/react-query';
import { ETH_ADDRESS } from '~/core/references';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
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

import { ChartData, LineChart } from './LineChart';

const parsePriceChange = (
  value: number,
): { color: TextProps['color']; symbol: SymbolName | '' } => {
  if (value < 0) return { color: 'red', symbol: 'arrow.down' };
  if (value > 0) return { color: 'green', symbol: 'arrow.up' };
  return { color: 'labelSecondary', symbol: '' };
};

function formatDate(date: number | Date) {
  const targetDate = new Date(date);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (today.toDateString() === targetDate.toDateString())
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

function TokenPrice({ token }: { token: ParsedAddressAsset }) {
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

const chartTimes = ['hour', 'day', 'week', 'month', 'year'] as const;
type ChartTime = typeof chartTimes[number];
const getChartTimeArg = (selected: ChartTime) =>
  chartTimes.reduce(
    (args, time) => ({ ...args, [time]: time === selected }),
    {} as Record<ChartTime, boolean>,
  );

type PriceChartTimeData = { points?: [timestamp: number, price: number][] };
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
        .then((d) => d.token?.priceCharts[time] as PriceChartTimeData);
      return priceChart.points?.reduce((result, point) => {
        result.push({ timestamp: point[0], price: point[1] });
        return result;
      }, [] as ChartData[]);
    },
    queryKey: createQueryKey('price chart', { address, chainId, time }),
    keepPreviousData: true,
    staleTime: 1 * 60 * 1000, // 1min
  });
};

export function PriceChart({ token }: { token: ParsedAddressAsset }) {
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
