import React from 'react';

import { createExample } from '../../docs/createDocs';
import source from '../../docs/utils/source.macro';
import { Inline } from '../Inline/Inline';

import { Input } from './Input';

export const basic = createExample({
  name: 'Basic usage',
  showThemes: true,
  Example: () =>
    source(
      <Inline alignHorizontal="justify" space="10px" wrap={false}>
        <Input height="32px" placeholder="Placeholder" variant="surface" />
        <Input height="32px" placeholder="Placeholder" variant="bordered" />
        <Input height="32px" placeholder="Placeholder" variant="transparent" />
      </Inline>,
    ),
});
