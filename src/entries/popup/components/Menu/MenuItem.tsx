import React, { useState } from 'react';
import { Address } from 'wagmi';

import {
  Box,
  Inline,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import AddressPill from '../AddressPill/AddressPill';
interface TextIconProps {
  color?: TextStyles['color'];
  icon: string;
}

const TextIcon = ({ icon, color = 'label' }: TextIconProps) => (
  <Text color={color} size="16pt" weight="semibold">
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
    <Box style={{ height: 18 }} borderRadius="round">
      <Symbol
        symbol="checkmark.circle.fill"
        color="accent"
        size={18}
        weight="medium"
      />
    </Box>
  );
};
const NUM_OF_ACCOUNTS_SHOWN_PER_WALLET = 7;

const AccountList = ({ accounts }: { accounts: Address[] }) => {
  const numberOfAccounts = accounts.length;
  const shownAccounts = accounts.slice(0, NUM_OF_ACCOUNTS_SHOWN_PER_WALLET);
  const diff = numberOfAccounts - NUM_OF_ACCOUNTS_SHOWN_PER_WALLET;
  const [showMoreAccounts, setShowMoreAccounts] = useState(false);
  const handleShowMoreAccounts = () => {
    setShowMoreAccounts(true);
  };

  return (
    <Box
      justifyContent="center"
      paddingHorizontal="16px"
      paddingVertical="16px"
      width="full"
    >
      <Inline space="6px" alignVertical="center">
        {(showMoreAccounts ? accounts : shownAccounts).map((account) => (
          <AddressPill address={account} key={account} />
        ))}
        {!showMoreAccounts && diff > 0 && (
          <Box
            paddingHorizontal="8px"
            paddingVertical="5px"
            background="fillSecondary"
            borderRadius="round"
            onClick={handleShowMoreAccounts}
          >
            <Text weight="medium" color="labelTertiary" size="14pt">
              +{diff}
            </Text>
          </Box>
        )}
      </Inline>
    </Box>
  );
};

interface TitleProps {
  color?: TextStyles['color'];
  text: string;
  maxWidth?: number;
}

const Title = ({ text, color = 'label', maxWidth }: TitleProps) => (
  <TextOverflow maxWidth={maxWidth} color={color} size="14pt" weight="medium">
    {text}
  </TextOverflow>
);

interface LabelProps {
  text: string;
}

const Label = ({ text }: LabelProps) => {
  return (
    <Text color="labelTertiary" size="12pt" weight="medium">
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
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{ height: 18 }}
    >
      <Inline alignHorizontal="justify" alignVertical="center" height="full">
        <Inline alignVertical="center" space="16px" height="full" wrap={false}>
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
        <Inline alignVertical="center" space="8px" height="full" wrap={false}>
          {rightComponent}
          {hasRightArrow && (
            <Symbol
              symbol="chevron.right"
              size={10}
              color="labelTertiary"
              weight="semibold"
            />
          )}
          {hasChevron && (
            <Symbol
              symbol="chevron.up.chevron.down"
              size={12}
              color="labelTertiary"
              weight="semibold"
            />
          )}
        </Inline>
      </Inline>
    </Box>
  </Box>
);

MenuItem.Label = Label;
MenuItem.Selection = Selection;
MenuItem.SelectionIcon = SelectionIcon;
MenuItem.TextIcon = TextIcon;
MenuItem.Title = Title;
MenuItem.Description = Description;
MenuItem.AccountList = AccountList;

export { MenuItem };
