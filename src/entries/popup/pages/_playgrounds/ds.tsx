import React from 'react';
import { AccentColorProvider, ThemeProvider, Box, Text } from '~/design-system';

export function DesignSystem() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ width: '100vw', height: '100vh' }}
    >
      <Box style={{ maxWidth: '768px', width: '100%' }}>
        <Box display="flex" flexDirection="column" gap="24px" padding="20px">
          <Text as="h1" size="20pt" weight="bold">
            Design System Playground
          </Text>
          <Box display="flex" flexDirection="column" gap="16px">
            <Box
              background="accent"
              padding="12px"
              style={{ borderRadius: 999 }}
            >
              <Text size="17pt" weight="bold" align="center">
                Default accent background
              </Text>
            </Box>
            <Text size="17pt" weight="bold" color="accent" align="center">
              Default accent foreground
            </Text>
          </Box>
          <AccentColorProvider color="#FFB266">
            <Box display="flex" flexDirection="column" gap="16px">
              <Box
                background="accent"
                padding="12px"
                style={{ borderRadius: 999 }}
              >
                <Text size="17pt" weight="bold" align="center">
                  Custom accent background
                </Text>
              </Box>
              <Text size="17pt" weight="bold" color="accent" align="center">
                Custom accent foreground
              </Text>
            </Box>
          </AccentColorProvider>
          <Box display="flex" flexDirection="column" gap="16px">
            <ThemeProvider theme="dark">
              <Box padding="12px" background="surfacePrimary">
                <Text size="17pt" weight="bold" color="label" align="center">
                  Dark theme via ThemeProvider
                </Text>
              </Box>
            </ThemeProvider>
            <ThemeProvider theme="light">
              <Box padding="12px" background="surfacePrimary">
                <Text size="17pt" weight="bold" color="label" align="center">
                  Light theme via ThemeProvider
                </Text>
              </Box>
            </ThemeProvider>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
