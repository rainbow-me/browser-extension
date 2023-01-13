import React, { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useWalletNamesStore } from '~/core/state/walletNames';
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

export const RenameWalletPrompt = ({
  show,
  onClose,
  account,
}: {
  show: boolean;
  onClose: () => void;
  account: Address | undefined;
}) => {
  const { walletNames, saveWalletName } = useWalletNamesStore();
  const oldWalletName = (account && walletNames[account]) || '';
  const [newWalletName, setNewWalletName] = useState(oldWalletName);
  const [error, setError] = useState<string | null>(null);

  const handleValidateWalletName = async () => {
    if (account && newWalletName !== '') {
      await saveWalletName({ address: account, name: newWalletName });
      onClose();
      return;
    }
    setError(
      i18n.t(
        'settings.privacy_and_security.wallets_and_keys.new_wallet.no_wallet_name_set',
      ),
    );
  };

  const handleClose = () => {
    setNewWalletName(oldWalletName);
    onClose();
  };

  useEffect(() => {
    setNewWalletName(oldWalletName);
    return () => {
      setNewWalletName(oldWalletName);
    };
  }, [oldWalletName]);

  useEffect(() => {
    setError(null);
  }, [newWalletName]);

  return (
    <Prompt show={show}>
      <Rows space="24px">
        <Row>
          <Rows space="20px">
            <Row>
              <Box paddingTop="12px">
                <Text size="16pt" weight="bold" align="center">
                  Rename Wallet
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
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    height="40px"
                    variant="bordered"
                  />
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
                Rename wallet
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
    </Prompt>
  );
};
