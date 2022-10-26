import { styleVariants } from '@vanilla-extract/css';

import { semanticColorVars } from './../../styles/core.css';
import { SeparatorColor, separatorColors } from './../../styles/designTokens';

const colors = Object.assign(
  {},
  ...separatorColors.map((separatorColor) => ({
    [separatorColor]: separatorColor,
  })),
) as Record<SeparatorColor, SeparatorColor>;

export const color = styleVariants(colors, (foregroundColor) => ({
  backgroundColor: semanticColorVars.foregroundColors[foregroundColor],
}));
