import React from 'react';

import { Box } from '../components/Box/Box';
import { Inline } from '../components/Inline/Inline';
import { Stack } from '../components/Stack/Stack';
import { Text } from '../components/Text/Text';
import { Code } from '../docs/components/Code';
import { CodePreview } from '../docs/components/CodePreview';
import { Paragraph } from '../docs/components/Paragraph';
import { createDocs } from '../docs/createDocs';
import source from '../docs/utils/source.macro';
import { accentColorAsHsl, semanticColorVars } from './core.css';
import {
  BackgroundColor,
  backgroundColors,
  ForegroundColor,
  genericColors,
  scrimColors,
  separatorColors,
  shadowColors,
  strokeColors,
  textColors,
} from './designTokens';

const docs = createDocs({
  category: 'Tokens',
  name: 'Color',
  description: (
    <>
      <Paragraph>
        Color is modeled based on why something should be a certain color,
        defined with semantic names that allow them to adjust based on context.
        This makes it trivial to re-use components in different environments
        without having to manually adjust foreground colors.
      </Paragraph>
      <Paragraph>
        For example, let&apos;s assume we have the following piece of text:
      </Paragraph>
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
      <Paragraph>
        By default, this text will either be dark or light based on whether the
        app is in light mode or dark mode.
      </Paragraph>
      <Paragraph>
        Now, imagine that this text was nested inside of a dark container across
        both light and dark modes:
      </Paragraph>
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
      <Paragraph>
        Typically in this scenario we&apos;d need to alter the text color so
        that it has sufficient contrast against the background. However, when
        setting a background with <Code>Box</Code>, the color mode is
        automatically configured for nested elements based on whether the
        background is dark or light, meaning that foreground colors usually
        won&apos;t need to be changed.
      </Paragraph>
    </>
  ),
  examples: [
    {
      name: 'Background colors',
      enableCodeSnippet: false,
      enablePlayroom: false,
      showThemes: 'toggle',
      Example: () => source(<BackgroundColors />),
    },
    {
      name: 'Foreground colors',
      examples: [
        {
          name: 'Color',
          enableCodeSnippet: false,
          enablePlayroom: false,
          showThemes: true,
          Example: () => source(<ForegroundColors colors={genericColors} />),
        },
        {
          name: 'Text',
          enableCodeSnippet: false,
          enablePlayroom: false,
          showThemes: true,
          Example: () => source(<ForegroundColors colors={textColors} />),
        },
        {
          name: 'Scrim',
          enableCodeSnippet: false,
          enablePlayroom: false,
          showThemes: true,
          Example: () => source(<ForegroundColors colors={scrimColors} />),
        },
        {
          name: 'Separator',
          enableCodeSnippet: false,
          enablePlayroom: false,
          showThemes: true,
          Example: () => source(<ForegroundColors colors={separatorColors} />),
        },
        {
          name: 'Shadow',
          enableCodeSnippet: false,
          enablePlayroom: false,
          showThemes: true,
          Example: () => source(<ForegroundColors colors={shadowColors} />),
        },
        {
          name: 'Stroke',
          enableCodeSnippet: false,
          enablePlayroom: false,
          showThemes: true,
          Example: () => source(<ForegroundColors colors={strokeColors} />),
        },
      ],
    },
  ],
});

// eslint-disable-next-line import/no-default-export
export default docs;

function BackgroundColors() {
  return (
    <Box borderRadius="12px" background="surfacePrimary" padding="20px">
      <Inline alignHorizontal="center" space="20px">
        {(
          Object.keys(backgroundColors) as (keyof typeof backgroundColors)[]
        ).map((color: BackgroundColor) => (
          <Box key={color}>
            <Stack space="6px">
              <Box
                background={color}
                borderRadius="6px"
                style={{
                  width: '200px',
                  height: '60px',
                }}
              />
              <Text size="12pt" weight="semibold">
                {color}
              </Text>
            </Stack>
          </Box>
        ))}
      </Inline>
    </Box>
  );
}

function ForegroundColors({
  colors,
}: {
  colors: readonly ('accent' | ForegroundColor)[];
}) {
  return (
    <Inline space="10px">
      {colors.map((color) => (
        <Box key={color}>
          <Stack space="6px">
            <Box
              borderRadius="6px"
              style={{
                backgroundColor:
                  color === 'accent'
                    ? accentColorAsHsl
                    : semanticColorVars.foregroundColors[color],
                width: '100px',
                height: '60px',
              }}
            />
            <Text size="12pt" weight="semibold">
              {color}
            </Text>
          </Stack>
        </Box>
      ))}
    </Inline>
  );
}
