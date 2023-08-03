import React from 'react';
import { Address } from 'wagmi';

import appConnectionWalletItemImageMask from 'static/assets/appConnectionWalletItemImageMask.svg';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import {
  Bleed,
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
import { ChainBadge } from '../ChainBadge/ChainBadge';
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
  chainId,
}: {
  account: Address;
  onClick?: () => void;
  chainId: ChainId;
}) {
  const { displayName } = useWalletName({ address: account });
  const showChainBadge = !!chainId && chainId !== ChainId.mainnet;

  return (
    <Lens
      handleOpenMenu={onClick}
      key={account}
      onClick={onClick}
      paddingHorizontal="12px"
      paddingVertical="8px"
      borderRadius="12px"
    >
      <Columns space="8px" alignVertical="center" alignHorizontal="justify">
        <Column width="content">
          <WalletAvatar
            mask={showChainBadge ? appConnectionWalletItemImageMask : null}
            address={account}
            size={36}
            emojiSize="20pt"
            background="transparent"
          />
          {showChainBadge ? (
            <Box
              style={{
                marginLeft: '-7px',
                marginTop: '-10.5px',
              }}
            >
              <Box
                style={{
                  height: 14,
                  width: 14,
                  borderRadius: 7,
                }}
              >
                <Inline
                  alignHorizontal="center"
                  alignVertical="center"
                  height="full"
                >
                  <Bleed top="7px">
                    <ChainBadge chainId={chainId} size="14" />
                  </Bleed>
                </Inline>
              </Box>
            </Box>
          ) : null}
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
                  {ChainNameDisplay[chainId]}
                </TextOverflow>
              </Inline>
            </Rows>
          </Box>
        </Column>
        <Column width="content">
          <Bleed horizontal="8px">
            <MoreInfoButton
              variant="transparent"
              options={InfoButtonOptions()}
            />
          </Bleed>
        </Column>
      </Columns>
    </Lens>
  );
}
