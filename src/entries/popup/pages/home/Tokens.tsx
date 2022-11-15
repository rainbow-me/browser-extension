import * as React from 'react';

import { Stack } from '~/design-system';

import { ClearStorage } from '../../components/_dev/ClearStorage';

export function Tokens() {
  return (
    <Stack space="20px">
      <ClearStorage />
    </Stack>
  );
}
