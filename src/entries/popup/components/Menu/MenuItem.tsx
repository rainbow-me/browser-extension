import { Address } from '@wagmi/core';
import React, { useCallback, useState } from 'react';

import {
  Box,
  Column,
  Columns,
  Inline,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
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
}

const Title = ({ text, color = 'label' }: TitleProps) => (
  <TextOverflow color={color} size="14pt" weight="medium">
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
  onToggle?: () => void;
  titleComponent: React.ReactNode;
  labelComponent?: React.ReactNode;
  disabled?: boolean;
  hasChevron?: boolean;
  hasChevronDownOnly?: boolean;
  testId?: string;
  first?: boolean;
  last?: boolean;
  tabIndex?: number;
}

const MenuItem = ({
  hasRightArrow,
  onClick,
  onToggle,
  leftComponent,
  rightComponent,
  titleComponent,
  labelComponent,
  hasChevron,
  hasChevronDownOnly,
  testId,
  first,
  last,
  tabIndex,
}: MenuItemProps) => {
  const handleKeyDown = useCallback(() => {
    onClick?.();
    onToggle?.();
  }, [onClick, onToggle]);
  return (
    <Lens
      display="flex"
      forwardNav={hasRightArrow}
      onKeyDown={handleKeyDown}
      style={{
        borderRadius: 6,
        ...(first && {
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
        }),
        ...(last && {
          borderBottomRightRadius: 15,
          borderBottomLeftRadius: 15,
        }),
        height: 50,
      }}
      tabIndex={tabIndex}
    >
      <Box
        justifyContent="center"
        paddingHorizontal="16px"
        paddingVertical="16px"
        testId={testId}
        width="full"
        onClick={onClick}
        flexDirection="column"
        display="flex"
      >
        <Columns>
          <Column>
            <Inline
              alignVertical="center"
              space="16px"
              height="full"
              wrap={false}
            >
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
          </Column>
          <Column width="content">
            <Inline
              alignVertical="center"
              space="8px"
              height="full"
              wrap={false}
            >
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
              {hasChevronDownOnly && (
                <Symbol
                  symbol="chevron.down"
                  size={12}
                  color="labelTertiary"
                  weight="semibold"
                />
              )}
            </Inline>
          </Column>
        </Columns>
      </Box>
    </Lens>
  );
};

MenuItem.Label = Label;
MenuItem.Selection = Selection;
MenuItem.SelectionIcon = SelectionIcon;
MenuItem.TextIcon = TextIcon;
MenuItem.Title = Title;
MenuItem.Description = Description;
MenuItem.AccountList = AccountList;

export { MenuItem };
