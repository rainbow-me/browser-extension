import React, { Fragment, ReactNode } from 'react';
import {
  AccentColorProvider,
  Bleed,
  Box,
  Inline,
  Inset,
  Separator,
  Stack,
  Text,
  ThemeProvider,
} from '~/design-system';

function Placeholder({
  highlight,
  width,
  height,
  children,
}: {
  highlight?: boolean;
  width?: number | string;
  height?: number | string;
  children?: ReactNode;
}) {
  return (
    <Box
      background={highlight ? 'accent' : undefined}
      style={{
        background: highlight ? undefined : 'rgba(125, 125, 125, .75)',
        width,
        height,
      }}
    >
      {children}
    </Box>
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

              <SectionHeading>Menu styles</SectionHeading>
              <Box
                padding="4px"
                background="surfaceMenu"
                borderColor="separator"
                borderRadius="16px"
                borderWidth="1px"
                backdropFilter="blur(26px)"
              >
                <Box
                  borderRadius="12px"
                  background="accent"
                  padding="12px"
                  borderWidth="1px"
                  borderColor="buttonStrokeSecondary"
                >
                  <Text size="15pt" weight="bold">
                    List Item 1
                  </Text>
                </Box>
                <Box borderRadius="12px" padding="12px">
                  <Text size="15pt" weight="bold">
                    List Item 2
                  </Text>
                </Box>
                <Inset vertical="4px" horizontal="12px">
                  <Separator color="separatorSecondary" />
                </Inset>
                <Box borderRadius="12px" padding="12px">
                  <Text size="15pt" weight="bold">
                    List Item 3
                  </Text>
                </Box>
              </Box>

              <SectionHeading>Separator - Weight</SectionHeading>
              <ExampleHeading>default</ExampleHeading>
              <Separator />
              <ExampleHeading>1px</ExampleHeading>
              <Separator strokeWeight="1px" />
              <ExampleHeading>2px</ExampleHeading>
              <Separator strokeWeight="2px" />

              <SectionHeading>Separator - Color</SectionHeading>
              <ExampleHeading>default</ExampleHeading>
              <Separator />
              <ExampleHeading>separator</ExampleHeading>
              <Separator color="separator" />
              <ExampleHeading>separatorSecondary</ExampleHeading>
              <Separator color="separatorSecondary" />
              <ExampleHeading>separatorTertiary</ExampleHeading>
              <Separator color="separatorTertiary" />

              <SectionHeading>Inset</SectionHeading>
              <ExampleHeading>Space</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>
              <ExampleHeading>Horizontal</ExampleHeading>
              <Placeholder>
                <Inset horizontal="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>
              <ExampleHeading>Vertical</ExampleHeading>
              <Placeholder>
                <Inset vertical="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>
              <ExampleHeading>Top</ExampleHeading>
              <Placeholder>
                <Inset top="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>
              <ExampleHeading>Bottom</ExampleHeading>
              <Placeholder>
                <Inset bottom="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>
              <ExampleHeading>Left</ExampleHeading>
              <Placeholder>
                <Inset left="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>
              <ExampleHeading>Right</ExampleHeading>
              <Placeholder>
                <Inset right="24px">
                  <Placeholder highlight height={24} />
                </Inset>
              </Placeholder>

              <SectionHeading>Bleed</SectionHeading>
              <ExampleHeading>Space</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed space="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>
              <ExampleHeading>Horizontal</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed horizontal="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>
              <ExampleHeading>Vertical</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed vertical="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>
              <ExampleHeading>Top</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed top="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>
              <ExampleHeading>Bottom</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed bottom="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>
              <ExampleHeading>Left</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed left="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>
              <ExampleHeading>Right</ExampleHeading>
              <Placeholder>
                <Inset space="24px">
                  <Stack space="24px">
                    <Placeholder height={24} />
                    <Bleed right="24px">
                      <Placeholder height={24} highlight />
                    </Bleed>
                    <Placeholder height={24} />
                  </Stack>
                </Inset>
              </Placeholder>

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
