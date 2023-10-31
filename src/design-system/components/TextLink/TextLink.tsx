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
  scale = true,
  onClick,
}: {
  children: ReactNode;
  color?: TextStyles['color'];
  weight?: TextStyles['fontWeight'];
  size?: TextStyles['fontSize'];
  scale?: boolean;
  onClick?: () => void;
}) => (
  <Box
    as={motion.div}
    style={{ display: 'inline-flex' }}
    whileHover={{ scale: scale ? transformScales['1.04'] : undefined }}
    whileTap={{ scale: scale ? transformScales['0.96'] : undefined }}
    transition={transitions.bounce}
    onClick={onClick}
    className={textStyles({
      color,
      fontWeight: weight,
      fontFamily: 'rounded',
      fontSize: size,
    })}
  >
    {children}
  </Box>
);
