import { motion } from 'framer-motion';
import { MouseEvent, createContext, useContext, useRef, useState } from 'react';

import { formatCurrency } from '~/core/utils/formatNumber';
import {
  accentColorAsHsl,
  transparentAccentColorAsHsl,
} from '~/design-system/styles/core.css';

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
      x={overflowRight ? x - 6 : x + 6}
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
  const maxY = Math.max(...data.map((item) => item.price));
  const minY = Math.min(...data.map((item) => item.price));

  const yScale = (height - 2 * paddingY) / (maxY - minY);

  const points = data.map(({ price, timestamp }, index) => {
    const x = (index / data.length) * width;
    const y = height - paddingY - (price - minY) * yScale;
    return { price, timestamp, x, y };
  });

  const d = monotoneCubicInterpolation(points);

  const [indicator, setIndicator] = useState<Position | null>(null);

  const pathRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const svgContainer = event.currentTarget;
    const { left, width } = svgContainer.getBoundingClientRect();
    const mouseX = event.clientX - left;

    const path = pathRef.current;
    const pathRight = pathRightRef.current;
    if (!path || !pathRight) return;

    const pathLength = path.getTotalLength();
    if (!pathLength) return;

    const mousePathLength = pathLength * (mouseX / width);
    const { x, y } = path.getPointAtLength(mousePathLength);
    setIndicator({ x, y });

    pathRight.style.strokeDasharray = `${mousePathLength} ${pathLength}`;

    onMouseMove(findClosestPoint(points, x));
  };

  const onMouseLeave = () => {
    setIndicator(null);
    onMouseMove(undefined);
    if (!pathRightRef.current) return;
    pathRightRef.current.style.strokeDasharray = `0`;
  };

  return (
    <ChartContext.Provider value={{ width, height, points }}>
      <motion.svg
        viewBox={`0 0 ${width} ${height}`}
        role="presentation"
        onMouseMove={handleMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <motion.path
          ref={pathRef}
          animate={{ d }}
          fill="none"
          stroke={accentColorAsHsl}
          strokeOpacity={0.5}
          strokeWidth={3}
        />
        <motion.path
          ref={pathRightRef}
          animate={{ d }}
          fill="none"
          strokeWidth={3}
          stroke={accentColorAsHsl}
          strokeDasharray="0"
        />
        {indicator && <Indicator position={indicator} />}
      </motion.svg>
    </ChartContext.Provider>
  );
};
