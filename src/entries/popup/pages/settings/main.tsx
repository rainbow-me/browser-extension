import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

import { Language, i18n } from '~/core/languages';
import { useCurrentLanguageStore } from '~/core/state';
import { Box, Text } from '~/design-system';

export function Main() {
  const { currentLanguage, setCurrentLanguage } = useCurrentLanguageStore();
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
          onClick={() =>
            setCurrentLanguage(
              [Language.EN, Language.ES, Language.FR, Language.PR].filter(
                (lang) => lang !== currentLanguage,
              )[Math.round(Math.random() * 10) % 3],
            )
          }
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            {i18n.t('label.toggle')}
          </Text>
        </Box>
      </Box>

      <Link to="privacy">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Privacy & Security &gt;
          </Text>
        </Box>
      </Link>
      <Link to="transactions">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Transactions &gt;
          </Text>
        </Box>
      </Link>
      <Link to="currency">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Currency &gt;
          </Text>
        </Box>
      </Link>
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
