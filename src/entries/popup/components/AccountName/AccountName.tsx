/* eslint-disable react/jsx-props-no-spreading */
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { useAccount, useEnsAvatar } from 'wagmi';

import { Box, Inline, Symbol, TextOverflow } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { transformScales } from '~/design-system/styles/designTokens';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';
import { Avatar } from '../Avatar/Avatar';

const { innerWidth: windowWidth } = window;
const TEXT_MAX_WIDTH = windowWidth - 60;

type AccountNameProps = {
  includeAvatar?: boolean;
  id?: string;
  size?: '16pt' | '20pt';
  chevron?: boolean;
};

const chevronDownSizes = {
  '16pt': 12,
  '20pt': 16,
} as const;

export function AccountName({
  includeAvatar = false,
  size = '20pt',
  id,
  chevron = true,
}: AccountNameProps) {
  const { address } = useAccount();
  const { displayName } = useWalletName({ address: address || '0x' });
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address });
  const navigate = useRainbowNavigate();
  const [hover, setHover] = useState(false);

  const handleClick = useCallback(() => {
    navigate(ROUTES.WALLET_SWITCHER);
  }, [navigate]);

  const chevronProps = chevron
    ? {
        whileHover: { scale: transformScales['1.04'] },
        whileTap: { scale: transformScales['0.96'] },
        onHoverStart: () => setHover(true),
        onHoverEnd: () => setHover(false),
      }
    : {};

  return (
    <Lens
      tabIndex={includeAvatar ? -1 : tabIndexes.WALLET_HEADER_ACCOUNT_NAME}
      onKeyDown={handleClick}
      borderRadius="6px"
      style={{ padding: includeAvatar ? 0 : 2 }}
    >
      <Box
        as={motion.div}
        id={`${id ?? ''}-account-name-shuffle`}
        onClick={handleClick}
        tabIndex={
          includeAvatar ? undefined : tabIndexes.WALLET_HEADER_ACCOUNT_NAME
        }
        padding="4px"
        {...chevronProps}
      >
        <Inline alignVertical="center" space="4px">
          {includeAvatar && (
            <Box paddingRight="2px">
              <Avatar imageUrl={ensAvatar || ''} size={16} />
            </Box>
          )}
          <Box id={`${id ?? ''}-account-name-shuffle`}>
            <TextOverflow
              color="label"
              size={size}
              weight="heavy"
              testId="account-name"
              maxWidth={TEXT_MAX_WIDTH}
            >
              {displayName}
            </TextOverflow>
          </Box>
          {chevron && (
            <Symbol
              size={chevronDownSizes[size]}
              symbol="chevron.down"
              color={hover ? 'label' : 'labelTertiary'}
              weight="semibold"
            />
          )}
        </Inline>
      </Box>
    </Lens>
  );
}
