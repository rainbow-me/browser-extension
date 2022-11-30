import React, { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentLanguageStore } from '~/core/state';
import { Box, Button, Text } from '~/design-system';

import { testSandbox } from '../../handlers/wallet';

export function Settings() {
  const { currentLanguage } = useCurrentLanguageStore();

  const testSandboxBackground = useCallback(async () => {
    console.log('asking the bg if it can leak!');
    const response = await testSandbox();
    console.log('response', response);

    alert(response);
  }, []);

  const testSandboxPopup = useCallback(async () => {
    try {
      console.log('about to leak...');
      const r = await fetch('https://api.ipify.org?format=json');
      const res = await r.json();
      console.log('response from server after leaking', res);
      alert('Popup leaked!');
    } catch (e) {
      alert('Popup sandboxed!');
    }
  }, []);

  return (
    <Box display="flex" flexDirection="column" gap="24px" padding="20px">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text size="14pt" weight="bold">
          Language: {currentLanguage}
        </Text>
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999 }}
          disabled
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            {i18n.t('label.toggle')} (disabled for now)
          </Text>
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text size="14pt" weight="bold">
          Test sandbox in popup:
        </Text>
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999 }}
          disabled
        >
          <Button
            color="accent"
            onClick={testSandboxPopup}
            height="44px"
            variant="raised"
            testId="test-sandbox-popup"
          >
            Test
          </Button>
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text size="14pt" weight="bold">
          Test sandbox in background:
        </Text>
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999 }}
          disabled
        >
          <Button
            color="accent"
            onClick={testSandboxBackground}
            height="44px"
            variant="raised"
            testId="test-sandbox-background"
          >
            Test
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
