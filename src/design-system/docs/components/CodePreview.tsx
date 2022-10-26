import lzString from 'lz-string';
import React, { useState } from 'react';

import { Box } from '../../components/Box/Box';
import { ThemeProvider } from '../../components/Box/ColorContext';
import { Inline } from '../../components/Inline/Inline';
import { Stack } from '../../components/Stack/Stack';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';
import PlayIcon from '../icons/PlayIcon';
import { Example } from '../createDocs';
import { getSourceFromExample } from '../utils/getSourceFromExample';
import { Source } from '../utils/source.macro';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { CodeBlock } from './CodeBlock';
import { codePreviewBackgroundColorVar } from './CodePreview.css';
import { ColorContext } from '../../styles/designTokens';
import { Text } from '../../components/Text/Text';
import { capitalize } from 'lodash';
import { useTheme } from '../hooks/useTheme';

const themes = ['light', 'dark'] as const;

export const CodePreview = ({
  disableActions = false,
  enableCodeSnippet = true,
  enablePlayroom = true,
  Example,
  showCode: defaultShowCode = false,
  showFrame = false,
  showThemes,
  wrapper = (children) => children,
}: {
  disableActions?: boolean;
  enableCodeSnippet?: boolean;
  enablePlayroom?: boolean;
  Example: () => Source<React.ReactElement>;
  showCode?: boolean;
  showFrame?: boolean;
  showThemes?: Example['showThemes'];
  wrapper?: Example['wrapper'];
}) => {
  const { theme: defaultTheme } = useTheme();

  const [selectedTheme, setSelectedTheme] =
    useState<ColorContext>(defaultTheme);

  const [showCode, setShowCode] = React.useState(Boolean(defaultShowCode));
  const { displayCode, playroomCode, element } = React.useMemo(
    () =>
      getSourceFromExample({
        Example,
      }),
    [Example],
  );

  return (
    <Stack space="24px">
      <Box borderRadius="16px" style={{ overflow: 'hidden' }}>
        {/* eslint-disable-next-line no-nested-ternary */}
        {showThemes === 'toggle' ? (
          <ThemeProvider theme={selectedTheme}>
            <Preview
              defaultTheme={defaultTheme}
              onChangeTheme={setSelectedTheme}
              element={element}
              showFrame={showFrame}
              theme={selectedTheme}
              wrapper={wrapper}
            />
          </ThemeProvider>
        ) : showThemes ? (
          themes.map((theme) => (
            <ThemeProvider key={theme} theme={theme}>
              <Preview
                element={element}
                showFrame={showFrame}
                theme={theme}
                wrapper={wrapper}
              />
            </ThemeProvider>
          ))
        ) : (
          <Preview element={element} showFrame={showFrame} wrapper={wrapper} />
        )}
      </Box>
      {displayCode && (
        <>
          {showCode && <CodeBlock code={displayCode} />}
          {!disableActions && (
            <Inline space="24px">
              {enableCodeSnippet && (
                <Button
                  iconBefore={
                    showCode ? <ChevronUpIcon /> : <ChevronDownIcon />
                  }
                  onClick={() => setShowCode((showCode) => !showCode)}
                >
                  {showCode ? 'Hide' : 'Show'} code
                </Button>
              )}
              {enablePlayroom && (
                <ButtonLink
                  iconBefore={<PlayIcon />}
                  href={`${
                    process.env.NODE_ENV === 'production' &&
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/playroom`
                      : 'http://localhost:9000/'
                  }?code=${lzString.compressToEncodedURIComponent(
                    JSON.stringify({ code: playroomCode }),
                  )}`}
                >
                  Playroom
                </ButtonLink>
              )}
            </Inline>
          )}
        </>
      )}
    </Stack>
  );
};

function Preview({
  defaultTheme,
  element,
  onChangeTheme,
  showFrame,
  theme,
  wrapper = (children) => children,
}: {
  defaultTheme?: ColorContext;
  element?: React.ReactElement;
  onChangeTheme?: (theme: ColorContext) => void;
  showFrame: boolean;
  theme?: ColorContext;
  wrapper: Example['wrapper'];
}) {
  const otherTheme: ColorContext = defaultTheme === 'light' ? 'dark' : 'light';
  return (
    <Box
      padding="24px"
      style={{ backgroundColor: codePreviewBackgroundColorVar }}
    >
      <Stack space="24px">
        {/* eslint-disable-next-line no-nested-ternary */}
        {defaultTheme && onChangeTheme ? (
          <Inline space="10px">
            <Box
              onClick={() => onChangeTheme(defaultTheme)}
              style={{ cursor: 'default' }}
            >
              <Text
                color={theme === defaultTheme ? 'label' : 'labelQuaternary'}
                size="14pt"
                weight="semibold"
              >
                {capitalize(defaultTheme)} Mode
              </Text>
            </Box>
            <Box
              onClick={() => onChangeTheme(otherTheme)}
              style={{ cursor: 'default' }}
            >
              <Text
                color={theme === otherTheme ? 'label' : 'labelQuaternary'}
                size="14pt"
                weight="semibold"
              >
                {capitalize(otherTheme)} Mode
              </Text>
            </Box>
          </Inline>
        ) : theme ? (
          <Text color="label" size="14pt" weight="semibold">
            {capitalize(theme)} Mode
          </Text>
        ) : null}
        <Box
          borderRadius="16px"
          background={showFrame ? 'surfacePrimaryElevated' : undefined}
        >
          {wrapper(element)}
        </Box>
      </Stack>
    </Box>
  );
}
