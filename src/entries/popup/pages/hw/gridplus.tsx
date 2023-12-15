import { AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import gridPlusLogo from 'static/assets/hw/grid-plus-logo.png';
import { Box } from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

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
  onFinish,
}: {
  step: GridplusStep;
  setStep: (step: GridplusStep) => void;
  onFinish: (addresses: string[]) => void;
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
      return <AddressChoice onSelected={onFinish} />;
    default:
      return null;
  }
};

export function ConnectGridPlus() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [gridplusStep, setGridplusStep] = useState<GridplusStep>(
    GridplusStep.WALLET_CREDENTIALS,
  );
  const onFinish = (addresses: string[]) => {
    const accountsToImport = addresses.map((address, i) => ({
      address,
      index: i,
    }));
    navigate(ROUTES.HW_WALLET_LIST, {
      state: {
        accountsToImport,
        deviceId: 'Test',
        accountsEnabled: accountsToImport.length,
        vendor: 'GridPlus',
        direction: state?.direction,
        navbarIcon: state?.navbarIcon,
      },
    });
  };
  return (
    <FullScreenContainer>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="32px"
        width="full"
      >
        <img src={gridPlusLogo} width={80} />
        <AnimatePresence initial={false}>
          <GridPlusRouting
            step={gridplusStep}
            setStep={setGridplusStep}
            onFinish={onFinish}
          />
        </AnimatePresence>
      </Box>
    </FullScreenContainer>
  );
}
