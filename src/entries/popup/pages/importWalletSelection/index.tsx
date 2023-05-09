import React from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletEditNavbar } from '../../components/ImportWallet/ImportWalletEditNavbar';
import { ImportWalletSelection as ImportWalletSelectionStep } from '../../components/ImportWallet/ImportWalletSelection';
import { ROUTES } from '../../urls';

export function ImportWalletSelection() {
  return (
    <>
      <ImportWalletEditNavbar
        backTo={ROUTES.IMPORT}
        showSortMenu={false}
        navbarIcon="arrow"
      />
      <FullScreenContainer>
        <ImportWalletSelectionStep onboarding />
      </FullScreenContainer>
    </>
  );
}
