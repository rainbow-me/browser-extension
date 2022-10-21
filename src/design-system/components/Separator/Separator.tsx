import React from 'react';
import { strokeWeights, StrokeWeight } from '../../styles/designTokens';
import { Box } from '../Box/Box';
import * as styles from './Separator.css';

interface SeparatorProps {
  strokeWeight?: StrokeWeight;
  color?: keyof typeof styles.color;
}

export function Separator({
  color = 'separator',
  strokeWeight = '1px',
}: SeparatorProps) {
  return (
    <Box
      borderRadius="round"
      className={[styles.color[color]]}
      style={{ height: strokeWeights[strokeWeight] }}
    />
  );
}
