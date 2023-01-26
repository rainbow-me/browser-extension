import React from 'react';

import { Box } from '~/design-system';

import { ImportWalletSelection } from '../../components/ImportWallet/ImportWalletSelection';

const NewImportWalletSelection = () => {
  //   const navigate = useRainbowNavigate();

  return (
    <Box
      height="full"
      paddingHorizontal="20px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <ImportWalletSelection />
    </Box>
  );
};

export { NewImportWalletSelection };
