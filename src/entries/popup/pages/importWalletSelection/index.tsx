import React from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletSelection as ImportWalletSelectionStep } from '../../components/ImportWallet/ImportWalletSelection';

export function ImportWalletSelection() {
  return (
    <FullScreenContainer>
      <ImportWalletSelectionStep onboarding />
    </FullScreenContainer>
  );
}
