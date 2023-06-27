import React, { KeyboardEvent, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { KeychainWallet } from '~/core/types/keychainTypes';
import { setSettingWallets } from '~/core/utils/settings';
import {
  Box,
  Button,
  Inset,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { add } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export const NewWalletPrompt = ({
  show,
  onClose,
  wallet,
}: {
  show: boolean;
  onClose: () => void;
  wallet: KeychainWallet;
}) => {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();
  const { saveWalletName } = useWalletNamesStore();

  const [walletName, setWalletName] = useState('');

  const handleValidateWalletName = useCallback(async () => {
    const newAccount = await add(wallet?.accounts?.[0]);
    if (walletName && walletName.trim() !== '') {
      saveWalletName({
        name: walletName.trim(),
        address: newAccount,
      });
    }
    setSettingWallets({
      ...wallet,
      accounts: [...wallet.accounts, newAccount],
    });
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
      { state: { account: newAccount, password: state?.password } },
    );
  }, [navigate, saveWalletName, state?.password, wallet, walletName]);

  const handleClose = useCallback(() => {
    setWalletName('');
    onClose();
  }, [onClose]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleValidateWalletName();
      }
    },
    [handleValidateWalletName],
  );

  return (
    <Prompt show={show} handleClose={onClose}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {i18n.t(
                      'settings.privacy_and_security.wallets_and_keys.new_wallet.name_your_wallet',
                    )}
                  </Text>
                </Box>
              </Row>
              <Row>
                <Inset horizontal="104px">
                  <Separator color="separatorTertiary" />
                </Inset>
              </Row>
              <Row>
                <Rows>
                  <Row>
                    <Input
                      placeholder={i18n.t(
                        'settings.privacy_and_security.wallets_and_keys.new_wallet.input_placeholder',
                      )}
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      height="40px"
                      variant="bordered"
                      onKeyDown={onKeyDown}
                      autoFocus
                      tabIndex={1}
                    />
                  </Row>
                </Rows>
              </Row>
            </Rows>
          </Row>
          <Row>
            <Rows space="8px">
              <Row>
                <Button
                  color={'accent'}
                  variant={'flat'}
                  height="36px"
                  onClick={handleValidateWalletName}
                  width="full"
                  borderRadius="9px"
                  tabIndex={2}
                >
                  {i18n.t(
                    'settings.privacy_and_security.wallets_and_keys.new_wallet.create',
                  )}
                </Button>
              </Row>
              <Row>
                <Button
                  variant="flat"
                  height="36px"
                  color="fillSecondary"
                  onClick={handleClose}
                  width="full"
                  borderRadius="9px"
                  tabIndex={3}
                >
                  {i18n.t('common_actions.cancel')}
                </Button>
              </Row>
            </Rows>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
