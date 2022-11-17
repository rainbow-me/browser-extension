import React from 'react';

import { createDocs } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';

import { Box } from './Box';
import { ThemeProvider } from './ColorContext';

const themeProvider = createDocs({
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
});

export default themeProvider;
