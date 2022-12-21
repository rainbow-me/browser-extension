import React from 'react';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolName } from '~/design-system/styles/designTokens';

interface ViewSecretProps {
  titleSymbol: SymbolName;
  title: string;
  subtitle: string;
  confirmButtonLabel: string;
  confirmButtonSymbol: SymbolName;
  confirmButtonTopSpacing: number;
  onConfirm: () => void;
  onCopy: () => void;
  secret: React.ReactNode;
}

export default function ViewSecret({
  titleSymbol,
  title,
  subtitle,
  confirmButtonLabel,
  confirmButtonSymbol,
  confirmButtonTopSpacing,
  onConfirm,
  onCopy,
  secret,
}: ViewSecretProps) {
  return (
    <Box
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="20px"
      paddingTop="2px"
    >
      <Box alignItems="center" paddingBottom="6px" paddingHorizontal="12px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol={titleSymbol}
            size={18}
            color="orange"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {title}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {subtitle}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="24px">
        {secret}
        <Box padding="12px">
          <Button
            color="accent"
            height="32px"
            variant="transparent"
            width="full"
            onClick={onCopy}
            symbol="doc.on.doc"
          >
            {i18n.t('common_actions.copy_to_clipboard')}
          </Button>
        </Box>
      </Box>
      <Box width="full" style={{ marginTop: confirmButtonTopSpacing }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol={confirmButtonSymbol}
            blur="26px"
            onClick={onConfirm}
          >
            {confirmButtonLabel}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
