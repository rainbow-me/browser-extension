import { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { KeychainWallet } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { getSettingWallets } from '~/core/utils/settings';
import {
  Box,
  Button,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import * as wallet from '../../handlers/wallet';

export const CreateWalletPrompt = ({
  address,
  show,
  onClose,
  onCancel,
  fromChooseGroup = false,
}: {
  address?: Address;
  show: boolean;
  onClose: () => void;
  onCancel?: () => void;
  fromChooseGroup?: boolean;
}) => {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const saveWalletName = useWalletNamesStore((state) => state.saveWalletName);
  const setCurrentAddress = useCurrentAddressStore(
    (state) => state.setCurrentAddress,
  );
  const [newWallet, setNewWallet] = useState<KeychainWallet | null>();

  useEffect(() => {
    const getWallet = async () => {
      const wallet = await getSettingWallets();
      setNewWallet(wallet);
    };
    getWallet();
  }, []);

  const onCreateWallet = useCallback(async () => {
    if (!address) return;
    const name = walletName.trim();
    if (name) saveWalletName({ name, address });
    setCurrentAddress(address);
    !fromChooseGroup
      ? navigate(ROUTES.HOME, { state: { isBack: true } })
      : navigate(
          ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
          {
            state: {
              newWallet,
              account: address,
              password: state?.password,
              fromChooseGroup: true,
            },
          },
        );
  }, [
    address,
    navigate,
    saveWalletName,
    setCurrentAddress,
    fromChooseGroup,
    state?.password,
    walletName,
    newWallet,
  ]);

  const handleClose = useCallback(async () => {
    setWalletName('');
    setError(null);
    if (address) {
      await wallet.remove(address);
    }
    onClose();
  }, [address, onClose]);

  useEffect(() => {
    setError(null);
  }, [walletName]);

  const handleCancel = useCallback(() => {
    if (onCancel !== undefined) {
      onCancel();
    }
    onCancel?.();
  }, [onCancel]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onCreateWallet();
      }
    },
    [onCreateWallet],
  );

  return (
    <Prompt show={show}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" color="label" align="center">
                    {i18n.t('create_wallet_prompt.title')}
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
                    <Inline alignHorizontal="center">
                      {address && (
                        <WalletAvatar
                          addressOrName={address}
                          size={44}
                          emojiSize="20pt"
                        />
                      )}
                    </Inline>
                  </Row>
                  <Row>
                    <Rows>
                      <Row>
                        <Input
                          testId={'wallet-name-input'}
                          placeholder={i18n.t(
                            'create_wallet_prompt.input_placeholder',
                          )}
                          value={walletName}
                          onChange={(e) => setWalletName(e.target.value)}
                          height="44px"
                          variant="transparent"
                          textAlign="center"
                          autoFocus
                          onKeyDown={onKeyDown}
                          tabIndex={1}
                        />
                      </Row>
                      <Row>
                        <Inline alignHorizontal="center">
                          <Text
                            size="12pt"
                            weight="medium"
                            color="labelTertiary"
                          >
                            {truncateAddress(address)}
                          </Text>
                        </Inline>
                      </Row>
                      {error && (
                        <Row>
                          <Box paddingTop="8px">
                            <Text
                              size="14pt"
                              weight="semibold"
                              align="center"
                              color="red"
                            >
                              {error}
                            </Text>
                          </Box>
                        </Row>
                      )}
                    </Rows>
                  </Row>
                </Rows>
              </Row>
            </Rows>
          </Row>
          <Row>
            <Inset horizontal="104px">
              <Separator color="separatorTertiary" />
            </Inset>
          </Row>
          <Row>
            <Rows space="8px">
              <Row>
                <Button
                  testId={'confirm-name-button'}
                  color="accent"
                  variant="flat"
                  height="36px"
                  onClick={onCreateWallet}
                  width="full"
                  borderRadius="9px"
                  tabIndex={2}
                  symbol="return.left"
                  symbolSide="left"
                  enterCta
                >
                  {i18n.t('create_wallet_prompt.create_wallet')}
                </Button>
              </Row>
              <Row>
                <Button
                  variant="flat"
                  height="36px"
                  color="fillSecondary"
                  onClick={onCancel ? handleCancel : handleClose}
                  width="full"
                  borderRadius="9px"
                  tabIndex={3}
                >
                  {i18n.t('common_actions.back')}
                </Button>
              </Row>
            </Rows>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
