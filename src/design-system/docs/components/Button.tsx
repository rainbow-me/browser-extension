import React, { ReactNode } from 'react';
import { Box } from '../../components/Box/Box';
import { Inline } from '../../components/Inline/Inline';
import { Text } from '../../components/Text/Text';
import { TextStyles } from '../../styles/core.css';

type ButtonColor = 'blue';
type ButtonSize = 'default' | 'small';

export type ButtonOverlayProps = {
  children: ReactNode;
  color?: ButtonColor;
  iconBefore?: React.ReactNode;
  size?: ButtonSize;
};

const sizes = {
  default: '20pt',
  small: '16pt',
} as { [key: string]: TextStyles['fontSize'] };

export const ButtonOverlay = ({
  children,
  color = 'blue',
  iconBefore,
  size = 'default',
}: ButtonOverlayProps) => (
  <Text color={color} size={sizes[size]} weight="semibold">
    <Inline alignVertical="center" space="6px">
      {iconBefore && (
        <Box
          style={{
            display: 'flex',
            height: '0.75em',
            width: '0.75em',
          }}
        >
          {iconBefore}
        </Box>
      )}
      {children}
    </Inline>
  </Text>
);

export const Button = ({
  children,
  color,
  iconBefore,
  onClick,
  size,
}: ButtonOverlayProps & {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <Box as="button" onClick={onClick} type="button">
    <ButtonOverlay color={color} iconBefore={iconBefore} size={size}>
      {children}
    </ButtonOverlay>
  </Box>
);
