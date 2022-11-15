import React, { ReactNode } from 'react';
import { Text } from '../../components/Text/Text';

export const Paragraph = ({ children }: { children: ReactNode }) => (
  <Text size="20pt" weight="medium">
    {children}
  </Text>
);
