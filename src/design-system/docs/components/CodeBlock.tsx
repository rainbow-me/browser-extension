import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import useClipboard from 'react-use-clipboard';

import { Box } from '../../components/Box/Box';
import { Text } from '../../components/Text/Text';
import { codeTheme } from '../utils/codeTheme';

export const CodeBlock = ({ code }: { code: string }) => {
  const [isCopied, setCopied] = useClipboard(code, { successDuration: 5000 });
  const isMultipleLines = code.includes('\n');

  return (
    <Box>
      <Box
        background="surfaceSecondaryElevated"
        borderRadius="16px"
        padding="24px"
        style={{ position: 'relative', fontSize: '18px', overflowX: 'scroll' }}
      >
        <Box
          position="absolute"
          style={{
            right: '16px',
            ...(isMultipleLines
              ? {
                  top: '16px',
                }
              : {}),
          }}
        >
          <Box onClick={setCopied}>
            <Text size="16pt" weight="semibold">
              {isCopied ? 'Copied!' : 'Copy'}
            </Text>
          </Box>
        </Box>
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
  );
};
