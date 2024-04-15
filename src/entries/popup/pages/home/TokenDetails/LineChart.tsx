import { motion } from 'framer-motion';
import {
  MouseEvent,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { formatCurrency } from '~/core/utils/formatNumber';
import {
  accentColorAsHsl,
  transparentAccentColorAsHsl,
} from '~/design-system/styles/core.css';
import { globalColors } from '~/design-system/styles/designTokens';

import { monotoneCubicInterpolation } from './monotoneCubicInterpolation';

const findClosestPoint = (points: ChartPoint[], mouseX: number) => {
  if (points.length === 0) return;
  return points.reduce(
    (closest, current) =>
      Math.abs(mouseX - current.x) < Math.abs(mouseX - closest.x)
        ? current
        : closest,
    points[0],
  );
};

const IndicatorLabel = ({ x }: { x: number }) => {
  const { width, points } = useChart();
  const textLabelWidth = 60;
  const overflowRight = x + textLabelWidth > width;
  const point = findClosestPoint(points, x);
  if (!point) return null;
  return (
    <text
      y={28}
      fill={accentColorAsHsl}
      fontWeight="bold"
      fontSize="14px"
      fontFamily="SFRounded, system-ui"
      x={overflowRight ? x - 4 : x + 4}
      textAnchor={overflowRight ? 'end' : 'start'}
    >
      {formatCurrency(point.price)}
    </text>
  );
};

const Indicator = ({ position: { x, y } }: { position: Position }) => {
  const { height } = useChart();

  return (
    <>
      <rect
        x={x - 1}
        y={0}
        width="2"
        height={y}
        fill="url(#line-gradient-top)"
      />
      <rect
        x={x - 1}
        y={y}
        width="2"
        height={height - y}
        fill="url(#line-gradient-bottom)"
      />
      <defs>
        <linearGradient id="line-gradient-top" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={transparentAccentColorAsHsl}
            stopOpacity="0"
          />
          <stop offset="100%" stopColor={accentColorAsHsl} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="line-gradient-bottom" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accentColorAsHsl} stopOpacity="1" />
          <stop
            offset="100%"
            stopColor={transparentAccentColorAsHsl}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <circle cx={x} cy={y} r="16" fill={transparentAccentColorAsHsl} />
      <circle cx={x} cy={y} r="8" fill={accentColorAsHsl} />
      <IndicatorLabel x={x} />
    </>
  );
};

const ChartContext = createContext<{
  width: number;
  height: number;
  points: ChartPoint[];
} | null>(null);

const useChart = () => {
  const c = useContext(ChartContext);
  if (!c) throw new Error('useChart must be used inside a chart');
  return c;
};

export type ChartData = { timestamp: number; price: number };
type Position = { x: number; y: number };
export type ChartPoint = ChartData & Position;

export const LineChart = ({
  width,
  height,
  paddingY,
  data,
  onMouseMove,
}: {
  width: number;
  height: number;
  paddingY: number;
  data: ChartData[];
  onMouseMove: (pointData?: ChartPoint) => void;
}) => {
  const { points, d } = useMemo(() => {
    const prices = data.map((item) => item.price);
    const maxY = Math.max(...prices);
    const minY = Math.min(...prices);

    const yScale = (height - 2 * paddingY) / (maxY - minY);

    const points = data.map(({ price, timestamp }, index) => {
      const x = (index / data.length) * width;
      const y = height - paddingY - (price - minY) * yScale;
      return { price, timestamp, x, y };
    });

    const d = monotoneCubicInterpolation(points);

    return { points, d };
  }, [data, height, paddingY, width]);

  const [indicator, setIndicator] = useState<Position | null>(null);

  const pathRef = useRef<SVGPathElement>(null);

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const path = pathRef.current;
    const pathLength = path?.getTotalLength();
    if (!pathLength) return;

    const { left } = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - left;

    const point = findClosestPoint(points, mouseX);
    if (!point) return;

    setIndicator(point);
    onMouseMove(point);
  };

  const onMouseLeave = () => {
    setIndicator(null);
    onMouseMove(undefined);
  };

  const paintedLineOffset = indicator ? (indicator.x / width) * 100 : 0;

  return (
    <ChartContext.Provider value={{ width, height, points }}>
      <motion.svg
        viewBox={`0 0 ${width} ${height}`}
        role="presentation"
        onMouseMove={handleMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <linearGradient id="indicatorPaintedLine" x1="0%" x2="100%">
          <stop offset="0%" stopColor={accentColorAsHsl} />
          <stop offset={`${paintedLineOffset}%`} stopColor={accentColorAsHsl} />
          <stop
            offset={`${paintedLineOffset}%`}
            stopColor={globalColors.blueGrey60}
          />
        </linearGradient>
        <motion.path
          ref={pathRef}
          animate={{ d }}
          fill="none"
          stroke={
            paintedLineOffset ? 'url(#indicatorPaintedLine)' : accentColorAsHsl
          }
          strokeWidth={3}
        />
        {indicator && <Indicator position={indicator} />}
      </motion.svg>
    </ChartContext.Provider>
  );
};
