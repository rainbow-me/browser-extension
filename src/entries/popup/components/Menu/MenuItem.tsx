import React, { useState } from 'react';

import { DummyAccount } from '~/core/types/walletsAndKeys';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
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
    <Symbol
      symbol="checkmark.circle.fill"
      color="accent"
      size={18}
      weight="regular"
    />
  );
};
const NUM_OF_ACCOUNTS_SHOWN_PER_ACCOUNT = 7;

const AccountList = ({ accounts }: { accounts: DummyAccount[] }) => {
  const numberOfAccounts = accounts.length;
  const shownAccounts = accounts.slice(0, NUM_OF_ACCOUNTS_SHOWN_PER_ACCOUNT);
  const diff = numberOfAccounts - NUM_OF_ACCOUNTS_SHOWN_PER_ACCOUNT;
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
        {(showMoreAccounts ? accounts : shownAccounts).map((wallet) => (
          <AddressPill
            address={wallet.address}
            ens={wallet.ens}
            key={wallet.address}
          />
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
}

const Title = ({ text, color = 'label' }: TitleProps) => (
  <Text color={color} size="14pt" weight="medium">
    {text}
  </Text>
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
);

MenuItem.Label = Label;
MenuItem.Selection = Selection;
MenuItem.SelectionIcon = SelectionIcon;
MenuItem.TextIcon = TextIcon;
MenuItem.Title = Title;
MenuItem.Description = Description;
MenuItem.AccountList = AccountList;

export { MenuItem };
