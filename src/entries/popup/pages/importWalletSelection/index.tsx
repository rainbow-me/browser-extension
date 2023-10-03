import React from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletNavbar } from '../../components/ImportWallet/ImportWalletNavbar';
import { ImportWalletSelection as ImportWalletSelectionStep } from '../../components/ImportWallet/ImportWalletSelection';

export function ImportWalletSelection() {
  return (
    <>
      <ImportWalletNavbar showSortMenu={false} navbarIcon="arrow" />
      <FullScreenContainer background="surfaceSecondary">
        <ImportWalletSelectionStep onboarding />
      </FullScreenContainer>
    </>
  );
}
