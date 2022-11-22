import React from 'react';

import { Code } from '../../docs/components/Code';
import { Paragraph } from '../../docs/components/Paragraph';
import { createDocs } from '../../docs/createDocs';

import {
  background,
  borderRadius,
  margin,
  padding,
  shadows,
} from './Box.examples';

const docs = createDocs({
  name: 'Box',
  category: 'Layout',
  description: (
    <>
      <Paragraph>
        Renders an individual <Code>div</Code> element with quick access to the
        standard padding and negative margin scales, as well as other common
        layout properties.
      </Paragraph>
      <Paragraph>
        <Code>Box</Code> is a low-level primitive that should only be used when
        building design system components, or when other layout primitives (such
        as: <Code>Rows</Code>, <Code>Inline</Code>, <Code>Columns</Code>, etc)
        are not sufficient.
      </Paragraph>
    </>
  ),
  examples: [background, padding, margin, borderRadius, shadows],
});

export default docs;
