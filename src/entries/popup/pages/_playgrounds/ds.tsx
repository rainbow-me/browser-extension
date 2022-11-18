import React, { Fragment, ReactElement, ReactNode, cloneElement } from 'react';

import {
  AccentColorProvider,
  Bleed,
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
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
      display="flex"
      flexDirection="column"
      justifyContent="center"
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
    <Text size="14pt" weight="bold" color="label">
      {children}
    </Text>
  );
}

function ExampleHeading({ children }: { children: string }) {
  return (
    <Text size="14pt" weight="medium" color="labelSecondary">
      {children}
    </Text>
  );
}

function repeat(times: number, element: ReactElement) {
  return (
    <>
      {Array.from({ length: times }, (_, index) =>
        cloneElement(element, { key: index }),
      )}
    </>
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
                  <Text size="14pt" weight="bold" align="center">
                    Default accent background
                  </Text>
                </Box>
                <Text size="14pt" weight="bold" color="accent" align="center">
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
                    <Text size="14pt" weight="bold" align="center">
                      Custom accent background
                    </Text>
                  </Box>
                  <Text size="14pt" weight="bold" color="accent" align="center">
                    Custom accent foreground
                  </Text>
                </Stack>
              </AccentColorProvider>
              <Stack space="16px">
                <ThemeProvider theme="dark">
                  <Box padding="12px" background="surfacePrimary">
                    <Text
                      size="14pt"
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
                      size="14pt"
                      weight="bold"
                      color="label"
                      align="center"
                    >
                      Light theme via ThemeProvider
                    </Text>
                  </Box>
                </ThemeProvider>
              </Stack>

              <SectionHeading>Shadows</SectionHeading>
              {(['12px', '18px', '24px', '30px'] as const).map((shadowSize) => (
                <Box
                  key={shadowSize}
                  display="flex"
                  flexDirection="row"
                  gap="12px"
                >
                  <Box
                    boxShadow={shadowSize}
                    background="surfacePrimaryElevated"
                    padding="12px"
                    borderRadius="round"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{ flexGrow: 1, flexShrink: 1 }}
                  >
                    <Text size="14pt" weight="semibold" align="center">
                      {shadowSize}
                    </Text>
                  </Box>
                  <Box
                    boxShadow={`${shadowSize} accent`}
                    background="accent"
                    padding="12px"
                    borderRadius="round"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{ flexGrow: 1, flexShrink: 1 }}
                  >
                    <Text size="14pt" weight="semibold" align="center">
                      accent
                    </Text>
                  </Box>
                  <Box style={{ flexGrow: 1, flexShrink: 1 }}>
                    <AccentColorProvider color="#FFB266">
                      <Box
                        boxShadow={`${shadowSize} accent`}
                        background="accent"
                        padding="12px"
                        borderRadius="round"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{ flexGrow: 1, flexShrink: 1 }}
                      >
                        <Text size="14pt" weight="semibold" align="center">
                          accent
                        </Text>
                      </Box>
                    </AccentColorProvider>
                  </Box>
                  <Box
                    boxShadow={`${shadowSize} purple`}
                    background="purple"
                    padding="12px"
                    borderRadius="round"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{ flexGrow: 1, flexShrink: 1 }}
                  >
                    <Text size="14pt" weight="semibold" align="center">
                      purple
                    </Text>
                  </Box>
                </Box>
              ))}

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
                  <Text size="14pt" weight="bold">
                    List Item 1
                  </Text>
                </Box>
                <Box borderRadius="12px" padding="12px">
                  <Text size="14pt" weight="bold">
                    List Item 2
                  </Text>
                </Box>
                <Inset vertical="4px" horizontal="12px">
                  <Separator color="separatorSecondary" />
                </Inset>
                <Box borderRadius="12px" padding="12px">
                  <Text size="14pt" weight="bold">
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

              <SectionHeading>Columns - Auto width</SectionHeading>
              <ExampleHeading>default</ExampleHeading>
              <Columns space="12px">
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum.
                  </Text>
                </Placeholder>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum.
                  </Text>
                </Placeholder>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum.
                  </Text>
                </Placeholder>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum.
                  </Text>
                </Placeholder>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum.
                  </Text>
                </Placeholder>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum.
                  </Text>
                </Placeholder>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
                  </Text>
                </Placeholder>
              </Columns>
              <SectionHeading>Columns - Width</SectionHeading>
              <Columns space="12px">
                <Column width="content">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      content
                    </Text>
                  </Placeholder>
                </Column>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    default
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Column width="1/2">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/2
                    </Text>
                  </Placeholder>
                </Column>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    default
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Column width="1/2">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/2
                    </Text>
                  </Placeholder>
                </Column>
                {repeat(
                  2,
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      default
                    </Text>
                  </Placeholder>,
                )}
              </Columns>
              <Columns space="12px">
                {repeat(
                  2,
                  <Column width="1/2">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/2
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <Columns space="12px">
                <Column width="1/3">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/3
                    </Text>
                  </Placeholder>
                </Column>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    default
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Column width="1/3">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/3
                    </Text>
                  </Placeholder>
                </Column>
                {repeat(
                  2,
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      default
                    </Text>
                  </Placeholder>,
                )}
              </Columns>
              <Columns space="12px">
                {repeat(
                  3,
                  <Column width="1/3">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/3
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <Columns space="12px">
                <Column width="1/3">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/3
                    </Text>
                  </Placeholder>
                </Column>
                <Column width="2/3">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      2/3
                    </Text>
                  </Placeholder>
                </Column>
              </Columns>
              <Columns space="12px">
                <Column width="1/4">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/4
                    </Text>
                  </Placeholder>
                </Column>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    default
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Column width="1/4">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/4
                    </Text>
                  </Placeholder>
                </Column>
                {repeat(
                  3,
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      default
                    </Text>
                  </Placeholder>,
                )}
              </Columns>
              <Columns space="12px">
                {repeat(
                  4,
                  <Column width="1/4">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/4
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <Columns space="12px">
                {repeat(
                  2,
                  <Column width="1/4">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/4
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
                <Column width="1/2">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/2
                    </Text>
                  </Placeholder>
                </Column>
              </Columns>
              <Columns space="12px">
                <Column width="1/4">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/4
                    </Text>
                  </Placeholder>
                </Column>
                <Column width="3/4">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      3/4
                    </Text>
                  </Placeholder>
                </Column>
              </Columns>
              <Columns space="12px">
                <Column width="1/5">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/5
                    </Text>
                  </Placeholder>
                </Column>
                <Placeholder>
                  <Text size="14pt" weight="bold">
                    default
                  </Text>
                </Placeholder>
              </Columns>
              <Columns space="12px">
                <Column width="1/5">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/5
                    </Text>
                  </Placeholder>
                </Column>
                {repeat(
                  4,
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      default
                    </Text>
                  </Placeholder>,
                )}
              </Columns>
              <Columns space="12px">
                {repeat(
                  5,
                  <Column width="1/5">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/5
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <Columns space="12px">
                <Column width="1/5">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/5
                    </Text>
                  </Placeholder>
                </Column>
                {repeat(
                  2,
                  <Column width="2/5">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        2/5
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <Columns space="12px">
                {repeat(
                  2,
                  <Column width="1/5">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/5
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
                <Column width="3/5">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      3/5
                    </Text>
                  </Placeholder>
                </Column>
              </Columns>
              <Columns space="12px">
                <Column width="1/5">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      1/5
                    </Text>
                  </Placeholder>
                </Column>
                <Column width="4/5">
                  <Placeholder>
                    <Text size="14pt" weight="bold">
                      4/5
                    </Text>
                  </Placeholder>
                </Column>
              </Columns>
              <SectionHeading>Columns - Vertical alignment</SectionHeading>
              <ExampleHeading>top</ExampleHeading>
              <Columns space="12px" alignVertical="top">
                <Placeholder height={30} />
                <Placeholder height={60} />
              </Columns>
              <ExampleHeading>center</ExampleHeading>
              <Columns space="12px" alignVertical="center">
                <Placeholder height={30} />
                <Placeholder height={60} />
              </Columns>
              <ExampleHeading>bottom</ExampleHeading>
              <Columns space="12px" alignVertical="bottom">
                <Placeholder height={30} />
                <Placeholder height={60} />
              </Columns>
              <SectionHeading>Columns - Horizontal alignment</SectionHeading>
              <ExampleHeading>left</ExampleHeading>
              <Columns space="12px" alignHorizontal="left">
                {repeat(
                  2,
                  <Column width="1/4">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/4
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <ExampleHeading>center</ExampleHeading>
              <Columns space="12px" alignHorizontal="center">
                {repeat(
                  2,
                  <Column width="1/4">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/4
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>
              <ExampleHeading>right</ExampleHeading>
              <Columns space="12px" alignHorizontal="right">
                {repeat(
                  2,
                  <Column width="1/4">
                    <Placeholder>
                      <Text size="14pt" weight="bold">
                        1/4
                      </Text>
                    </Placeholder>
                  </Column>,
                )}
              </Columns>

              <SectionHeading>Rows - Height</SectionHeading>
              <Box style={{ height: 160 }}>
                <Rows space="12px">
                  <Row height="content">
                    <Placeholder width="100%">
                      <Text size="14pt" weight="bold" align="center">
                        content
                      </Text>
                    </Placeholder>
                  </Row>
                  <Placeholder height="100%" width="100%">
                    <Text size="14pt" weight="bold" align="center">
                      default
                    </Text>
                  </Placeholder>
                </Rows>
              </Box>
              <Columns space="12px">
                <Box style={{ height: 160 }}>
                  <Rows space="12px">
                    {repeat(
                      4,
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          default
                        </Text>
                      </Placeholder>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 160 }}>
                  <Rows space="12px">
                    <Row height="1/2">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/2
                        </Text>
                      </Placeholder>
                    </Row>
                    {repeat(
                      2,
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          default
                        </Text>
                      </Placeholder>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 160 }}>
                  <Rows space="12px">
                    {repeat(
                      2,
                      <Row height="1/2">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/2
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
              </Columns>
              <Columns space="12px">
                <Box style={{ height: 240 }}>
                  <Rows space="12px">
                    {repeat(
                      6,
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          default
                        </Text>
                      </Placeholder>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 240 }}>
                  <Rows space="12px">
                    <Row height="1/3">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/3
                        </Text>
                      </Placeholder>
                    </Row>
                    <Placeholder height="100%" width="100%">
                      <Text size="14pt" weight="bold" align="center">
                        default
                      </Text>
                    </Placeholder>
                  </Rows>
                </Box>
                <Box style={{ height: 240 }}>
                  <Rows space="12px">
                    {repeat(
                      3,
                      <Row height="1/3">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/3
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 240 }}>
                  <Rows space="12px">
                    <Row height="1/3">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/3
                        </Text>
                      </Placeholder>
                    </Row>
                    <Row height="2/3">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          2/3
                        </Text>
                      </Placeholder>
                    </Row>
                  </Rows>
                </Box>
              </Columns>
              <Columns space="12px">
                <Box style={{ height: 320 }}>
                  <Rows space="12px">
                    {repeat(
                      8,
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          default
                        </Text>
                      </Placeholder>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 320 }}>
                  <Rows space="12px">
                    <Row height="1/4">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/4
                        </Text>
                      </Placeholder>
                    </Row>
                    <Placeholder height="100%" width="100%">
                      <Text size="14pt" weight="bold" align="center">
                        default
                      </Text>
                    </Placeholder>
                  </Rows>
                </Box>
                <Box style={{ height: 320 }}>
                  <Rows space="12px">
                    {repeat(
                      4,
                      <Row height="1/4">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/4
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 320 }}>
                  <Rows space="12px">
                    <Row height="1/4">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/4
                        </Text>
                      </Placeholder>
                    </Row>
                    <Row height="3/4">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          3/4
                        </Text>
                      </Placeholder>
                    </Row>
                  </Rows>
                </Box>
              </Columns>
              <Columns space="12px">
                <Box style={{ height: 420 }}>
                  <Rows space="12px">
                    {repeat(
                      10,
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          default
                        </Text>
                      </Placeholder>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 420 }}>
                  <Rows space="12px">
                    <Row height="1/5">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/5
                        </Text>
                      </Placeholder>
                    </Row>
                    {repeat(
                      2,
                      <Row height="2/5">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            2/5
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
                <Box style={{ height: 420 }}>
                  <Rows space="12px">
                    <Row height="2/5">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          2/5
                        </Text>
                      </Placeholder>
                    </Row>
                    <Row height="3/5">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          3/5
                        </Text>
                      </Placeholder>
                    </Row>
                  </Rows>
                </Box>
                <Box style={{ height: 420 }}>
                  <Rows space="12px">
                    <Row height="4/5">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          4/5
                        </Text>
                      </Placeholder>
                    </Row>
                    <Row height="1/5">
                      <Placeholder height="100%" width="100%">
                        <Text size="14pt" weight="bold" align="center">
                          1/5
                        </Text>
                      </Placeholder>
                    </Row>
                  </Rows>
                </Box>
              </Columns>

              <SectionHeading>Rows - Horizontal alignment</SectionHeading>
              <ExampleHeading>left</ExampleHeading>
              <Box style={{ height: 120 }}>
                <Rows space="12px" alignHorizontal="left">
                  <Placeholder width={50} height="100%" />
                  <Placeholder width={70} height="100%" />
                  <Placeholder width={90} height="100%" />
                </Rows>
              </Box>
              <ExampleHeading>center</ExampleHeading>
              <Box style={{ height: 120 }}>
                <Rows space="12px" alignHorizontal="center">
                  <Placeholder width={50} height="100%" />
                  <Placeholder width={70} height="100%" />
                  <Placeholder width={90} height="100%" />
                </Rows>
              </Box>
              <ExampleHeading>right</ExampleHeading>
              <Box style={{ height: 120 }}>
                <Rows space="12px" alignHorizontal="right">
                  <Placeholder width={50} height="100%" />
                  <Placeholder width={70} height="100%" />
                  <Placeholder width={90} height="100%" />
                </Rows>
              </Box>

              <SectionHeading>Rows - Vertical alignment</SectionHeading>
              <ExampleHeading>top</ExampleHeading>
              <Placeholder>
                <Box style={{ height: 200 }}>
                  <Rows space="12px" alignVertical="top">
                    {repeat(
                      2,
                      <Row height="1/4">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/4
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
              </Placeholder>
              <ExampleHeading>center</ExampleHeading>
              <Placeholder>
                <Box style={{ height: 200 }}>
                  <Rows space="12px" alignVertical="center">
                    {repeat(
                      2,
                      <Row height="1/4">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/4
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
              </Placeholder>
              <ExampleHeading>bottom</ExampleHeading>
              <Placeholder>
                <Box style={{ height: 200 }}>
                  <Rows space="12px" alignVertical="bottom">
                    {repeat(
                      2,
                      <Row height="1/4">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/4
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
              </Placeholder>
              <ExampleHeading>justify</ExampleHeading>
              <Placeholder>
                <Box style={{ height: 200 }}>
                  <Rows space="12px" alignVertical="justify">
                    {repeat(
                      2,
                      <Row height="1/4">
                        <Placeholder height="100%" width="100%">
                          <Text size="14pt" weight="bold" align="center">
                            1/4
                          </Text>
                        </Placeholder>
                      </Row>,
                    )}
                  </Rows>
                </Box>
              </Placeholder>

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
        <Button color="accent" height="44px" variant="raised">
          Button
        </Button>
      </Stack>
    </Box>
  );
}
