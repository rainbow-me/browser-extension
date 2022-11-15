import React from 'react';
import { Box } from '../../components/Box/Box';

import { ButtonOverlay, ButtonOverlayProps } from './Button';

type ButtonLinkProps = ButtonOverlayProps & {
  href: string;
};

export const ButtonLink = ({
  children,
  color,
  iconBefore,
  href,
  size,
}: ButtonLinkProps) => (
  <Box as="a" href={href} rel="noreferrer" target="_blank">
    <ButtonOverlay color={color} iconBefore={iconBefore} size={size}>
      {children}
    </ButtonOverlay>
  </Box>
);
