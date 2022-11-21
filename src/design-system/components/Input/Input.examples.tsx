import React from 'react';

import { Paragraph } from '../../docs/components/Paragraph';
import { TextInline } from '../../docs/components/TextInline';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Box } from '../Box/Box';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';

import { Input } from './Input';

export const basic = createExample({
  name: 'Basic usage',
  showThemes: true,
  Example: () =>
    source(
      <Inline alignHorizontal="justify" space="10px" wrap={false}>
        <Input size="34px" placeholder="Placeholder" variant="fill" />
        <Input size="34px" placeholder="Placeholder" variant="surface" />
        <Input size="34px" placeholder="Placeholder" variant="transparent" />
      </Inline>,
    ),
});

export const heights = createExample({
  name: 'Heights',
  description: (
    <>
      <Paragraph>
        Applying a <TextInline highlight>full</TextInline> height makes the
        input span the height of the parent container.
      </Paragraph>
    </>
  ),
  showThemes: 'toggle',
  Example: () =>
    source(
      <Stack space="10px">
        <Input size="34px" placeholder="Placeholder" variant="fill" />
        <Box width="full" style={{ height: 60 }}>
          <Input
            height="full"
            size="34px"
            placeholder="Placeholder"
            variant="fill"
          />
        </Box>
      </Stack>,
    ),
});
