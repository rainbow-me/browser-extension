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
        <Box background="surfacePrimaryElevated" paddingX="20px">
          <Placeholder />
        </Box>
        <Box background="surfacePrimaryElevated" paddingY="20px">
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
  showFrame: true,
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
        <Box background="surfacePrimary" margin="-20px">
          <Placeholder />
        </Box>
        <Inset vertical="20px">
          <Box background="surfacePrimary" marginX="-20px">
            <Placeholder />
          </Box>
        </Inset>
        <Box background="surfacePrimary" marginY="-20px">
          <Placeholder />
        </Box>
        <Inset vertical="20px">
          <Box background="surfacePrimary" marginLeft="-20px">
            <Placeholder />
          </Box>
        </Inset>
        <Box background="surfacePrimary" marginRight="-20px">
          <Placeholder />
        </Box>
        <Inset vertical="20px">
          <Box background="surfacePrimary" marginTop="-20px">
            <Placeholder />
          </Box>
        </Inset>
        <Box background="surfacePrimary" marginBottom="-20px">
          <Placeholder />
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
  Example: () =>
    source(
      <Stack space="24px">
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="round"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="3px"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="6px"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="12px"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="14px"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="16px"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="20px"
          padding="32px"
        />
        <Box
          background="fillSecondary"
          borderColor="separator"
          borderWidth="1px"
          borderRadius="24px"
          padding="32px"
        />
      </Stack>,
    ),
};
