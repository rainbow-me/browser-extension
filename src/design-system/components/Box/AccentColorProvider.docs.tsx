import React from 'react';
import source from '../../docs/utils/source.macro';
import { Docs } from '../../docs/types';
import { Text } from '../Text/Text';
import { Stack } from '../Stack/Stack';
import { AccentColorProvider } from './ColorContext';
import { Box } from './Box';

const accentColorProvider: Docs = {
  name: 'AccentColorProvider',
  category: 'Contexts',
  examples: [
    {
      Example: () =>
        source(
          <AccentColorProvider color="#FFB266">
            <Stack space="16px">
              <Box background="accent" borderRadius="round" padding="12px">
                <Text size="14pt" weight="bold" align="center">
                  Custom accent background
                </Text>
              </Box>
              <Text size="14pt" weight="bold" color="accent" align="center">
                Custom accent foreground
              </Text>
            </Stack>
          </AccentColorProvider>,
        ),
    },
  ],
};

// eslint-disable-next-line import/no-default-export
export default accentColorProvider;
