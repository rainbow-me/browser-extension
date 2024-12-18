import clsx from 'clsx';
import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Inline, Text } from '~/design-system';

import {
  accountIndexHiddenHoverSiblingStyle,
  accountIndexHiddenHoverStyle,
  accountIndexHoverContainerStyle,
} from './walletList.css';

export const AccountIndex = ({ index }: { index: number }) => {
  return (
    <Box
      borderRadius="8px"
      borderWidth="2px"
      borderColor={'separatorSecondary'}
      padding={'6px'}
      className={accountIndexHoverContainerStyle}
    >
      <Inline space="2px">
        <Box
          className={clsx([
            accountIndexHiddenHoverStyle,
            'account-index-hidden',
          ])}
        >
          <Text
            size="11pt"
            weight="bold"
            color={'labelTertiary'}
            align="center"
          >
            {i18n.t('hw.index_label')}
          </Text>
        </Box>
        <Box className={accountIndexHiddenHoverSiblingStyle}>
          <Text
            size="11pt"
            weight="bold"
            color={'labelTertiary'}
            align="center"
          >
            # {index}
          </Text>
        </Box>
      </Inline>
    </Box>
  );
};
