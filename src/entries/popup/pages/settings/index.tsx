import { motion } from 'framer-motion';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

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
    <Box
      as={motion.div}
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      initial={{ opacity: 0, x: window.innerWidth }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: window.innerWidth }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      <Text as="h1" size="20pt" weight="bold">
        Settings
      </Text>

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

      <Link to="/">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Home
          </Text>
        </Box>
      </Link>
    </Box>
  );
}
