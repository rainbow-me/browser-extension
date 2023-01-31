import React from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWallet as ImportWalletStep } from '../../components/ImportWallet/ImportWallet';

export function ImportWallet() {
  return (
    <FullScreenContainer>
      <ImportWalletStep onboarding />
    </FullScreenContainer>
  );
}
