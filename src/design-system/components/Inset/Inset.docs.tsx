import React from 'react';

import { Paragraph } from '../../docs/components/Paragraph';
import { TextInline } from '../../docs/components/TextInline';
import { createDocs } from '../../docs/createDocs';

import {
  basicUsage,
  bottomSpace,
  horizontalSpace,
  leftSpace,
  rightSpace,
  topSpace,
  verticalSpace,
} from './Inset.examples';

const inset = createDocs({
  name: 'Inset',
  category: 'Layout',
  description: (
    <Paragraph>
      Renders a <TextInline highlight>container with padding.</TextInline>
    </Paragraph>
  ),
  examples: [
    basicUsage,
    horizontalSpace,
    verticalSpace,
    bottomSpace,
    leftSpace,
    rightSpace,
    topSpace,
  ],
});

export default inset;
