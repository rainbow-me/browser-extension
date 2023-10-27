import { CSSProperties, PropsWithChildren, ReactNode } from 'react';

import { Box, Text } from '~/design-system';
import { TextProps } from '~/design-system/components/Text/Text';

export function Tag({
  children,
  size = '11pt',
  color = 'labelTertiary',
  style,
  bleed,
  left,
}: PropsWithChildren<{
  size?: TextProps['size'];
  color?: TextProps['color'];
  style?: CSSProperties;
  bleed?: boolean;
  left?: ReactNode;
}>) {
  return (
    <Box
      borderColor="separatorSecondary"
      paddingHorizontal="5px"
      marginHorizontal={bleed ? '-6px' : undefined}
      paddingVertical="4px"
      marginVertical="-3px"
      borderRadius="8px"
      borderWidth="1.5px"
      display="flex"
      gap="4px"
      alignItems="center"
      style={style}
    >
      {left}
      <Text size={size} weight="semibold" align="right" color={color}>
        {children}
      </Text>
    </Box>
  );
}
