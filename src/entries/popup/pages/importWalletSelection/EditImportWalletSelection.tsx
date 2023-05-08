import React, { useState } from 'react';

import { globalColors } from '~/design-system/styles/designTokens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletEditNavbar } from '../../components/ImportWallet/ImportWalletEditNavbar';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';

export type WalletsSortMethod =
  | 'default'
  | 'token-balance'
  | 'last-transaction';

export function EditImportWalletSelection() {
  const [sortMethod, setSortMethod] = useState<WalletsSortMethod>('default');
  return (
    <>
      <ImportWalletEditNavbar
        accentColor={globalColors.blue60}
        sortMethod={sortMethod}
        setSortMethod={setSortMethod}
      />
      <FullScreenContainer>
        <ImportWalletSelectionEdit sortMethod={sortMethod} />
      </FullScreenContainer>
    </>
  );
}
