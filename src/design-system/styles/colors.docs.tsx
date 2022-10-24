import React from 'react';

import { Box } from '../components/Box/Box';
import { ThemeProvider } from '../components/Box/ColorContext';
import { Inline } from '../components/Inline/Inline';
import { Stack } from '../components/Stack/Stack';
import { Text } from '../components/Text/Text';
import { Docs } from '../docs/types';
import source from '../docs/utils/source.macro';
import { semanticColorVars } from './core.css';
import {
  BackgroundColor,
  backgroundColors,
  ColorContext,
  ForegroundColor,
  genericColors,
  scrimColors,
  separatorColors,
  strokeColors,
  textColors,
} from './designTokens';

function BackgroundColors({ mode }: { mode: ColorContext }) {
  return (
    <Stack space="24px">
      <Text color="label" size="16pt" weight="bold">
        {mode} mode
      </Text>
      <ThemeProvider theme={mode}>
        <Box background="surfacePrimary">
          {(
            Object.keys(backgroundColors) as (keyof typeof backgroundColors)[]
          ).map((color: BackgroundColor) => (
            <Box background={color} key={color} padding="24px">
              <Text color="label" size="16pt" weight="bold">
                {color}
              </Text>
            </Box>
          ))}
        </Box>
      </ThemeProvider>
    </Stack>
  );
}

function ForegroundColors({
  colors,
  mode,
}: {
  colors: ForegroundColor[];
  mode: ColorContext;
}) {
  return (
    <Stack space="16px">
      <Text color="label" size="16pt" weight="bold">
        {mode} mode
      </Text>
      <ThemeProvider theme={mode}>
        <Box
          background="surfacePrimaryElevated"
          borderRadius="6px"
          padding="16px"
        >
          <Inline space="10px">
            {colors.map((color) => (
              <Box key={color}>
                <Stack space="6px">
                  <Box
                    borderRadius="6px"
                    style={{
                      backgroundColor:
                        semanticColorVars.foregroundColors[color],
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
        </Box>
      </ThemeProvider>
    </Stack>
  );
}

const docs: Docs = {
  name: 'Semantic colors',
  category: 'Color',
  examples: [
    {
      name: 'Background colors',
      enableCodeSnippet: false,
      enablePlayroom: false,
      Example: () =>
        source(
          <Box display="flex" style={{ gap: 8 }}>
            <Box style={{ flex: 1 }}>
              <BackgroundColors mode="light" />
            </Box>
            <Box style={{ flex: 1 }}>
              <BackgroundColors mode="dark" />
            </Box>
          </Box>,
        ),
    },
    {
      name: 'Foreground colors',
      examples: [
        {
          name: 'Color',
          enableCodeSnippet: false,
          enablePlayroom: false,
          Example: () =>
            source(
              <Stack space="24px">
                <ForegroundColors colors={genericColors} mode="dark" />
                <ForegroundColors colors={genericColors} mode="light" />
              </Stack>,
            ),
        },
        {
          name: 'Text',
          enableCodeSnippet: false,
          enablePlayroom: false,
          Example: () =>
            source(
              <Stack space="24px">
                <ForegroundColors colors={textColors} mode="dark" />
                <ForegroundColors colors={textColors} mode="light" />
              </Stack>,
            ),
        },
        {
          name: 'Scrim',
          enableCodeSnippet: false,
          enablePlayroom: false,
          Example: () =>
            source(
              <Stack space="24px">
                <ForegroundColors colors={scrimColors} mode="dark" />
                <ForegroundColors colors={scrimColors} mode="light" />
              </Stack>,
            ),
        },
        {
          name: 'Separator',
          enableCodeSnippet: false,
          enablePlayroom: false,
          Example: () =>
            source(
              <Stack space="24px">
                <ForegroundColors colors={separatorColors} mode="dark" />
                <ForegroundColors colors={separatorColors} mode="light" />
              </Stack>,
            ),
        },
        {
          name: 'Stroke',
          enableCodeSnippet: false,
          enablePlayroom: false,
          Example: () =>
            source(
              <Stack space="24px">
                <ForegroundColors colors={strokeColors} mode="dark" />
                <ForegroundColors colors={strokeColors} mode="light" />
              </Stack>,
            ),
        },
      ],
    },
  ],
};

// eslint-disable-next-line import/no-default-export
export default docs;
