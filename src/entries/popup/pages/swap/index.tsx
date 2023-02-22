import React from 'react';

import { i18n } from '~/core/languages';
import { ButtonSymbol } from '~/design-system';

import { Navbar } from '../../components/Navbar/Navbar';

export function Swap() {
  return (
    <>
      <Navbar
        title={i18n.t('swap.title')}
        background={'surfaceSecondary'}
        leftComponent={<Navbar.CloseButton />}
        rightComponent={
          <ButtonSymbol
            color="surfaceSecondaryElevated"
            height={'32px'}
            onClick={() => null}
            symbol="switch.2"
            symbolColor="labelSecondary"
            variant="flat"
          />
        }
      />
    </>
  );
}
