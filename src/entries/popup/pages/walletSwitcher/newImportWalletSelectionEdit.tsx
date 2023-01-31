import React from 'react';

import { Box } from '~/design-system';

import { ImportWalletSelectionEdit } from '../../components/ImportWallet/ImportWalletSelectionEdit';

const NewImportWalletSelectionEdit = () => {
  return (
    <Box
      height="full"
      paddingHorizontal="20px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <ImportWalletSelectionEdit />
    </Box>
  );
};

export { NewImportWalletSelectionEdit };
