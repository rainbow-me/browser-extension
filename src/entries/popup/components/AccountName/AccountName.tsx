/* eslint-disable react/jsx-props-no-spreading */
import { motion } from 'framer-motion';
import { ReactNode, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';

import { Box, Column, Columns, Symbol, TextOverflow } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { transformScales } from '~/design-system/styles/designTokens';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';

type AccountNameProps = {
  avatar?: ReactNode;
  id?: string;
  size?: '16pt' | '20pt';
  chevron?: boolean;
  disableNav?: boolean;
};

const chevronDownSizes = {
  '16pt': 12,
  '20pt': 16,
} as const;

export function AccountName({
  avatar,
  size = '20pt',
  id,
  chevron = true,
  disableNav = false,
}: AccountNameProps) {
  const { address } = useAccount();
  const { displayName } = useWalletName({ address: address || '0x' });
  const navigate = useRainbowNavigate();
  const [hover, setHover] = useState(false);

  const handleClick = useCallback(() => {
    if (!disableNav) {
      navigate(ROUTES.WALLET_SWITCHER);
    }
  }, [navigate, disableNav]);

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
      tabIndex={
        avatar || disableNav ? -1 : tabIndexes.WALLET_HEADER_ACCOUNT_NAME
      }
      onKeyDown={handleClick}
      borderRadius="6px"
      style={{ padding: avatar ? 0 : 2 }}
    >
      <Box
        as={motion.div}
        id={`${id ?? ''}-account-name-shuffle`}
        onClick={handleClick}
        padding="4px"
        {...chevronProps}
      >
        <Columns alignVertical="center" space="4px">
          {avatar && address && <Column width="content">{avatar}</Column>}
          <Column>
            <Box id={`${id ?? ''}-account-name-shuffle`}>
              <TextOverflow
                color="label"
                size={size}
                weight="heavy"
                testId="account-name"
              >
                {displayName}
              </TextOverflow>
            </Box>
          </Column>
          {chevron && (
            <Column width="content">
              <Symbol
                size={chevronDownSizes[size]}
                symbol="chevron.down"
                color={hover ? 'label' : 'labelTertiary'}
                weight="semibold"
              />
            </Column>
          )}
        </Columns>
      </Box>
    </Lens>
  );
}
