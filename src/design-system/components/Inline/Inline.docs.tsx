import React from 'react';

import { Paragraph } from '../../docs/components/Paragraph';
import { TextInline } from '../../docs/components/TextInline';
import { createDocs } from '../../docs/createDocs';

import {
  basicUsage,
  bottomAlignedVertically,
  centerAlignedHorizontally,
  centerAlignedHorizontallyVertically,
  centerAlignedVertically,
  justifiedHorizontally,
  noWrap,
  rightAlignedHorizontally,
} from './Inline.examples';

const inline = createDocs({
  name: 'Inline',
  category: 'Layout',
  description: (
    <>
      <Paragraph>
        Arranges child nodes{' '}
        <TextInline highlight>
          horizontally, wrapping to multiple lines if needed
        </TextInline>
        , with equal spacing between items.
      </Paragraph>
      <Paragraph>
        Paragraph there is only a single child node, no space will be rendered.
      </Paragraph>
    </>
  ),
  examples: [
    basicUsage,
    rightAlignedHorizontally,
    centerAlignedHorizontally,
    justifiedHorizontally,
    bottomAlignedVertically,
    centerAlignedVertically,
    centerAlignedHorizontallyVertically,
    noWrap,
  ],
});

export default inline;
