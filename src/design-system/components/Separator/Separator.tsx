import { CSSProperties } from 'react';

import { StrokeWeight, strokeWeights } from '../../styles/designTokens';
import { Box } from '../Box/Box';

import * as styles from './Separator.css';

interface SeparatorProps {
  strokeWeight?: StrokeWeight;
  color?: keyof typeof styles.color;
  width?: CSSProperties['width'];
}

export function Separator({
  color = 'separator',
  strokeWeight = '1px',
  width,
}: SeparatorProps) {
  return (
    <Box
      borderRadius="round"
      className={[styles.color[color]]}
      style={{ height: strokeWeights[strokeWeight], width }}
    />
  );
}
