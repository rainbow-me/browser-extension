import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useEnsAvatar } from 'wagmi';

import { Box, Inline, Symbol, Text } from '~/design-system';

import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';
import { Avatar } from '../Avatar/Avatar';

type AccountNameProps = {
  includeAvatar?: boolean;
  id?: string;
  size?: '16pt' | '20pt';
};

const chevronDownSizes = {
  '16pt': 12,
  '20pt': 16,
} as const;

export function AccountName({
  includeAvatar = false,
  size = '20pt',
  id,
}: AccountNameProps) {
  const { address } = useAccount();
  const { displayName } = useWalletName({ address: address || '0x' });
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });

  return (
    <Inline alignVertical="center" space="4px">
      <Link
        id={`${id ? `${id}-` : ''}account-name-link-to-wallet`}
        to={ROUTES.WALLET_SWITCHER}
      >
        <Inline alignVertical="center" space="4px">
          {includeAvatar && (
            <Box paddingRight="2px">
              <Avatar imageUrl={ensAvatar || ''} size={16} />
            </Box>
          )}
          <Box as="button" id={`${id ?? ''}-account-name-shuffle`}>
            <Text
              color="label"
              size={size}
              weight="heavy"
              testId="account-name"
            >
              {displayName}
            </Text>
          </Box>
          <Symbol
            size={chevronDownSizes[size]}
            symbol="chevron.down"
            color="labelTertiary"
            weight="semibold"
          />
        </Inline>
      </Link>
    </Inline>
  );
}
