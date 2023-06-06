import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import ledgerLogo from 'static/assets/hw/ledger-logo.png';
import trezorLogo from 'static/assets/hw/trezor-logo.png';
import { i18n } from '~/core/languages';
import { POPUP_URL, goToNewTab } from '~/core/utils/tabs';
import { Box } from '~/design-system';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';

import { OnboardMenu } from '../../components/OnboardMenu/OnboardMenu';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { ROUTES } from '../../urls';

export function ChooseHW() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();
  const isFullScreen = useIsFullScreen();

  const handleLedgerChoice = useCallback(() => {
    navigate(ROUTES.HW_LEDGER, {
      state: { direction: state?.direction, navbarIcon: state?.navbarIcon },
    });
  }, [navigate, state]);

  const handleTrezorChoice = useCallback(() => {
    if (!isFullScreen) {
      goToNewTab({
        url: POPUP_URL + `#${ROUTES.HW_TREZOR}`,
      });
    } else {
      navigate(ROUTES.HW_TREZOR, {
        state: { direction: state?.direction, navbarIcon: state?.navbarIcon },
      });
    }
  }, [isFullScreen, navigate, state]);

  return (
    <Box height="full">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingHorizontal="20px"
        paddingBottom="20px"
        height="full"
      >
        <OnboardMenu>
          <OnboardMenu.Item
            titleImage={<img src={ledgerLogo} width="90" height="30" />}
            onClick={handleLedgerChoice}
            subtitle={i18n.t('hw.ledger_support')}
          />
          <OnboardMenu.Separator />
          <OnboardMenu.Item
            titleImage={<img src={trezorLogo} width="95" height="24 " />}
            onClick={handleTrezorChoice}
            subtitle={i18n.t('hw.trezor_support')}
          />
        </OnboardMenu>
      </Box>
    </Box>
  );
}
