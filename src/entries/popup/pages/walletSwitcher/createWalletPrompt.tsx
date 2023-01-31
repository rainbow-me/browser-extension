import React, { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { truncateAddress } from '~/core/utils/address';
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
}: {
  address?: Address;
  show: boolean;
  onClose: () => void;
}) => {
  const navigate = useRainbowNavigate();
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { saveWalletName } = useWalletNamesStore();
  const { setCurrentAddress } = useCurrentAddressStore();

  const handleValidateWalletName = async () => {
    if (address && walletName && walletName.trim() !== '') {
      saveWalletName({
        name: walletName.trim(),
        address,
      });
      setCurrentAddress(address);
      navigate(ROUTES.HOME);
      return;
    }
    setError(i18n.t('errors.no_wallet_name_set'));
  };

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

  return (
    <Prompt show={show}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
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
                          address={address}
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
                          placeholder={i18n.t(
                            'create_wallet_prompt.input_placeholder',
                          )}
                          value={walletName}
                          onChange={(e) => setWalletName(e.target.value)}
                          height="44px"
                          variant="transparent"
                          textAlign="center"
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
                  variant="flat"
                  height="36px"
                  color="accent"
                  onClick={handleValidateWalletName}
                  width="full"
                  borderRadius="9px"
                >
                  {i18n.t('create_wallet_prompt.create_wallet')}
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
