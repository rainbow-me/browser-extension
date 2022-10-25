import React from 'react';
import { Stack } from '../components/Stack/Stack';
import { Text } from '../components/Text/Text';

import { Docs } from '../docs/types';
import source from '../docs/utils/source.macro';

const typography: Docs = {
  name: 'Typography',
  category: 'Tokens',
  description: (
    <>
      <Text size="20pt" weight="medium">
        A major problem when trying to build a component system is that native
        text nodes contain additional space above capital letters and below the
        baseline. This is completely different to how designers think about
        typography and ends up creating a lot of extra work during development
        to fix unbalanced spacing.
      </Text>
      <Text size="20pt" weight="medium">
        To correct for this, we use a library called Capsize (with a thin
        wrapper adapting it to React Native) which applies negative margins
        above and below text nodes, ensuring that their space in the layout is
        aligned with the actual glyphs on screen.
      </Text>
    </>
  ),
  examples: [
    {
      name: 'Type Hierarchy',
      examples: [
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="32pt" weight="heavy">
                  32pt heavy
                </Text>
                <Text size="32pt" weight="bold">
                  32pt bold
                </Text>
                <Text size="32pt" weight="semibold">
                  32pt semibold
                </Text>
                <Text size="32pt" weight="medium">
                  32pt medium
                </Text>
                <Text size="32pt" weight="regular">
                  32pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="26pt" weight="heavy">
                  26pt heavy
                </Text>
                <Text size="26pt" weight="bold">
                  26pt bold
                </Text>
                <Text size="26pt" weight="semibold">
                  26pt semibold
                </Text>
                <Text size="26pt" weight="medium">
                  26pt medium
                </Text>
                <Text size="26pt" weight="regular">
                  26pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="23pt" weight="heavy">
                  23pt heavy
                </Text>
                <Text size="23pt" weight="bold">
                  23pt bold
                </Text>
                <Text size="23pt" weight="semibold">
                  23pt semibold
                </Text>
                <Text size="23pt" weight="medium">
                  23pt medium
                </Text>
                <Text size="23pt" weight="regular">
                  23pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="20pt" weight="heavy">
                  20pt heavy
                </Text>
                <Text size="20pt" weight="bold">
                  20pt bold
                </Text>
                <Text size="20pt" weight="semibold">
                  20pt semibold
                </Text>
                <Text size="20pt" weight="medium">
                  20pt medium
                </Text>
                <Text size="20pt" weight="regular">
                  20pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="20pt / 135%" weight="heavy">
                  20pt / 135% heavy
                </Text>
                <Text size="20pt / 135%" weight="bold">
                  20pt / 135% bold
                </Text>
                <Text size="20pt / 135%" weight="semibold">
                  20pt / 135% semibold
                </Text>
                <Text size="20pt / 135%" weight="medium">
                  20pt / 135% medium
                </Text>
                <Text size="20pt / 135%" weight="regular">
                  20pt / 135% regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="20pt / 150%" weight="heavy">
                  20pt / 150% heavy
                </Text>
                <Text size="20pt / 150%" weight="bold">
                  20pt / 150% bold
                </Text>
                <Text size="20pt / 150%" weight="semibold">
                  20pt / 150% semibold
                </Text>
                <Text size="20pt / 150%" weight="medium">
                  20pt / 150% medium
                </Text>
                <Text size="20pt / 150%" weight="regular">
                  20pt / 150% regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="16pt" weight="heavy">
                  16pt heavy
                </Text>
                <Text size="16pt" weight="bold">
                  16pt bold
                </Text>
                <Text size="16pt" weight="semibold">
                  16pt semibold
                </Text>
                <Text size="16pt" weight="medium">
                  16pt medium
                </Text>
                <Text size="16pt" weight="regular">
                  16pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="16pt / 135%" weight="heavy">
                  16pt / 135% heavy
                </Text>
                <Text size="16pt / 135%" weight="bold">
                  16pt / 135% bold
                </Text>
                <Text size="16pt / 135%" weight="semibold">
                  16pt / 135% semibold
                </Text>
                <Text size="16pt / 135%" weight="medium">
                  16pt / 135% medium
                </Text>
                <Text size="16pt / 135%" weight="regular">
                  16pt / 135% regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="16pt / 155%" weight="heavy">
                  16pt / 155% heavy
                </Text>
                <Text size="16pt / 155%" weight="bold">
                  16pt / 155% bold
                </Text>
                <Text size="16pt / 155%" weight="semibold">
                  16pt / 155% semibold
                </Text>
                <Text size="16pt / 155%" weight="medium">
                  16pt / 155% medium
                </Text>
                <Text size="16pt / 155%" weight="regular">
                  16pt / 155% regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="14pt" weight="heavy">
                  14pt heavy
                </Text>
                <Text size="14pt" weight="bold">
                  14pt bold
                </Text>
                <Text size="14pt" weight="semibold">
                  14pt semibold
                </Text>
                <Text size="14pt" weight="medium">
                  14pt medium
                </Text>
                <Text size="14pt" weight="regular">
                  14pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="14pt / 135%" weight="heavy">
                  14pt / 135% heavy
                </Text>
                <Text size="14pt / 135%" weight="bold">
                  14pt / 135% bold
                </Text>
                <Text size="14pt / 135%" weight="semibold">
                  14pt / 135% semibold
                </Text>
                <Text size="14pt / 135%" weight="medium">
                  14pt / 135% medium
                </Text>
                <Text size="14pt / 135%" weight="regular">
                  14pt / 135% regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="12pt" weight="heavy">
                  12pt heavy
                </Text>
                <Text size="12pt" weight="bold">
                  12pt bold
                </Text>
                <Text size="12pt" weight="semibold">
                  12pt semibold
                </Text>
                <Text size="12pt" weight="medium">
                  12pt medium
                </Text>
                <Text size="12pt" weight="regular">
                  12pt regular
                </Text>
              </Stack>,
            ),
        },
        {
          Example: () =>
            source(
              <Stack space="16px">
                <Text size="11pt" weight="heavy">
                  11pt heavy
                </Text>
                <Text size="11pt" weight="bold">
                  11pt bold
                </Text>
                <Text size="11pt" weight="semibold">
                  11pt semibold
                </Text>
                <Text size="11pt" weight="medium">
                  11pt medium
                </Text>
                <Text size="11pt" weight="regular">
                  11pt regular
                </Text>
              </Stack>,
            ),
        },
      ],
    },
  ],
};

// eslint-disable-next-line import/no-default-export
export default typography;
