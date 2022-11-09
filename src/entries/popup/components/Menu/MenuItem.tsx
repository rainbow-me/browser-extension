import React from 'react';

// import { ButtonPressAnimation } from '../../animations';
import { Box, Inline, Stack, Text } from '~/design-system';

import { SFSymbol } from '../SFSymbol/SFSymbol';

interface TextIconProps {
  icon: string;
  disabled?: boolean;
  isLink?: boolean;
  colorOverride?: string;
  isEmoji?: boolean;
}

const TextIcon = ({ icon }: TextIconProps) => (
  <Box>
    <Text color="label" size="16pt" weight="semibold">
      {icon}
    </Text>
  </Box>
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
  text: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  disabled?: boolean;
  isLink?: boolean;
}

const Title = ({ text, weight = 'semibold', disabled }: TitleProps) => (
  <Text
    color={disabled ? 'labelSecondary' : 'label'}
    size="14pt"
    weight={weight}
  >
    {text}
  </Text>
);

interface LabelProps {
  text: string;
  warn?: boolean;
}

const Label = ({ text, warn }: LabelProps) => {
  return (
    <Text
      color={warn ? 'orange' : 'labelSecondary'}
      size="14pt"
      weight="semibold"
    >
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
}: MenuItemProps) => {
  const Item = () => (
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
          {hasRightArrow && <SFSymbol symbol="chevronRight" size={12} />}
          {hasChevron && <SFSymbol symbol="chevronUpChevronDown" size={12} />}
        </Inline>
      </Inline>
    </Box>
  );

  return disabled ? (
    <Item />
  ) : (
    // <ButtonPressAnimation onPress={onPress} scaleTo={0.96} testID={testID}>
    <Item />
    // </ButtonPressAnimation>
  );
};

MenuItem.Label = Label;
MenuItem.Selection = Selection;
MenuItem.TextIcon = TextIcon;
MenuItem.Title = Title;

export { MenuItem };
