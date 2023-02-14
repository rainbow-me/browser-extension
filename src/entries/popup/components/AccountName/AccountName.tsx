import React, { useCallback } from 'react';
import { useAccount, useEnsAvatar } from 'wagmi';

import { Box, Inline, Symbol, Text } from '~/design-system';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';
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
  const navigate = useRainbowNavigate();

  const handleClick = useCallback(() => {
    navigate(ROUTES.WALLET_SWITCHER);
  }, [navigate]);

  return (
    <Box
      id={`${id ?? ''}-account-name-shuffle`}
      onClick={handleClick}
      as="button"
      tabIndex={
        includeAvatar ? undefined : tabIndexes.WALLET_HEADER_ACCOUNT_NAME
      }
      style={{
        outlineColor: accentColorAsHsl,
        borderRadius: 6,
      }}
    >
      <Inline alignVertical="center" space="4px">
        <Inline alignVertical="center" space="4px">
          {includeAvatar && (
            <Box paddingRight="2px">
              <Avatar imageUrl={ensAvatar || ''} size={16} />
            </Box>
          )}
          <Box id={`${id ?? ''}-account-name-shuffle`}>
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
      </Inline>
    </Box>
  );
}
