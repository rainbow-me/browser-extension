import React from 'react';
import { Paragraph } from '../../docs/components/Paragraph';
import { Placeholder } from '../../docs/components/Placeholder';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Inset } from './Inset';

export const basicUsage = createExample({
  name: 'Basic usage',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Placeholder />
      </Inset>,
    ),
});

export const horizontalSpace = createExample({
  name: 'Horizontal space',
  description: <Paragraph>Space can also be customized per axis.</Paragraph>,
  showFrame: true,
  Example: () =>
    source(
      <Inset horizontal="20px">
        <Placeholder />
      </Inset>,
    ),
});

export const verticalSpace = createExample({
  name: 'Vertical space',
  showFrame: true,
  Example: () =>
    source(
      <Inset vertical="20px">
        <Placeholder />
      </Inset>,
    ),
});

export const topSpace = createExample({
  name: 'Top space',
  showFrame: true,
  Example: () =>
    source(
      <Inset top="20px">
        <Placeholder />
      </Inset>,
    ),
});

export const bottomSpace = createExample({
  name: 'Bottom space',
  showFrame: true,
  Example: () =>
    source(
      <Inset bottom="20px">
        <Placeholder />
      </Inset>,
    ),
});

export const leftSpace = createExample({
  name: 'Left space',
  showFrame: true,
  Example: () =>
    source(
      <Inset left="20px">
        <Placeholder />
      </Inset>,
    ),
});

export const rightSpace = createExample({
  name: 'Right space',
  showFrame: true,
  Example: () =>
    source(
      <Inset right="20px">
        <Placeholder />
      </Inset>,
    ),
});
