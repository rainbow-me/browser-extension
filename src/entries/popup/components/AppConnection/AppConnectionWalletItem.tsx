import React from 'react';
import { Address } from 'wagmi';

import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Symbol,
  TextOverflow,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { useWalletName } from '../../hooks/useWalletName';
import {
  MoreInfoButton,
  MoreInfoOption,
} from '../MoreInfoButton/MoreInfoButton';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

export enum LabelOption {
  address = 'address',
  balance = 'balance',
}

const InfoButtonOptions = () => {
  const options = [
    {
      onSelect: () => null,
      label: 'Switch Networks',
      symbol: 'network',
    },
    {
      onSelect: () => null,
      label: 'Disconnect',
      symbol: 'xmark',
      separator: true,
    },
    {
      onSelect: () => null,
      label: 'Open Uniswap',
      symbol: 'trash.fill',
    },
  ];

  return options as MoreInfoOption[];
};

export default function AppConnectionWalletItem({
  account,
  onClick,
}: {
  account: Address;
  onClick?: () => void;
}) {
  const { displayName } = useWalletName({ address: account });

  return (
    <Lens
      handleOpenMenu={onClick}
      key={account}
      onClick={onClick}
      paddingHorizontal="14px"
      paddingVertical="10px"
      borderRadius="12px"
    >
      <Columns space="8px" alignVertical="center" alignHorizontal="justify">
        <Column width="content">
          <WalletAvatar address={account} size={36} emojiSize="20pt" />
        </Column>
        <Column>
          <Box>
            <Rows space="8px" alignVertical="center">
              <Row height="content">
                <TextOverflow color="label" size="14pt" weight="semibold">
                  {displayName}
                </TextOverflow>
              </Row>
              <Inline space="4px" alignVertical="center">
                <Symbol
                  symbol="circle"
                  size={8}
                  weight="medium"
                  color="labelTertiary"
                />
                <TextOverflow color="labelQuaternary" size="12pt" weight="bold">
                  {'Polygon'}
                </TextOverflow>
              </Inline>
            </Rows>
          </Box>
        </Column>
        <Column width="content">
          <MoreInfoButton options={InfoButtonOptions()} />
        </Column>
      </Columns>
    </Lens>
  );
}
