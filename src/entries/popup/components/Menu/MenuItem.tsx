import React, { useCallback, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
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
import { TextLink } from '~/design-system/components/TextLink/TextLink';
import { BoxStyles, TextStyles } from '~/design-system/styles/core.css';

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
  <Text color="labelTertiary" size="14pt" weight="semibold">
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
        weight="semibold"
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
  weight?: TextStyles['fontWeight'];
}

const Title = ({ text, color = 'label', weight = 'semibold' }: TitleProps) => (
  <TextOverflow color={color} size="14pt" weight={weight}>
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
  color?: TextStyles['color'];
  text: string;
  weight?: TextStyles['fontWeight'];
  onClickLink?: () => void;
}

const Description = ({
  color = 'labelTertiary',
  text,
  weight = 'medium',
  onClickLink,
}: DescriptionProps) => (
  <Box
    justifyContent="center"
    paddingHorizontal="16px"
    paddingVertical="16px"
    width="full"
  >
    <Inline alignHorizontal="justify" alignVertical="center">
      <Text color={color} size="12pt" weight={weight}>
        {text}
        {onClickLink && (
          <TextLink color={'blue'} onClick={onClickLink}>
            {i18n.t('link_text')}
          </TextLink>
        )}
      </Text>
    </Inline>
  </Box>
);

interface MenuItemProps {
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  hasRightArrow?: boolean;
  height?: number;
  onClick?: () => void;
  onToggle?: () => void;
  titleComponent: React.ReactNode;
  labelComponent?: React.ReactNode;
  paddingHorizontal?: BoxStyles['paddingHorizontal'];
  disabled?: boolean;
  hasChevron?: boolean;
  hasChevronDownOnly?: boolean;
  testId?: string;
  first?: boolean;
  last?: boolean;
  tabIndex?: number;
}

const MenuItem = ({
  disabled,
  hasRightArrow,
  height,
  onClick,
  onToggle,
  leftComponent,
  rightComponent,
  titleComponent,
  labelComponent,
  paddingHorizontal,
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
        height: height || 50,
      }}
      tabIndex={tabIndex}
    >
      <Box
        justifyContent="center"
        paddingHorizontal={paddingHorizontal || '16px'}
        paddingVertical="16px"
        testId={testId}
        width="full"
        onClick={onClick}
        flexDirection="column"
        display="flex"
      >
        <Columns>
          <Column>
            <Box height="full" opacity={disabled ? '0.5' : undefined}>
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
                <Stack space="7px">
                  {titleComponent}
                  {labelComponent}
                </Stack>
              </Inline>
            </Box>
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
