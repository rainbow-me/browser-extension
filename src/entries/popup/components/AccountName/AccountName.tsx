/* eslint-disable react/jsx-props-no-spreading */
import { motion } from 'framer-motion';
import React, { ReactNode, useCallback, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { Box, Column, Columns, Symbol, TextOverflow } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { transformScales } from '~/design-system/styles/designTokens';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletName } from '../../hooks/useWalletName';
import { ROUTES } from '../../urls';

type AccountNameProps = {
  avatar?: ReactNode;
  id?: string;
  size?: '16pt' | '20pt';
  chevron?: boolean;
  disableNav?: boolean;
  tabIndex?: number;
  renderTooltip?: (content: ReactNode) => ReactNode;
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
  tabIndex,
  renderTooltip,
}: AccountNameProps) {
  const { currentAddress: address } = useCurrentAddressStore();
  console.log('-- account name address', address);
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

  const content = (
    <Columns alignVertical="center" space="4px">
      {avatar && (
        <Column width="content">
          <Box marginRight="-6px">{avatar}</Box>
        </Column>
      )}
      <Column>
        <Lens
          tabIndex={tabIndex ?? -1}
          onKeyDown={handleClick}
          borderRadius="6px"
          style={{ padding: avatar ? 0 : 2 }}
        >
          <Box display="flex" flexDirection="row" padding="4px">
            <Box
              id={`${id ?? ''}-account-name-shuffle`}
              style={{ paddingRight: 4 }}
            >
              <TextOverflow
                color="label"
                size={size}
                weight="heavy"
                testId="account-name"
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
          </Box>
        </Lens>
      </Column>
    </Columns>
  );

  return (
    <Box
      as={motion.div}
      id={`${id ?? ''}-account-name-shuffle`}
      onClick={handleClick}
      padding="4px"
      style={{ willChange: 'transform' }}
      {...chevronProps}
    >
      {renderTooltip ? renderTooltip(content) : content}
    </Box>
  );
}
