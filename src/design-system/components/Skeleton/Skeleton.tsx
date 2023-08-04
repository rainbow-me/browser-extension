import { MotionProps, motion } from 'framer-motion';
import { CSSProperties } from 'react';

import { Box } from '../Box/Box';

import { skeletonCircle, skeletonLine } from './Skeleton.css';

export function Skeleton({
  height,
  width,
  circle,
  style,
  ...motionProps
}: {
  height: string;
  width: string;
  circle?: boolean;
  style?: CSSProperties;
} & MotionProps) {
  return (
    <Box
      as={motion.div}
      className={circle ? skeletonCircle : skeletonLine}
      background="fillHorizontal"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...motionProps}
      style={{ width, height, ...style }}
    />
  );
}
