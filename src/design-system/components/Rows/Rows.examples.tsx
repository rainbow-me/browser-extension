import React from 'react';

import { Placeholder } from '../../docs/components/Placeholder';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Box } from '../Box/Box';

import { Row, Rows } from './Rows';

export const basic = createExample({
  name: 'Basic usage',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="20px">
        <Placeholder height="100%" />
        <Placeholder height="100%" />
        <Placeholder height="100%" />
      </Rows>,
    ),
});

export const customSpace = createExample({
  name: 'Custom space',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="10px">
        <Placeholder height="100%" />
        <Placeholder height="100%" />
        <Placeholder height="100%" />
      </Rows>,
    ),
});

export const customHeights = createExample({
  name: 'Custom heights',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="20px">
        <Row height="1/4">
          <Placeholder height="100%" />
        </Row>
        <Row height="3/4">
          <Placeholder height="100%" />
        </Row>
      </Rows>,
    ),
});

export const rowWithContentHeight = createExample({
  name: 'Row with content height',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="12px">
        <Placeholder height="100%" />
        <Row height="content">
          <Placeholder />
        </Row>
      </Rows>,
    ),
});

export const nestedRows = createExample({
  name: 'Nested rows',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="12px">
        <Placeholder height="100%" />
        <Rows space="3px">
          <Placeholder height="100%" />
          <Placeholder height="100%" />
        </Rows>
      </Rows>,
    ),
});

export const nestedRowsWithExplicitHeights = createExample({
  name: 'Nested rows with explicit heights',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="12px">
        <Placeholder height="100%" />
        <Rows space="12px">
          <Row height="1/3">
            <Placeholder height="100%" />
          </Row>
          <Placeholder height="100%" />
        </Rows>
      </Rows>,
    ),
});

export const nestedRowsWithExplicitHeightsContent = createExample({
  name: 'Nested rows with explicit heights (content)',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows space="20px">
        <Placeholder height="100%" />
        <Row height="content">
          <Rows space="6px">
            <Row height="content">
              <Placeholder height={60} />
            </Row>
            <Row height="content">
              <Placeholder height={60} />
            </Row>
          </Rows>
        </Row>
      </Rows>,
    ),
});

export const centerAlignedVertically = createExample({
  name: 'Center-aligned vertically',
  wrapper: (children) => <Box style={{ height: 300 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows alignVertical="center" space="20px">
        <Row height="1/2">
          <Placeholder height="100%" />
        </Row>
        <Row height="1/4">
          <Placeholder height="100%" />
        </Row>
      </Rows>,
    ),
});

export const bottomAlignedVertically = createExample({
  name: 'Bottom-aligned vertically',
  wrapper: (children) => <Box style={{ height: 300 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows alignVertical="bottom" space="20px">
        <Row height="1/2">
          <Placeholder height="100%" />
        </Row>
        <Row height="1/4">
          <Placeholder height="100%" />
        </Row>
      </Rows>,
    ),
});

export const centerAlignedHorizontally = createExample({
  name: 'Center-aligned horizontally',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows alignHorizontal="center" space="20px">
        <Placeholder height="100%" width={30} />
        <Placeholder height="100%" width={60} />
        <Placeholder height="100%" width={20} />
      </Rows>,
    ),
});

export const rightAlignedHorizontally = createExample({
  name: 'Right-aligned horizontally',
  wrapper: (children) => <Box style={{ height: 200 }}>{children}</Box>,
  Example: () =>
    source(
      <Rows alignHorizontal="right" space="20px">
        <Placeholder height="100%" width={30} />
        <Placeholder height="100%" width={60} />
        <Placeholder height="100%" width={20} />
      </Rows>,
    ),
});
