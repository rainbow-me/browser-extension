import React from 'react';

import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';

interface TextIconProps {
  color?: TextStyles['color'];
  icon: string;
}

const TextIcon = ({ icon, color = 'label' }: TextIconProps) => (
  <Text color={color} size="18pt" weight="semibold">
    {icon}
  </Text>
);

interface SelectionProps {
  text: string;
}

const Selection = ({ text }: SelectionProps) => (
  <Text color="labelTertiary" size="14pt" weight="medium">
    {text}
  </Text>
);

const SelectionIcon = () => {
  return (
    <Symbol
      symbol="checkmark.circle.fill"
      color="accent"
      size={18}
      weight="bold"
    />
  );
};

interface TitleProps {
  color?: TextStyles['color'];
  text: string;
}

const Title = ({ text }: TitleProps) => (
  <Text color="label" size="14pt" weight="medium">
    {text}
  </Text>
);

interface LabelProps {
  text: string;
}

const Label = ({ text }: LabelProps) => {
  return (
    <Text color="labelSecondary" size="14pt" weight="medium">
      {text}
    </Text>
  );
};

interface DescriptionProps {
  text: string;
}

const Description = ({ text }: DescriptionProps) => (
  <Box
    justifyContent="center"
    paddingHorizontal="16px"
    paddingVertical="16px"
    width="full"
  >
    <Inline alignHorizontal="justify" alignVertical="center">
      <Text size="12pt" weight="medium" color="labelTertiary">
        {text}
      </Text>
    </Inline>
  </Box>
);

interface MenuItemProps {
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  hasRightArrow?: boolean;
  onClick?: () => void;
  titleComponent: React.ReactNode;
  labelComponent?: React.ReactNode;
  disabled?: boolean;
  hasChevron?: boolean;
  hasSfSymbol?: boolean;
  testId?: string;
}

const MenuItem = ({
  hasRightArrow,
  onClick,
  leftComponent,
  rightComponent,
  titleComponent,
  labelComponent,
  disabled,
  hasChevron,
  testId,
}: MenuItemProps) => (
  <Box
    justifyContent="center"
    paddingHorizontal="16px"
    paddingVertical="16px"
    testId={testId}
    width="full"
    onClick={onClick}
    style={{
      cursor: disabled ? 'default' : 'pointer',
    }}
  >
    <Inline alignHorizontal="justify" alignVertical="center">
      <Inline alignVertical="center" space="16px">
        {leftComponent && (
          <Box alignItems="center" justifyContent="center">
            {leftComponent}
          </Box>
        )}
        <Stack space="8px">
          {titleComponent}
          {labelComponent}
        </Stack>
      </Inline>
      <Inline alignVertical="center" space="8px">
        {rightComponent}
        {hasRightArrow && (
          <SFSymbol symbol="chevronRight" size={12} color="labelTertiary" />
        )}
        {hasChevron && (
          <SFSymbol
            symbol="chevronUpChevronDown"
            size={12}
            color="labelTertiary"
          />
        )}
      </Inline>
    </Inline>
  </Box>
);

MenuItem.Label = Label;
MenuItem.Selection = Selection;
MenuItem.SelectionIcon = SelectionIcon;
MenuItem.TextIcon = TextIcon;
MenuItem.Title = Title;
MenuItem.Description = Description;

export { MenuItem };
