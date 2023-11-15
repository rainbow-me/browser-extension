import { CSSProperties, PropsWithChildren, ReactNode } from 'react';

import { Box, TextOverflow } from '~/design-system';
import { TextProps } from '~/design-system/components/Text/Text';
import { globalColors } from '~/design-system/styles/designTokens';

const getTagStyles = (color: TextProps['color']) => {
  if (color === 'red') return { borderColor: globalColors.redA10 };
  if (color === 'blue') return { borderColor: globalColors.blueA10 };
  if (color === 'green') return { borderColor: globalColors.greenA10 };
};

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
      style={{ ...getTagStyles(color), ...style }}
    >
      {left}
      <TextOverflow size={size} weight="semibold" align="right" color={color}>
        {children}
      </TextOverflow>
    </Box>
  );
}
