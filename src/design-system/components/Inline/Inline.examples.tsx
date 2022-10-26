import React from 'react';
import { Placeholder } from '../../docs/components/Placeholder';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Inline } from './Inline';

export const basicUsage = createExample({
  name: 'Basic usage',
  Example: () =>
    source(
      <Inline space="12px">
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
      </Inline>,
    ),
});

export const noWrap = createExample({
  name: 'No wrap',
  Example: () =>
    source(
      <Inline space="12px" wrap={false}>
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
      </Inline>,
    ),
});

export const centerAlignedHorizontally = createExample({
  name: 'Center-aligned horizontally',
  Example: () =>
    source(
      <Inline alignHorizontal="center" space="20px">
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
      </Inline>,
    ),
});

export const rightAlignedHorizontally = createExample({
  name: 'Right-aligned horizontally',
  Example: () =>
    source(
      <Inline alignHorizontal="right" space="20px">
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={40} width={40} />
      </Inline>,
    ),
});

export const justifiedHorizontally = createExample({
  name: 'Justified horizontally',
  Example: () =>
    source(
      <Inline alignHorizontal="justify" space="20px">
        <Placeholder width={40} />
        <Placeholder width={40} />
        <Placeholder width={40} />
      </Inline>,
    ),
});

export const centerAlignedVertically = createExample({
  name: 'Center-aligned vertically',
  Example: () =>
    source(
      <Inline alignVertical="center" space="20px">
        <Placeholder height={20} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={60} width={40} />
        <Placeholder height={30} width={40} />
        <Placeholder height={50} width={40} />
        <Placeholder height={20} width={40} />
        <Placeholder height={70} width={40} />
        <Placeholder height={10} width={40} />
        <Placeholder height={50} width={40} />
      </Inline>,
    ),
});

export const bottomAlignedVertically = createExample({
  name: 'Bottom-aligned vertically',
  Example: () =>
    source(
      <Inline alignVertical="bottom" space="20px">
        <Placeholder height={20} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={60} width={40} />
        <Placeholder height={30} width={40} />
        <Placeholder height={50} width={40} />
        <Placeholder height={20} width={40} />
        <Placeholder height={70} width={40} />
        <Placeholder height={10} width={40} />
        <Placeholder height={50} width={40} />
      </Inline>,
    ),
});

export const centerAlignedHorizontallyVertically = createExample({
  name: 'Center-aligned horizontally and vertically',
  Example: () =>
    source(
      <Inline alignHorizontal="center" alignVertical="center" space="20px">
        <Placeholder height={20} width={40} />
        <Placeholder height={40} width={40} />
        <Placeholder height={60} width={40} />
        <Placeholder height={30} width={40} />
        <Placeholder height={50} width={40} />
        <Placeholder height={20} width={40} />
        <Placeholder height={70} width={40} />
        <Placeholder height={10} width={40} />
        <Placeholder height={50} width={40} />
      </Inline>,
    ),
});
