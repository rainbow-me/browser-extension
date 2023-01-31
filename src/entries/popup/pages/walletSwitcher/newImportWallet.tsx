import React from 'react';

import { Box } from '~/design-system';

import { ImportWallet } from '../../components/ImportWallet/ImportWallet';

const NewImportWallet = () => {
  return (
    <Box
      height="full"
      paddingHorizontal="20px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <ImportWallet />
    </Box>
  );
};

export { NewImportWallet };
