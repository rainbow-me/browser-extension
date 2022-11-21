import React from 'react';

import { Paragraph } from '../../docs/components/Paragraph';
import { TextInline } from '../../docs/components/TextInline';
import { createDocs } from '../../docs/createDocs';

import {
  basic,
  bottomAlignedVertically,
  centerAlignedHorizontally,
  centerAlignedVertically,
  customHeights,
  customSpace,
  nestedRows,
  nestedRowsWithExplicitHeights,
  nestedRowsWithExplicitHeightsContent,
  rightAlignedHorizontally,
  rowWithContentHeight,
} from './Rows.examples';

const rows = createDocs({
  name: 'Rows',
  category: 'Layout',
  description: (
    <>
      <Paragraph>
        Renders children <TextInline highlight>vertically</TextInline> in
        equal-height rows by default, with consistent spacing between them.
      </Paragraph>
      <Paragraph>
        If there is only a single row, no space will be rendered.
      </Paragraph>
    </>
  ),
  examples: [
    basic,
    customSpace,
    customHeights,
    rowWithContentHeight,
    nestedRows,
    nestedRowsWithExplicitHeights,
    nestedRowsWithExplicitHeightsContent,
    centerAlignedVertically,
    bottomAlignedVertically,
    centerAlignedHorizontally,
    rightAlignedHorizontally,
  ],
});

export default rows;
