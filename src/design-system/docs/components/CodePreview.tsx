import lzString from 'lz-string';
import React from 'react';

import { Box } from '../../components/Box/Box';
import { Inline } from '../../components/Inline/Inline';
import { Stack } from '../../components/Stack/Stack';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import ChevronUpIcon from '../icons/ChevronUpIcon';
import PlayIcon from '../icons/PlayIcon';
import { Example } from '../types';
import { getSourceFromExample } from '../utils/getSourceFromExample';
import { Source } from '../utils/source.macro';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
import { CodeBlock } from './CodeBlock';

export const CodePreview = ({
  disableActions = false,
  enableCodeSnippet = true,
  enablePlayroom = true,
  wrapper = (children) => children,
  showCode: defaultShowCode = false,
  showFrame = false,
  Example,
}: {
  disableActions?: boolean;
  enableCodeSnippet?: boolean;
  showCode?: boolean;
  enablePlayroom?: boolean;
  showFrame?: boolean;
  wrapper?: Example['wrapper'];
  Example: () => Source<React.ReactElement>;
}) => {
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
      <Box
        background="surfaceSecondaryElevated"
        borderRadius="16px"
        padding="24px"
      >
        <Box
          borderRadius="16px"
          background={showFrame ? 'surfacePrimaryElevated' : undefined}
        >
          <Box>{wrapper(element)}</Box>
        </Box>
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
                    process.env.NODE_ENV === 'production'
                      ? `${window.location.href}playroom`
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
