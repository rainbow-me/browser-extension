import React from 'react';

import { Code } from '../../docs/components/Code';
import { Paragraph } from '../../docs/components/Paragraph';
import { TextInline } from '../../docs/components/TextInline';
import { TextLink } from '../../docs/components/TextLink';
import { createDocs } from '../../docs/createDocs';
import * as examples from './Bleed.examples';

const bleed = createDocs({
  name: 'Bleed',
  category: 'Layout',
  description: (
    <>
      <Paragraph>
        Renders a{' '}
        <TextInline highlight>container with negative margins</TextInline>{' '}
        allowing content to{' '}
        <TextLink href="https://en.wikipedia.org/wiki/Bleed_(printing)">
          &quot;bleed&quot;
        </TextLink>{' '}
        into the surrounding layout. This effectively works as the opposite of{' '}
        <Code>Inset</Code> and is designed to support visually breaking out of a
        parent container without having to refactor the entire component tree.
      </Paragraph>
      <Paragraph>
        If there is only a single child node, no space or separators will be
        rendered.
      </Paragraph>
    </>
  ),
  examples: [
    examples.basicUsage,
    examples.horizontal,
    examples.vertical,
    examples.right,
    examples.left,
    examples.top,
    examples.bottom,
    examples.allSides,
  ],
});

// eslint-disable-next-line import/no-default-export
export default bleed;
