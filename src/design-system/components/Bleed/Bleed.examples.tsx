import React from 'react';
import { Placeholder } from '../../docs/components/Placeholder';

import { Example } from '../../docs/types';
import source from '../../docs/utils/source.macro';
import { Inset } from '../Inset/Inset';
import { Stack } from '../Stack/Stack';
import { Bleed } from './Bleed';

export const basicUsage: Example = {
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
};

export const horizontal: Example = {
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
};

export const vertical: Example = {
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
};

export const right: Example = {
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
};

export const left: Example = {
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
};

export const top: Example = {
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
};

export const bottom: Example = {
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
};

export const allSides: Example = {
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
};
