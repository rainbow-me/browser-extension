import * as React from 'react';

import { Code } from '../../docs/components/Code';
import { Paragraph } from '../../docs/components/Paragraph';
import { Placeholder } from '../../docs/components/Placeholder';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';

import { Column, Columns } from './Columns';

const loremIpsum =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

export const basic = createExample({
  name: 'Basic usage',
  Example: () =>
    source(
      <Columns space="20px">
        <Placeholder />
        <Placeholder />
      </Columns>,
    ),
});

export const customWidths = createExample({
  name: 'Custom widths',
  description: (
    <>
      <Paragraph>
        You can optionally control column widths by manually rendering a{' '}
        <Code>Column</Code> as a direct child of <Code>Columns</Code>, which
        allows you to set an explicit <Code>width</Code> prop.
      </Paragraph>
      <Paragraph>
        A common usage of this is to make a column shrink to the width of its
        content. This can be achieved by setting the column <Code>width</Code>{' '}
        prop to <Code>&quot;content&quot;</Code>. Any columns without an
        explicit width will share the remaining space equally.
      </Paragraph>
      <Paragraph>
        The following fractional widths are also available: <Code>1/2</Code>,{' '}
        <Code>1/3</Code>, <Code>2/3</Code>, <Code>1/4</Code>, <Code>3/4</Code>,{' '}
        <Code>1/5</Code>, <Code>2/5</Code>, <Code>3/5</Code>, <Code>4/5</Code>.
      </Paragraph>
    </>
  ),
  Example: () =>
    source(
      <Stack space="20px">
        <Columns space="20px">
          <Column width="1/2">
            <Placeholder />
          </Column>
          <Column width="1/2">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/3">
            <Placeholder />
          </Column>
          <Column width="1/3">
            <Placeholder />
          </Column>
          <Column width="1/3">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="2/3">
            <Placeholder />
          </Column>
          <Column width="1/3">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/4">
            <Placeholder />
          </Column>
          <Column width="1/4">
            <Placeholder />
          </Column>
          <Column width="1/4">
            <Placeholder />
          </Column>
          <Column width="1/4">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/4">
            <Placeholder />
          </Column>
          <Column width="1/2">
            <Placeholder />
          </Column>
          <Column width="1/4">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/4">
            <Placeholder />
          </Column>
          <Column width="3/4">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/5">
            <Placeholder />
          </Column>
          <Column width="2/5">
            <Placeholder />
          </Column>
          <Column width="2/5">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/5">
            <Placeholder />
          </Column>
          <Column width="3/5">
            <Placeholder />
          </Column>
          <Column width="1/5">
            <Placeholder />
          </Column>
        </Columns>

        <Columns space="20px">
          <Column width="1/5">
            <Placeholder />
          </Column>
          <Column width="4/5">
            <Placeholder />
          </Column>
        </Columns>
      </Stack>,
    ),
});

export const columnWithContentWidth = createExample({
  name: 'Column with content width',
  Example: () =>
    source(
      <Columns space="20px">
        <Placeholder />
        <Column width="content">
          <Placeholder width={100} />
        </Column>
      </Columns>,
    ),
});

export const nestedColumns = createExample({
  name: 'Nested columns',
  Example: () =>
    source(
      <Columns space="12px">
        <Placeholder />
        <Columns space="12px">
          <Placeholder />
          <Placeholder />
        </Columns>
      </Columns>,
    ),
});

export const nestedColumnsWithExplicitWidths = createExample({
  name: 'Nested columns with explicit widths',
  Example: () =>
    source(
      <Columns space="12px">
        <Placeholder />
        <Columns space="12px">
          <Column width="1/3">
            <Placeholder />
          </Column>
          <Placeholder />
        </Columns>
      </Columns>,
    ),
});

export const nestedColumnsWithExplicitWidthsContent = createExample({
  name: 'Nested columns with explicit widths (content)',
  Example: () =>
    source(
      <Columns space="20px">
        <Placeholder />
        <Column width="content">
          <Columns space="6px">
            <Column width="content">
              <Placeholder width={60} />
            </Column>
            <Column width="content">
              <Placeholder width={60} />
            </Column>
          </Columns>
        </Column>
      </Columns>,
    ),
});

export const centerAlignedVertically = createExample({
  name: 'Center-aligned vertically',
  Example: () =>
    source(
      <Columns alignVertical="center" space="20px">
        <Placeholder height={30} />
        <Placeholder height={60} />
        <Placeholder height={20} />
      </Columns>,
    ),
});

export const bottomAlignedVertically = createExample({
  name: 'Bottom-aligned vertically',
  Example: () =>
    source(
      <Columns alignVertical="bottom" space="20px">
        <Placeholder height={30} />
        <Placeholder height={60} />
        <Placeholder height={20} />
      </Columns>,
    ),
});

export const centerAlignedHorizontally = createExample({
  name: 'Center-aligned horizontally',
  Example: () =>
    source(
      <Columns alignHorizontal="center" space="20px">
        <Column width="1/4">
          <Placeholder height={30} />
        </Column>
        <Column width="1/4">
          <Placeholder height={60} />
        </Column>
      </Columns>,
    ),
});

export const rightAlignedHorizontally = createExample({
  name: 'Right-aligned horizontally',
  Example: () =>
    source(
      <Columns alignHorizontal="right" space="20px">
        <Column width="1/4">
          <Placeholder height={30} />
        </Column>
        <Column width="1/4">
          <Placeholder height={60} />
        </Column>
      </Columns>,
    ),
});

export const justifiedHorizontally = createExample({
  name: 'Justified horizontally',
  Example: () =>
    source(
      <Columns alignHorizontal="justify" space="20px">
        <Column width="1/4">
          <Placeholder height={30} />
        </Column>
        <Column width="1/4">
          <Placeholder height={60} />
        </Column>
      </Columns>,
    ),
});

export const dynamicWidthContent = createExample({
  name: 'Dynamic width content',
  Example: () =>
    source(
      <Columns space="20px">
        <Text weight="semibold" size="16pt">
          Lorem
        </Text>
        <Text weight="semibold" size="16pt">
          {loremIpsum}
        </Text>
      </Columns>,
    ),
});
