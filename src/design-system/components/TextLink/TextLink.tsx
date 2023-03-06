import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { TextStyles, textStyles } from '../../styles/core.css';
import { Box } from '../Box/Box';

export const TextLink = ({
  children,
  color,
  weight,
  size,
  onClick,
}: {
  children: ReactNode;
  color?: TextStyles['color'];
  weight?: TextStyles['fontWeight'];
  size?: TextStyles['fontSize'];
  onClick?: () => void;
}) => {
  const textInline = (
    <Box
      as={motion.p}
      whileHover={{ scale: transformScales['1.04'] }}
      whileTap={{ scale: transformScales['0.96'] }}
      transition={transitions.bounce}
      onClick={onClick}
      className={textStyles({
        fontFamily: 'rounded',
        color,
        fontWeight: weight,
        fontSize: size,
      })}
    >
      {children}
    </Box>
  );
  return textInline;
};
