import React from 'react';

import source from '../../docs/utils/source.macro';
import { createExample } from '../../docs/createDocs';
import { Separator } from './Separator';
import { Stack } from '../Stack/Stack';

export const basic = createExample({
  name: 'Basic',
  Example: () => source(<Separator />),
});

export const colors = createExample({
  name: 'Colors',
  showThemes: true,
  Example: () =>
    source(
      <Stack space="20px">
        <Separator color="separator" />
        <Separator color="separatorSecondary" />
        <Separator color="separatorTertiary" />
      </Stack>,
    ),
});

export const weights = createExample({
  name: 'Weights',
  Example: () =>
    source(
      <Stack space="20px">
        <Separator strokeWeight="1px" />
        <Separator strokeWeight="2px" />
      </Stack>,
    ),
});
