import React from 'react';

import { Code } from '../../docs/components/Code';
import { TextInline } from '../../docs/components/TextInline';
import { Paragraph } from '../../docs/components/Paragraph';
import { createDocs } from '../../docs/createDocs';
import typographyDocs from '../../styles/typography.docs';

const text = createDocs({
  name: 'Text',
  category: 'Components',
  description: (
    <>
      <Paragraph>
        Renders a text block{' '}
        <TextInline highlight>with leading trim</TextInline>, removing space
        above capital letters and below the baseline. Read more.
      </Paragraph>
      <Paragraph>
        It is important to note that the <Code>Text</Code> element renders text
        as a block element (a <Code>div</Code>), meaning you cannot nest and
        inline text nodes.
      </Paragraph>
    </>
  ),
  examples: typographyDocs.examples,
});

// eslint-disable-next-line import/no-default-export
export default text;
