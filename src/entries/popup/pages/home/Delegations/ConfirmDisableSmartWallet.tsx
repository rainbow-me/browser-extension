import { useCallback } from 'react';
import { zeroAddress } from 'viem';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useActivationStatus } from '~/core/resources/delegations/activation';
import { useCurrentAddressStore } from '~/core/state';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
  TextOverflow,
} from '~/design-system';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { SmartWalletLockIcon } from './SmartWalletLockIcon';

export const ConfirmDisableSmartWallet = () => {
  const { currentAddress } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();

  const { disable } = useActivationStatus({
    address: currentAddress || zeroAddress,
  });

  const handleDisable = useCallback(() => {
    if (!currentAddress) return;
    disable();
    navigate(ROUTES.SETTINGS__DELEGATIONS, { replace: true });
  }, [currentAddress, disable, navigate]);

  const handleCancel = useCallback(() => {
    navigate(ROUTES.SETTINGS__DELEGATIONS, { replace: true });
  }, [navigate]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === shortcuts.global.CLOSE.key) {
        handleCancel();
      }
    },
  });

  return (
    <Box
      background="surfaceSecondary"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar
        title={i18n.t('delegations.confirm_disable.title')}
        titleTestId="confirm-disable-smart-wallet-title"
        leftComponent={<Navbar.BackButton onClick={handleCancel} />}
      />

      <Box
        paddingHorizontal="20px"
        paddingVertical="20px"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Stack space="24px" alignHorizontal="center">
          {/* Icon */}
          <SmartWalletLockIcon />

          {/* Title */}
          <Stack space="8px" alignHorizontal="center">
            <Text size="20pt" weight="bold" align="center" color="label">
              {i18n.t('delegations.confirm_disable.title')}
            </Text>
            <Text
              size="14pt"
              weight="regular"
              align="center"
              color="labelSecondary"
            >
              {i18n.t('delegations.confirm_disable.description')}
            </Text>
          </Stack>
        </Stack>
      </Box>

      <Box
        background="surfaceSecondary"
        style={{
          position: 'sticky',
          bottom: 0,
          width: '100%',
        }}
      >
        <Separator color="separatorSecondary" />
        <Box width="full" padding="20px">
          <Rows space="20px" alignVertical="center">
            <Row>
              <Button
                color="blue"
                height="44px"
                variant="flat"
                width="full"
                onClick={handleDisable}
                testId="confirm-disable-smart-wallet-button"
                tabIndex={0}
              >
                <TextOverflow weight="bold" size="16pt" color="label">
                  {i18n.t('delegations.confirm_disable.action')}
                </TextOverflow>
              </Button>
            </Row>
            <Row>
              <Inline alignHorizontal="center">
                <Button
                  color="transparent"
                  height="44px"
                  variant="tinted"
                  onClick={handleCancel}
                  tabIndex={0}
                  width="full"
                >
                  <Text weight="bold" size="16pt" color="labelSecondary">
                    {i18n.t('delegations.confirm_disable.cancel')}
                  </Text>
                </Button>
              </Inline>
            </Row>
          </Rows>
        </Box>
      </Box>
    </Box>
  );
};
