import React from 'react';

import { Box } from '../components/Box/Box';
import { Text } from '../components/Text/Text';
import { Code } from '../docs/components/Code';
import { CodePreview } from '../docs/components/CodePreview';
import { Docs } from '../docs/types';
import source from '../docs/utils/source.macro';

const docs: Docs = {
  category: 'Color',
  name: 'Introduction',
  description: (
    <>
      <Text size="20pt" weight="medium">
        Color is modeled based on why something should be a certain color,
        defined with semantic names that allow them to adjust based on context.
        This makes it trivial to re-use components in different environments
        without having to manually adjust foreground colors.
      </Text>
      <Text size="20pt" weight="medium">
        For example, let&apos;s assume we have the following piece of text:
      </Text>
      <CodePreview
        Example={() =>
          source(
            <Text color="label" size="16pt" weight="bold">
              Lorem ipsum
            </Text>,
          )
        }
        disableActions
        showCode
      />
      <Text size="20pt" weight="medium">
        By default, this text will either be dark or light based on whether the
        app is in light mode or dark mode.
      </Text>
      <Text size="20pt" weight="medium">
        Now, imagine that this text was nested inside of a dark container across
        both light and dark modes:
      </Text>
      <CodePreview
        Example={() =>
          source(
            <>
              <Box background="yellow" padding="20px">
                <Text size="20pt" weight="medium">
                  Lorem ipsum
                </Text>
              </Box>
              <Box background="surfacePrimary" padding="20px">
                <Text size="20pt" weight="medium">
                  Lorem ipsum
                </Text>
              </Box>
            </>,
          )
        }
        disableActions
        showCode
      />
      <Text size="20pt" weight="medium">
        Typically in this scenario we&apos;d need to alter the text color so
        that it has sufficient contrast against the background. However, when
        setting a background with <Code>Box</Code>, the color mode is
        automatically configured for nested elements based on whether the
        background is dark or light, meaning that foreground colors usually
        won&apos;t need to be changed.
      </Text>
    </>
  ),
};

// eslint-disable-next-line import/no-default-export
export default docs;
