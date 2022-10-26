import React from 'react';
import { Box } from '../components/Box/Box';
import { Stack } from '../components/Stack/Stack';
import { Text } from '../components/Text/Text';
import { Code } from '../docs/components/Code';
import { Docs } from '../docs/types';
import source from '../docs/utils/source.macro';
import { Space, space } from './designTokens';

const spacing: Docs = {
  name: 'Spacing',
  category: 'Tokens',
  description: (
    <>
      <Text size="20pt" weight="medium">
        Spacing values can be applied to the <Code>space</Code> prop and
        directional (<Code>left</Code>, <Code>right</Code>, <Code>top</Code>,{' '}
        <Code>bottom</Code>) props on components that support space.
      </Text>
      <Text size="20pt" weight="medium">
        The <Code>Box</Code> primitive also supports these values on the{' '}
        <Code>padding</Code>, <Code>margin</Code> and <Code>gap</Code> props.
      </Text>
    </>
  ),
  examples: [
    {
      enableCodeSnippet: false,
      enablePlayroom: false,
      Example: () =>
        source(
          <Stack space="10px">
            {(Object.keys(space) as Space[]).map((space) => (
              <Stack key={space} space="4px">
                <Text size="11pt" weight="semibold">
                  {space}
                </Text>
                <Box
                  background="fill"
                  borderColor="buttonStroke"
                  borderWidth="1px"
                  style={{ width: space, height: '10px' }}
                />
              </Stack>
            ))}
          </Stack>,
        ),
    },
  ],
};

// eslint-disable-next-line import/no-default-export
export default spacing;
