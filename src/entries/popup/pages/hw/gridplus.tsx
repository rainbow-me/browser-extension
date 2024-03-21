import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import gridPlusLogo from 'static/assets/hw/grid-plus-logo.png';
import { Box } from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';

import { AddressChoice } from './gridplus/addressChoice';
import { PairingSecret } from './gridplus/pairingSecret';
import { WalletCredentials } from './gridplus/walletCredentials';

enum GridplusStep {
  WALLET_CREDENTIALS = 'WALLET_CREDENTIALS',
  PAIRING_SECRET = 'PAIRING_SECRET',
  ADDRESS_CHOICE = 'ADDRESS_CHOICE',
}

const GridPlusRouting = ({
  step,
  setStep,
}: {
  step: GridplusStep;
  setStep: (step: GridplusStep) => void;
}) => {
  switch (step) {
    case GridplusStep.WALLET_CREDENTIALS:
      return (
        <WalletCredentials
          appName="Rainbow"
          onAfterSetup={(result) =>
            // If wallet is already trusted, user can skip to Address Choice
            result
              ? setStep(GridplusStep.ADDRESS_CHOICE)
              : setStep(GridplusStep.PAIRING_SECRET)
          }
        />
      );
    case GridplusStep.PAIRING_SECRET:
      return (
        <PairingSecret
          onAfterPair={() => setStep(GridplusStep.ADDRESS_CHOICE)}
        />
      );
    case GridplusStep.ADDRESS_CHOICE:
      return <AddressChoice />;
    default:
      return null;
  }
};

export function ConnectGridPlus() {
  const [gridplusStep, setGridplusStep] = useState<GridplusStep>(
    GridplusStep.WALLET_CREDENTIALS,
  );
  return (
    <FullScreenContainer>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        flexGrow="1"
        flexShrink="1"
        gap="32px"
        width="full"
      >
        <img src={gridPlusLogo} width={80} />
        <AnimatePresence initial={false}>
          <GridPlusRouting step={gridplusStep} setStep={setGridplusStep} />
        </AnimatePresence>
      </Box>
    </FullScreenContainer>
  );
}
