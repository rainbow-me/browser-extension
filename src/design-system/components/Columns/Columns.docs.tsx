import React from 'react';

import { Paragraph } from '../../docs/components/Paragraph';
import { TextInline } from '../../docs/components/TextInline';
import { createDocs } from '../../docs/createDocs';

import {
  basic,
  bottomAlignedVertically,
  centerAlignedHorizontally,
  centerAlignedVertically,
  columnWithContentWidth,
  customWidths,
  dynamicWidthContent,
  justifiedHorizontally,
  nestedColumns,
  nestedColumnsWithExplicitWidths,
  nestedColumnsWithExplicitWidthsContent,
  rightAlignedHorizontally,
} from './Columns.examples';

const columns = createDocs({
  name: 'Columns',
  category: 'Layout',
  description: (
    <>
      <Paragraph>
        Renders children <TextInline highlight>horizontally</TextInline> in
        equal-width columns by default, with consistent spacing between them.
      </Paragraph>
      <Paragraph>
        If there is only a single column, no space will be rendered.
      </Paragraph>
    </>
  ),
  examples: [
    basic,
    customWidths,
    columnWithContentWidth,
    nestedColumns,
    nestedColumnsWithExplicitWidths,
    nestedColumnsWithExplicitWidthsContent,
    centerAlignedVertically,
    bottomAlignedVertically,
    centerAlignedHorizontally,
    rightAlignedHorizontally,
    justifiedHorizontally,
    dynamicWidthContent,
  ],
});

export default columns;
