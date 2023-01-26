/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import React from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';

export function EditImportWalletSelection() {
  return (
    <FullScreenContainer>
      <ImportWalletSelectionEdit />
    </FullScreenContainer>
  );
}
