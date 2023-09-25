import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { Box, Button, Inline, Symbol, TextOverflow } from '~/design-system';

import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';

export const SwapInputActionButton = ({
  asset,
  dropdownVisible,
  showClose,
  testId,
  onClose,
  onDropdownAction,
}: {
  asset: ParsedSearchAsset | null;
  dropdownVisible: boolean;
  showClose: boolean;
  testId?: string;
  onClose: () => void;
  onDropdownAction: () => void;
}) => {
  return showClose ? (
    <CursorTooltip
      align="center"
      arrowAlignment="center"
      text={i18n.t('tooltip.clear_token')}
      textWeight="bold"
      textSize="12pt"
      textColor="labelSecondary"
    >
      <Button
        color="accent"
        height="28px"
        variant="flat"
        onClick={onClose}
        testId={`${testId}-token-input-remove`}
        tabIndex={0}
      >
        <Inline
          space="8px"
          height="full"
          alignHorizontal="center"
          alignVertical="center"
        >
          <Symbol size={8} symbol="xmark" weight="bold" color="label" />
          <Box style={{ maxWidth: '75px' }}>
            <TextOverflow size="14pt" weight="bold" color="label">
              {asset?.symbol}
            </TextOverflow>
          </Box>
        </Inline>
      </Button>
    </CursorTooltip>
  ) : (
    <Box
      as={motion.div}
      animate={dropdownVisible ? { rotate: 180 } : { rotate: 0 }}
      onClick={onDropdownAction}
      testId={`${testId}-token-input-dropdown-toggle`}
    >
      <Inline alignVertical="center">
        <Symbol
          size={18}
          symbol={'chevron.down.circle'}
          weight="semibold"
          color="labelQuaternary"
        />
      </Inline>
    </Box>
  );
};
