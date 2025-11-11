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

/** Creates a horizontal SVG path at Y coordinate. */
const createHorizontalLinePath = (y: number, width: number): string => {
  return `M0,${y} L${width},${y}`;
};

/** Calculates Y-axis scale. Returns 0 when range is 0 to prevent division by zero. */
const calculateYScale = (
  minY: number,
  maxY: number,
  height: number,
  paddingY: number,
): number => {
  const range = maxY - minY;
  return range === 0 ? 0 : (height - 2 * paddingY) / range;
};

/** Maps price data to screen coordinates. */
const calculateChartPoints = (
  data: ChartData[],
  width: number,
  height: number,
  paddingY: number,
): ChartPoint[] => {
  const prices = data.map((item) => item.price);
  const maxY = Math.max(...prices);
  const minY = Math.min(...prices);
  const range = maxY - minY;
  const yScale = calculateYScale(minY, maxY, height, paddingY);

  const denominator = Math.max(data.length - 1, 1);
  return data.map(({ price, timestamp }, index) => {
    // Single point positioned at right edge
    const x = data.length === 1 ? width : (index / denominator) * width;
    // Identical prices positioned at baseline
    const scaledValue = range === 0 ? 0 : (price - minY) * yScale;
    const y = height - paddingY - scaledValue;
    return { price, timestamp, x, y };
  });
};

/** Generates SVG path: cubic interpolation for multiple points, horizontal line for single/empty. */
const createChartPath = (points: ChartPoint[], width: number): string => {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    return createHorizontalLinePath(points[0].y, width);
  }
  return monotoneCubicInterpolation(points);
};

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
    if (data.length === 0) {
      const baseline = height - paddingY;
      return {
        points: [],
        d: createHorizontalLinePath(baseline, width),
      };
    }

    const calculatedPoints = calculateChartPoints(
      data,
      width,
      height,
      paddingY,
    );

    const path = createChartPath(calculatedPoints, width);

    return { points: calculatedPoints, d: path };
  }, [data, height, paddingY, width]);

  const [indicator, setIndicator] = useState<Position | null>(null);

  const pathRef = useRef<SVGPathElement | null>(null);

  // Check if line is flat (all points have same Y) or empty
  const isFlatLine =
    points.length === 0 ||
    points.every((p) => Math.abs(p.y - points[0].y) < 0.01);

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const path = pathRef.current;
    const pathLength = path?.getTotalLength();
    if (!pathLength) return;

    // Empty data: keep baseline visible, no indicator
    if (points.length === 0) {
      setIndicator(null);
      onMouseMove(undefined);
      return;
    }

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
  // For flat lines or empty data, always keep line solid to avoid gradient issues
  const useGradient =
    !isFlatLine &&
    indicator &&
    paintedLineOffset > 0 &&
    paintedLineOffset < 100;

  // Stable stroke color for flat lines or empty data to prevent animation issues
  const strokeColor = isFlatLine
    ? accentColorAsHsl
    : useGradient
    ? 'url(#indicatorPaintedLine)'
    : accentColorAsHsl;

  return (
    <ChartContext.Provider value={{ width, height, points }}>
      <motion.svg
        viewBox={`0 0 ${width} ${height}`}
        role="presentation"
        onMouseMove={handleMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {useGradient && (
          <linearGradient id="indicatorPaintedLine" x1="0%" x2="100%">
            <stop offset="0%" stopColor={accentColorAsHsl} />
            <stop
              offset={`${paintedLineOffset}%`}
              stopColor={accentColorAsHsl}
            />
            <stop
              offset={`${paintedLineOffset}%`}
              stopColor={globalColors.blueGrey60}
            />
          </linearGradient>
        )}
        <motion.path
          ref={pathRef}
          animate={{ d }}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
        />
        {indicator && <Indicator position={indicator} />}
      </motion.svg>
    </ChartContext.Provider>
  );
};
