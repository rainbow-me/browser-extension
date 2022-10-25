import React from 'react';
import source from '../../docs/utils/source.macro';
import { Docs } from '../../docs/types';
import { Text } from '../Text/Text';
import { Stack } from '../Stack/Stack';
import { ThemeProvider } from './ColorContext';
import { Box } from './Box';

const themeProvider: Docs = {
  name: 'ThemeProvider',
  category: 'Contexts',
  examples: [
    {
      Example: () =>
        source(
          <Stack space="16px">
            <ThemeProvider theme="dark">
              <Box
                background="surfacePrimary"
                borderRadius="6px"
                padding="20px"
              >
                <Text size="20pt" weight="bold">
                  Dark theme via ThemeProvider
                </Text>
              </Box>
            </ThemeProvider>
            <ThemeProvider theme="light">
              <Box
                background="surfacePrimary"
                borderRadius="6px"
                padding="20px"
              >
                <Text size="20pt" weight="bold">
                  Light theme via ThemeProvider
                </Text>
              </Box>
            </ThemeProvider>
          </Stack>,
        ),
    },
  ],
};

// eslint-disable-next-line import/no-default-export
export default themeProvider;
