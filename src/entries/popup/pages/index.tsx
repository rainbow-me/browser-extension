import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text } from '~/design-system';
import { InjectToggle } from '../components/InjectToggle';
import { motion } from 'framer-motion';

export function Index() {
  return (
    <Box
      as={motion.div}
      display="flex"
      flexDirection="column"
      gap="24px"
      padding="20px"
      initial={{ opacity: 0, x: -window.innerWidth }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -window.innerWidth }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      <Text as="h1" size="20pt" weight="bold">
        Rainbow
      </Text>
      <InjectToggle />
      <Link to="settings">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Settings
          </Text>
        </Box>
      </Link>
    </Box>
  );
}
