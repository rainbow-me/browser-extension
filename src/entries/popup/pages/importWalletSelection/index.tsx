import React from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletNavbar } from '../../components/ImportWallet/ImportWalletNavbar';
import { ImportWalletSelection as ImportWalletSelectionStep } from '../../components/ImportWallet/ImportWalletSelection';
import { ROUTES } from '../../urls';

export function ImportWalletSelection() {
  return (
    <>
      <ImportWalletNavbar
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
