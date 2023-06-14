import { Box } from '~/design-system';

import { ImportWalletSelection } from '../../components/ImportWallet/ImportWalletSelection';

const NewImportWalletSelection = () => {
  return (
    <Box
      height="full"
      paddingHorizontal="16px"
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
