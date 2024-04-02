import React from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import {
  Box,
  Button,
  Inline,
  Inset,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWalletBackups } from '../../hooks/useWalletBackups';
import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';
import { Navbar } from '../Navbar/Navbar';

export const BackupReminder = () => {
  const { showWalletBackupReminder, closeBackupReminder } = useWalletBackups();
  const navigate = useRainbowNavigate();

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        closeBackupReminder();
      }
    },
  });

  return (
    <BottomSheet
      show={showWalletBackupReminder}
      zIndex={zIndexes.APP_CONNECTION_WALLET_SWITCHER}
      onClickOutside={closeBackupReminder}
    >
      <Box id="wallet-backup-reminder-sheet" isModal>
        <Navbar
          leftComponent={
            <Navbar.CloseButton
              onClick={closeBackupReminder}
              variant="transparent"
            />
          }
        />
        <Box marginTop="-65px">
          <Inset horizontal="32px" top="44px" bottom="36px">
            <Stack space="20px">
              <Box paddingBottom="14px">
                <Inline alignHorizontal="center">
                  <Symbol
                    symbol="exclamationmark.circle.fill"
                    size={38}
                    color="red"
                    weight="medium"
                  />
                </Inline>
              </Box>

              <Inset horizontal="30px">
                <Text align="center" color="label" size="20pt" weight="heavy">
                  {i18n.t('wallet_backup_reminder.title')}
                </Text>
              </Inset>
              <Inline alignHorizontal="center">
                <Box style={{ width: '102px' }}>
                  <Separator color="separatorTertiary" strokeWeight="1px" />
                </Box>
              </Inline>

              <Box>
                <Text
                  align="center"
                  color="labelTertiary"
                  size="14pt"
                  weight="regular"
                >
                  {i18n.t('wallet_backup_reminder.description')}
                </Text>
              </Box>
            </Stack>
          </Inset>
          <Inset horizontal="20px" vertical="20px">
            <Stack space="8px">
              <Button
                width="full"
                color="red"
                height="44px"
                variant="flat"
                onClick={() => {
                  closeBackupReminder();
                  navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS, {
                    state: {
                      fromBackupReminder: true,
                    },
                  });
                }}
              >
                <Text align="center" color="label" size="16pt" weight="heavy">
                  {i18n.t('wallet_backup_reminder.button_label_action')}
                </Text>
              </Button>

              <Button
                width="full"
                color="transparent"
                height="44px"
                variant="tinted"
                onClick={closeBackupReminder}
              >
                <Text
                  align="center"
                  color="labelSecondary"
                  size="16pt"
                  weight="bold"
                >
                  {i18n.t('wallet_backup_reminder.button_label_cancel')}
                </Text>
              </Button>
            </Stack>
          </Inset>
        </Box>
      </Box>
    </BottomSheet>
  );
};
