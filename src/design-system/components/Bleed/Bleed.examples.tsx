import React from 'react';

import { Placeholder } from '../../docs/components/Placeholder';
import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Inset } from '../Inset/Inset';
import { Stack } from '../Stack/Stack';

import { Bleed } from './Bleed';

export const basicUsage = createExample({
  name: 'Basic usage',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Bleed horizontal="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});

export const horizontal = createExample({
  name: 'Horizontal',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Bleed horizontal="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});

export const vertical = createExample({
  name: 'Vertical',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Bleed vertical="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});

export const right = createExample({
  name: 'Right',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Bleed right="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});

export const left = createExample({
  name: 'Left',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Bleed left="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});

export const top = createExample({
  name: 'Top',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Bleed top="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});

export const bottom = createExample({
  name: 'Bottom',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Placeholder />
          <Bleed bottom="20px">
            <Placeholder />
          </Bleed>
        </Stack>
      </Inset>,
    ),
});

export const allSides = createExample({
  name: 'All sides',
  showFrame: true,
  Example: () =>
    source(
      <Inset space="20px">
        <Stack space="20px">
          <Placeholder />
          <Bleed space="20px">
            <Placeholder />
          </Bleed>
          <Placeholder />
        </Stack>
      </Inset>,
    ),
});
