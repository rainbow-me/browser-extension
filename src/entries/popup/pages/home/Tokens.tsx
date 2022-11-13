import * as React from 'react';

import { Stack } from '~/design-system';

import { ClearStorage } from '../../components/_dev/ClearStorage';
import { InjectToggle } from '../../components/_dev/InjectToggle';

export function Tokens() {
  return (
    <Stack space="20px">
      <InjectToggle />
      <ClearStorage />
    </Stack>
  );
}
