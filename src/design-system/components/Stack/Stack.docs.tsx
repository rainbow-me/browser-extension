import React from 'react';

import { Code } from '../../docs/components/Code';
import { TextInline } from '../../docs/components/TextInline';
import { createDocs } from '../../docs/createDocs';
import { Paragraph } from '../../docs/components/Paragraph';
import {
  basicUsage,
  nested,
  withCenterAlignment,
  withText,
} from './Stack.examples';

const stack = createDocs({
  name: 'Stack',
  category: 'Layout',
  description: (
    <>
      <Paragraph>
        Arranges children <TextInline highlight>vertically</TextInline> with
        equal spacing between them, plus an optional <Code>separator</Code>{' '}
        element. Items can be aligned with <Code>alignHorizontal</Code>.
      </Paragraph>
      <Paragraph>
        If there is only a single child node, no space or separators will be
        rendered.
      </Paragraph>
    </>
  ),
  examples: [basicUsage, nested, withCenterAlignment, withText],
});

// eslint-disable-next-line import/no-default-export
export default stack;
