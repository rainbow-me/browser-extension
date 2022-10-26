import React from 'react';

import { Code } from '../../docs/components/Code';
import { Placeholder } from '../../docs/components/Placeholder';
import { Example } from '../../docs/types';
import source from '../../docs/utils/source.macro';
import { Inset } from '../Inset/Inset';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { Box } from './Box';

export const background: Example = {
  name: 'Background',
  description: (
    <>
      <Text size="20pt" weight="medium">
        To apply a background color, pass the <Code>background</Code> prop. If
        this prop is provided, the foreground color compatible children (e.g.
        <Code>Text</Code>) will render a foreground color that has sufficient
        contrast with the background color of <Code>Box</Code>.
      </Text>
      <Text size="20pt" weight="medium">
        Below, you can see that the text color of <Code>surfacePrimary</Code> is
        dark, however, for <Code>accent</Code> it is light.
      </Text>
    </>
  ),
  showThemes: 'toggle',
  Example: () =>
    source(
      <>
        <Box background="surfacePrimary" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            surfacePrimary
          </Text>
        </Box>
        <Box background="surfacePrimaryElevated" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            surfacePrimaryElevated
          </Text>
        </Box>
        <Box background="surfaceSecondary" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            surfaceSecondary
          </Text>
        </Box>
        <Box background="surfaceSecondaryElevated" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            surfaceSecondaryElevated
          </Text>
        </Box>
        <Box background="fill" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            fill
          </Text>
        </Box>
        <Box background="fillSecondary" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            fillSecondary
          </Text>
        </Box>
        <Box background="accent" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            accent
          </Text>
        </Box>
        <Box background="blue" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            blue
          </Text>
        </Box>
        <Box background="green" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            green
          </Text>
        </Box>
        <Box background="red" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            red
          </Text>
        </Box>
        <Box background="purple" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            purple
          </Text>
        </Box>
        <Box background="pink" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            pink
          </Text>
        </Box>
        <Box background="orange" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            orange
          </Text>
        </Box>
        <Box background="yellow" padding="20px">
          <Text color="label" size="16pt" weight="bold">
            yellow
          </Text>
        </Box>
      </>,
    ),
};

export const padding: Example = {
  name: 'Padding',
  description: (
    <Text size="20pt" weight="medium">
      To apply padding to the bounds of Box, pass the <Code>padding</Code> prop.
      The system also supports margin a particular direction or side, as seen
      below.
    </Text>
  ),
  Example: () =>
    source(
      <Stack space="12px">
        <Box background="surfacePrimaryElevated" padding="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingHorizontal="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingVertical="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingLeft="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingRight="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingTop="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingBottom="20px">
          <Placeholder />
        </Box>
      </Stack>,
    ),
};

export const margin: Example = {
  name: 'Margin',
  description: (
    <Text size="20pt" weight="medium">
      To apply margin to the bounds of Box, pass the <Code>margin</Code> prop.
      The system also supports margin a particular direction or side, as seen
      below.
    </Text>
  ),
  Example: () =>
    source(
      <Stack space="12px">
        <Box background="surfacePrimary">
          <Box margin="-20px">
            <Placeholder />
          </Box>
        </Box>
        <Inset vertical="20px">
          <Box background="surfacePrimary">
            <Box marginHorizontal="-20px">
              <Placeholder />
            </Box>
          </Box>
        </Inset>
        <Box background="surfacePrimary">
          <Box marginVertical="-20px">
            <Placeholder />
          </Box>
        </Box>
        <Inset vertical="20px">
          <Box background="surfacePrimary">
            <Box marginLeft="-20px">
              <Placeholder />
            </Box>
          </Box>
        </Inset>
        <Box background="surfacePrimary">
          <Box marginRight="-20px">
            <Placeholder />
          </Box>
        </Box>
        <Inset top="20px">
          <Box background="surfacePrimary" paddingTop="2px">
            <Box marginTop="-20px">
              <Placeholder />
            </Box>
          </Box>
        </Inset>
        <Box background="surfacePrimary">
          <Box marginBottom="-20px">
            <Placeholder />
          </Box>
        </Box>
      </Stack>,
    ),
};

export const borderRadius: Example = {
  name: 'Border radius',
  description: (
    <Text size="20pt" weight="medium">
      To apply a border radius, supply the <Code>borderRadius</Code> prop with a
      numerical pixel value. The system also supports border radius on
      directional or specific corners as seen below.
    </Text>
  ),
  showFrame: true,
  Example: () =>
    source(
      <Inset space="16px">
        <Stack space="24px">
          <Box as={Placeholder} borderRadius="round" />
          <Box as={Placeholder} borderRadius="3px" />
          <Box as={Placeholder} borderRadius="6px" />
          <Box as={Placeholder} borderRadius="12px" />
          <Box as={Placeholder} borderRadius="14px" />
          <Box as={Placeholder} borderRadius="16px" />
          <Box as={Placeholder} borderRadius="20px" />
          <Box as={Placeholder} borderRadius="24px" />
        </Stack>
      </Inset>,
    ),
};

export const shadows: Example = {
  name: 'Shadows',
  description: (
    <Text size="20pt" weight="medium">
      To apply a shadow, a size & optional shadow color (e.g.{' '}
      <Code>30px accent</Code>) can be supplied to the <Code>boxShadow</Code>{' '}
      prop.
    </Text>
  ),
  examples: [
    {
      name: 'Sizes',
      showThemes: 'toggle',
      Example: () =>
        source(
          <Stack space="24px">
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="18px"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="24px"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="30px"
            />
          </Stack>,
        ),
    },
    {
      name: 'Colors',
      showThemes: 'toggle',
      Example: () =>
        source(
          <Stack space="24px">
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px accent"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px blue"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px green"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px orange"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px pink"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px purple"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px red"
            />
            <Box
              background="surfacePrimaryElevated"
              padding="24px"
              boxShadow="12px yellow"
            />
          </Stack>,
        ),
    },
  ],
};
