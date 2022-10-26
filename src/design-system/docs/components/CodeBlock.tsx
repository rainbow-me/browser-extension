import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import useClipboard from 'react-use-clipboard';

import { Box } from '../../components/Box/Box';
import { ThemeProvider } from '../../components/Box/ColorContext';
import { Text } from '../../components/Text/Text';
import { codeTheme } from '../utils/codeTheme';
import { Button } from './Button';

export const CodeBlock = ({ code }: { code: string }) => {
  const [isCopied, setCopied] = useClipboard(code, { successDuration: 2000 });

  return (
    <ThemeProvider theme="dark">
      <Box position="relative">
        <Box
          position="absolute"
          style={{
            cursor: 'default',
            right: '16px',
            top: '0px',
          }}
        >
          <Button onClick={setCopied} size="small">
            <Text size="16pt" weight="semibold">
              {isCopied ? 'Copied!' : 'Copy'}
            </Text>
          </Button>
        </Box>
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="16px"
          padding="24px"
          style={{
            fontSize: '18px',
            overflowX: 'scroll',
          }}
        >
          <SyntaxHighlighter
            language="tsx"
            CodeTag={(props) => (
              <code {...props} style={{ fontFamily: 'SFMono', fontSize: 16 }}>
                {props.children}
              </code>
            )}
            style={codeTheme as any}
          >
            {code}
          </SyntaxHighlighter>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
