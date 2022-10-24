import React from 'react';

import { Code } from '../../docs/components/Code';
import { Docs } from '../../docs/types';
import { Text } from '../Text/Text';
import { background, padding, margin, borderRadius } from './Box.examples';

const docs: Docs = {
  name: 'Box',
  category: 'Layout',
  description: (
    <>
      <Text size="20pt" weight="medium">
        Renders an individual <Code>div</Code> element with quick access to the
        standard padding and negative margin scales, as well as other common
        layout properties.
      </Text>
      <Text size="20pt" weight="medium">
        <Code>Box</Code> is a low-level primitive that should only be used when
        building design system components, or when other layout primitives (such
        as: <Code>Rows</Code>, <Code>Inline</Code>, <Code>Columns</Code>, etc)
        are not sufficient.
      </Text>
    </>
  ),
  examples: [background, padding, margin, borderRadius],
};

// eslint-disable-next-line import/no-default-export
export default docs;
