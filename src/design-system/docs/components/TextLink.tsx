import React, { ReactNode } from 'react';
import { Box } from '../../components/Box/Box';
import * as styles from './TextLink.css';

export const TextLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => (
  <Box
    as="a"
    className={styles.textLink}
    rel="noopener noreferrer"
    target="_blank"
    href={href}
  >
    {children}
  </Box>
);
