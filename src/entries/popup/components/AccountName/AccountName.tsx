/* eslint-disable react/jsx-props-no-spreading */
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';

import { Box, Column, Columns, Symbol, TextOverflow } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { transformScales } from '~/design-system/styles/designTokens';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';
import { tabIndexes } from '../../utils/tabIndexes';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

type AccountNameProps = {
  includeAvatar?: boolean;
  id?: string;
  size?: '16pt' | '20pt';
  chevron?: boolean;
  navigateToWalletSwitcher?: boolean;
  disableNav?: boolean;
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
  navigateToWalletSwitcher = true,
  disableNav = false,
}: AccountNameProps) {
  const { address } = useAccount();
  const { displayName } = useWalletName({ address: address || '0x' });
  const navigate = useRainbowNavigate();
  const [hover, setHover] = useState(false);

  const handleClick = useCallback(() => {
    navigateToWalletSwitcher ? navigate(ROUTES.WALLET_SWITCHER) : null;
  }, [navigate, navigateToWalletSwitcher]);

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
        includeAvatar && !disableNav
          ? -1
          : tabIndexes.WALLET_HEADER_ACCOUNT_NAME
      }
      onKeyDown={handleClick}
      borderRadius="6px"
      style={{ padding: includeAvatar ? 0 : 2 }}
    >
      <Box
        as={motion.div}
        id={`${id ?? ''}-account-name-shuffle`}
        onClick={handleClick}
        padding="4px"
        {...chevronProps}
      >
        <Columns alignVertical="center" space="4px">
          {includeAvatar && address && (
            <Column width="content">
              <Box
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                paddingRight="2px"
              >
                <WalletAvatar address={address} size={16} emojiSize="10pt" />
              </Box>
            </Column>
          )}
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
