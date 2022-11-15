import React from 'react';

import { Box, Inline, Stack, Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { SFSymbol } from '../SFSymbol/SFSymbol';

interface TextIconProps {
  color?: TextStyles['color'];
  icon: string;
}

const TextIcon = ({ icon, color = 'label' }: TextIconProps) => (
  <Text color={color} size="20pt" weight="semibold">
    {icon}
  </Text>
);

interface SelectionProps {
  children: React.ReactNode;
}

const Selection = ({ children }: SelectionProps) => (
  <Text color="labelSecondary" size="16pt" weight="semibold">
    {children}
  </Text>
);

interface TitleProps {
  color?: TextStyles['color'];
  text: string;
}

const Title = ({ text }: TitleProps) => (
  <Text color="labelSecondary" size="14pt" weight="semibold">
    {text}
  </Text>
);

interface LabelProps {
  text: string;
  warn?: boolean;
}

const Label = ({ text }: LabelProps) => {
  return (
    <Text color="labelSecondary" size="14pt" weight="medium">
      {text}
    </Text>
  );
};

interface MenuItemProps {
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  hasRightArrow?: boolean;
  onPress?: () => void;
  titleComponent: React.ReactNode;
  labelComponent?: React.ReactNode;
  disabled?: boolean;
  hasChevron?: boolean;
  hasSfSymbol?: boolean;
  testID?: string;
}

const MenuItem = ({
  hasRightArrow,
  onPress,
  leftComponent,
  rightComponent,
  titleComponent,
  labelComponent,
  disabled,
  hasChevron,
  testID,
}: MenuItemProps) => (
  <Box
    justifyContent="center"
    paddingHorizontal="16px"
    paddingVertical="16px"
    testId={disabled ? testID : undefined}
    width="full"
    onClick={onPress}
    style={{
      cursor: disabled ? 'default' : 'pointer',
    }}
  >
    <Inline alignHorizontal="justify" alignVertical="center">
      <Inline alignVertical="center" space="16px">
        {leftComponent && <Box alignItems="center">{leftComponent}</Box>}
        <Stack space="8px">
          {titleComponent}
          {labelComponent}
        </Stack>
      </Inline>
      <Inline alignVertical="center" space="8px">
        {rightComponent}
        {hasRightArrow && (
          <SFSymbol symbol="chevronRight" size={12} color="label" />
        )}
        {hasChevron && <SFSymbol symbol="chevronUpChevronDown" size={12} />}
      </Inline>
    </Inline>
  </Box>
);

MenuItem.Label = Label;
MenuItem.Selection = Selection;
MenuItem.TextIcon = TextIcon;
MenuItem.Title = Title;

export { MenuItem };
