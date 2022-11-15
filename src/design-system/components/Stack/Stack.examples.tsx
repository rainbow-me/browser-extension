import React from 'react';

import { Paragraph } from '../../docs/components/Paragraph';
import { Placeholder } from '../../docs/components/Placeholder';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Inset } from '../Inset/Inset';
import { Text } from '../Text/Text';

import { Stack } from './Stack';

export const basicUsage = createExample({
  name: 'Basic usage',
  Example: () =>
    source(
      <Stack space="12px">
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </Stack>,
    ),
});

export const nested = createExample({
  name: 'Nested',
  description: (
    <Paragraph>
      Stacks can be nested within each other for layouts with differing amounts
      of space between groups of content.
    </Paragraph>
  ),
  Example: () =>
    source(
      <Inset horizontal="20px" vertical="24px">
        <Stack space="44px">
          <Stack space="12px">
            <Placeholder />
            <Placeholder />
            <Placeholder />
          </Stack>
          <Stack space="12px">
            <Placeholder />
            <Placeholder />
            <Placeholder />
          </Stack>
        </Stack>
      </Inset>,
    ),
});

export const withText = createExample({
  name: 'With text',
  Example: () =>
    source(
      <Stack space="16px">
        <Text size="20pt" weight="medium">
          Lorem ipsum
        </Text>
        <Text size="20pt" weight="medium">
          Lorem ipsum
        </Text>
        <Text size="20pt" weight="medium">
          Lorem ipsum
        </Text>
      </Stack>,
    ),
});

export const withCenterAlignment = createExample({
  name: 'With center alignment',
  Example: () =>
    source(
      <Stack alignHorizontal="center" space="20px">
        <Placeholder width={30} />
        <Placeholder width={90} />
        <Placeholder width={60} />
      </Stack>,
    ),
});
