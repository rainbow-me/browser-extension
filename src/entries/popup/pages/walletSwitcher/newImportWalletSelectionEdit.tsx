import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { Box } from '~/design-system';

import { ImportWalletEditNavbar } from '../../components/ImportWallet/ImportWalletEditNavbar';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';
import { ROUTES } from '../../urls';
import { WalletsSortMethod } from '../importWalletSelection/EditImportWalletSelection';

const NewImportWalletSelectionEdit = () => {
  const [sortMethod, setSortMethod] = useState<WalletsSortMethod>('default');
  const [isAddingWallets, setIsAddingWallets] = useState(false);

  return (
    <>
      <ImportWalletEditNavbar
        backTo={ROUTES.IMPORT__SELECT}
        showSortMenu={!isAddingWallets}
        sortMethod={sortMethod}
        setSortMethod={setSortMethod}
        title={i18n.t('edit_import_wallet_selection.title')}
      />
      <Box
        height="full"
        paddingHorizontal="20px"
        background="surfaceSecondary"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <ImportWalletSelectionEdit
          isAddingWallets={isAddingWallets}
          sortMethod={sortMethod}
          setIsAddingWallets={setIsAddingWallets}
        />
      </Box>
    </>
  );
};

export { NewImportWalletSelectionEdit };
