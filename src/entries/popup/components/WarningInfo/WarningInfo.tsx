import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Button, Rows, Symbol, Text } from '~/design-system';
import { SymbolName } from '~/design-system/styles/designTokens';

import {
  IconAndCopyItem,
  IconAndCopyList,
} from '../IconAndCopyList.tsx/IconAndCopyList';

interface WarningInfoProps {
  iconAndCopyList: IconAndCopyItem[];
  onProceed: () => void;
  proceedButtonLabel: string;
  proceedButtonSymbol: SymbolName;
  testId?: string;
}

export default function WarningInfo({
  iconAndCopyList,
  onProceed,
  proceedButtonLabel,
  proceedButtonSymbol,
  testId,
}: WarningInfoProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="20px"
      paddingTop="2px"
    >
      <Box
        borderRadius="round"
        boxShadow="18px accent"
        style={{
          height: 60,
          width: 60,
          overflow: 'hidden',
          position: 'absolute',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="full"
          top="0"
          left="0"
          right="0"
          bottom="0"
          position="relative"
          style={{
            background:
              'radial-gradient(100% 144.46% at 0% 50%, #FF9233 0%, #FA423C 100%)',
            zIndex: 1,
          }}
        >
          <Symbol
            symbol="exclamationmark.triangle.fill"
            size={26}
            color="label"
            weight={'bold'}
          />
        </Box>
      </Box>
      <Box
        alignItems="center"
        style={{ paddingTop: '84px', paddingBottom: '60px' }}
      >
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('common_titles.before_you_proceed')}
        </Text>
      </Box>
      <IconAndCopyList iconAndCopyList={iconAndCopyList} />
      <Box width="full" style={{ paddingTop: 76 }}>
        <Rows alignVertical="top" space="8px">
          <Button
            testId={testId}
            color="orange"
            height="44px"
            variant="flat"
            width="full"
            symbol={proceedButtonSymbol}
            blur="26px"
            onClick={onProceed}
          >
            {proceedButtonLabel}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
