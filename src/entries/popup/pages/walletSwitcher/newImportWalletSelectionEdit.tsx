import React, { useState } from 'react';

import { Box } from '~/design-system';

import { ImportWalletEditNavbar } from '../../components/ImportWallet/ImportWalletEditNavbar';
import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';
import { WalletsSortMethod } from '../importWalletSelection/EditImportWalletSelection';

const NewImportWalletSelectionEdit = () => {
  const [sortMethod, setSortMethod] = useState<WalletsSortMethod>('default');
  return (
    <>
      <ImportWalletEditNavbar
        sortMethod={sortMethod}
        setSortMethod={setSortMethod}
      />
      <Box
        height="full"
        paddingHorizontal="20px"
        background="surfaceSecondary"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <ImportWalletSelectionEdit sortMethod={sortMethod} />
      </Box>
    </>
  );
};

export { NewImportWalletSelectionEdit };
