import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { globalColors } from '~/design-system/styles/designTokens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletNavbar } from '../../components/ImportWallet/ImportWalletNavbar';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';

export type WalletsSortMethod =
  | 'default'
  | 'token-balance'
  | 'last-transaction';

export function EditImportWalletSelection() {
  const [sortMethod, setSortMethod] = useState<WalletsSortMethod>('default');
  const [isAddingWallets, setIsAddingWallets] = useState(false);

  return (
    <>
      <ImportWalletNavbar
        showSortMenu={!isAddingWallets}
        accentColor={globalColors.blue60}
        sortMethod={sortMethod}
        setSortMethod={setSortMethod}
        title={i18n.t('edit_import_wallet_selection.title')}
      />
      <FullScreenContainer>
        <ImportWalletSelectionEdit
          isAddingWallets={isAddingWallets}
          sortMethod={sortMethod}
          setIsAddingWallets={setIsAddingWallets}
          onboarding
        />
      </FullScreenContainer>
    </>
  );
}
