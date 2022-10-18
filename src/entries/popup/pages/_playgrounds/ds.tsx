import React, { Fragment } from 'react';
import {
  AccentColorProvider,
  Box,
  Inline,
  Inset,
  Stack,
  Text,
  ThemeProvider,
} from '~/design-system';

function Placeholder({ width, height }: { width?: number; height?: number }) {
  return (
    <Box style={{ background: 'rgba(125, 125, 125, .75)', width, height }} />
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <Text size="17pt" weight="bold" color="labelSecondary">
      {children}
    </Text>
  );
}

function ExampleHeading({ children }: { children: string }) {
  return (
    <Text size="15pt" weight="medium" color="labelTertiary">
      {children}
    </Text>
  );
}

export function DesignSystem() {
  return (
    <Box style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
      <Stack alignHorizontal="center">
        <Box style={{ maxWidth: '768px', width: '100%' }}>
          <Inset space="20px">
            <Stack space="24px">
              <Text as="h1" size="20pt" weight="bold">
                Design System Playground
              </Text>
              <Stack space="16px">
                <Box
                  background="accent"
                  padding="12px"
                  style={{ borderRadius: 999 }}
                >
                  <Text size="17pt" weight="bold" align="center">
                    Default accent background
                  </Text>
                </Box>
                <Text size="17pt" weight="bold" color="accent" align="center">
                  Default accent foreground
                </Text>
              </Stack>
              <AccentColorProvider color="#FFB266">
                <Stack space="16px">
                  <Box
                    background="accent"
                    padding="12px"
                    style={{ borderRadius: 999 }}
                  >
                    <Text size="17pt" weight="bold" align="center">
                      Custom accent background
                    </Text>
                  </Box>
                  <Text size="17pt" weight="bold" color="accent" align="center">
                    Custom accent foreground
                  </Text>
                </Stack>
              </AccentColorProvider>
              <Stack space="16px">
                <ThemeProvider theme="dark">
                  <Box padding="12px" background="surfacePrimary">
                    <Text
                      size="17pt"
                      weight="bold"
                      color="label"
                      align="center"
                    >
                      Dark theme via ThemeProvider
                    </Text>
                  </Box>
                </ThemeProvider>
                <ThemeProvider theme="light">
                  <Box padding="12px" background="surfacePrimary">
                    <Text
                      size="17pt"
                      weight="bold"
                      color="label"
                      align="center"
                    >
                      Light theme via ThemeProvider
                    </Text>
                  </Box>
                </ThemeProvider>
              </Stack>

              <SectionHeading>Stack - horizontal alignment</SectionHeading>
              <ExampleHeading>Default</ExampleHeading>
              <Stack space="12px">
                <Placeholder height={16} />
                <Placeholder height={16} />
                <Placeholder height={16} />
              </Stack>
              <ExampleHeading>Left</ExampleHeading>
              <Stack space="12px" alignHorizontal="left">
                <Placeholder height={16} width={16} />
                <Placeholder height={16} width={32} />
                <Placeholder height={16} width={48} />
              </Stack>
              <ExampleHeading>Center</ExampleHeading>
              <Stack space="12px" alignHorizontal="center">
                <Placeholder height={16} width={16} />
                <Placeholder height={16} width={32} />
                <Placeholder height={16} width={48} />
              </Stack>
              <ExampleHeading>Right</ExampleHeading>
              <Stack space="12px" alignHorizontal="right">
                <Placeholder height={16} width={16} />
                <Placeholder height={16} width={32} />
                <Placeholder height={16} width={48} />
              </Stack>
              <ExampleHeading>Stretch</ExampleHeading>
              <Stack space="12px" alignHorizontal="stretch">
                <Placeholder height={16} />
                <Placeholder height={16} />
                <Placeholder height={16} />
              </Stack>

              <SectionHeading>Inline - horizontal alignment</SectionHeading>
              <ExampleHeading>Default</ExampleHeading>
              <Inline space="12px">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Left</ExampleHeading>
              <Inline space="12px" alignHorizontal="left">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Center</ExampleHeading>
              <Inline space="12px" alignHorizontal="center">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Right</ExampleHeading>
              <Inline space="12px" alignHorizontal="right">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Justify</ExampleHeading>
              <Inline space="12px" alignHorizontal="justify">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>

              <SectionHeading>Inline - horizontal alignment</SectionHeading>
              <ExampleHeading>Default</ExampleHeading>
              <Inline space="12px">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Left</ExampleHeading>
              <Inline space="12px" alignHorizontal="left">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Center</ExampleHeading>
              <Inline space="12px" alignHorizontal="center">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Right</ExampleHeading>
              <Inline space="12px" alignHorizontal="right">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Justify</ExampleHeading>
              <Inline space="12px" alignHorizontal="justify">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>

              <SectionHeading>
                Inline - wrap w/ horizontal alignment
              </SectionHeading>
              <ExampleHeading>Default</ExampleHeading>
              <Inline wrap space="12px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Left</ExampleHeading>
              <Inline wrap space="12px" alignHorizontal="left">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Center</ExampleHeading>
              <Inline wrap space="12px" alignHorizontal="center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Right</ExampleHeading>
              <Inline wrap space="12px" alignHorizontal="right">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Justify</ExampleHeading>
              <Inline wrap space="12px" alignHorizontal="justify">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                    <Placeholder height={16} width={16} />
                  </Fragment>
                ))}
              </Inline>

              <SectionHeading>Inline - vertical alignment</SectionHeading>
              <ExampleHeading>Default</ExampleHeading>
              <Inline space="12px">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Top</ExampleHeading>
              <Inline space="12px" alignVertical="top">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Center</ExampleHeading>
              <Inline space="12px" alignVertical="center">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>
              <ExampleHeading>Bottom</ExampleHeading>
              <Inline space="12px" alignVertical="bottom">
                <Placeholder height={16} width={16} />
                <Placeholder height={20} width={16} />
                <Placeholder height={24} width={16} />
              </Inline>

              <SectionHeading>
                Inline - wrap w/ vertical alignment
              </SectionHeading>
              <ExampleHeading>Default</ExampleHeading>
              <Inline wrap space="12px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={20} width={16} />
                    <Placeholder height={24} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Top</ExampleHeading>
              <Inline wrap space="12px" alignVertical="top">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={20} width={16} />
                    <Placeholder height={24} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Center</ExampleHeading>
              <Inline wrap space="12px" alignVertical="center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={20} width={16} />
                    <Placeholder height={24} width={16} />
                  </Fragment>
                ))}
              </Inline>
              <ExampleHeading>Bottom</ExampleHeading>
              <Inline wrap space="12px" alignVertical="bottom">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Fragment key={i}>
                    <Placeholder height={16} width={16} />
                    <Placeholder height={20} width={16} />
                    <Placeholder height={24} width={16} />
                  </Fragment>
                ))}
              </Inline>
            </Stack>
          </Inset>
        </Box>
      </Stack>
    </Box>
  );
}
