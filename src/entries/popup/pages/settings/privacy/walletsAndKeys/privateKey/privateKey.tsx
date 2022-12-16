import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function PrivateKey() {
  const navigate = useNavigate();

  const [privKey] = useState(
    // dummy seed for UI
    '0xb1b3dcf4a200ab01c7aeafb8b4cda3fd03401dd2413d169846959a8f7915fd2f',
  );

  const handleSavedTheseWords = React.useCallback(async () => {
    navigate(-2);
  }, [navigate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(privKey as string);
  }, [privKey]);

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
          <Symbol symbol="key.fill" size={18} color="orange" weight={'bold'} />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t(
              'settings.privacy_and_security.wallets_and_keys.private_key.title',
            )}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t(
              'settings.privacy_and_security.wallets_and_keys.private_key.subtitle',
            )}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="24px">
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          padding="12px"
          borderColor={'transparent'}
          borderWidth={'1px'}
          style={{
            wordBreak: 'break-all',
          }}
        >
          <Text size="14pt" weight="bold">
            {privKey}
          </Text>
        </Box>
        <Box padding="12px">
          <Button
            color="accent"
            height="32px"
            variant="transparent"
            width="full"
            onClick={handleCopy}
            symbol="doc.on.doc"
          >
            {i18n.t('common_actions.copy_to_clipboard')}
          </Button>
        </Box>
      </Box>
      <Box width="full" style={{ paddingTop: 258 }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color="accent"
            height="44px"
            variant="flat"
            width="full"
            symbol="checkmark.circle.fill"
            blur="26px"
            onClick={handleSavedTheseWords}
          >
            {i18n.t(
              'settings.privacy_and_security.wallets_and_keys.private_key.saved',
            )}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
