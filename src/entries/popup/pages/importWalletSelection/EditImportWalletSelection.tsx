/* eslint-disable no-await-in-loop */
/* eslint-disable no-nested-ternary */
import React from 'react';

import { i18n } from '~/core/languages';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';
import { Navbar } from '../../components/Navbar/Navbar';
import { ROUTES } from '../../urls';

export function EditImportWalletSelection() {
  return (
    <>
      <Navbar
        title={i18n.t('edit_import_wallet_selection.title')}
        background={'surfaceSecondary'}
        leftComponent={
          <Navbar.CloseButton
            maintainLocationState
            backTo={ROUTES.NEW_IMPORT_WALLET_SELECTION}
          />
        }
        // rightComponent={null}
      />
      <FullScreenContainer paddingTop={62}>
        <ImportWalletSelectionEdit />
      </FullScreenContainer>
    </>
  );
}
