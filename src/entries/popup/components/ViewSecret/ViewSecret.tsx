import React from 'react';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
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
    >
      <Stack alignHorizontal="center" space="24px">
        <Stack space="12px">
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
          <Box paddingHorizontal="16px">
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {subtitle}
            </Text>
          </Box>
        </Stack>
        <Box alignItems="center" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
        <Stack space="10px">
          <Box>{secret}</Box>
          <Box>
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
        </Stack>
      </Stack>

      <Box position="absolute" width="full" bottom="0" padding="20px">
        <Button
          testId={'saved-these-words-button'}
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
      </Box>
    </Box>
  );
}
