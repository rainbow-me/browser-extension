import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { truncateAddress } from '~/core/utils/address';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';

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

  const handleValidateWalletName = useCallback(() => {
    if (account && newWalletName !== '') {
      saveWalletName({ address: account, name: newWalletName });
      onClose();
      return;
    }
    setError(i18n.t('errors.no_wallet_name_set'));
  }, [account, newWalletName, onClose, saveWalletName]);

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

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleValidateWalletName();
      }
    },
    [handleValidateWalletName],
  );

  return (
    <Prompt show={show}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {i18n.t('rename_wallet_prompt.rename_wallet')}
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
                      {account && (
                        <WalletAvatar
                          address={account}
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
                            'settings.privacy_and_security.wallets_and_keys.new_wallet.input_placeholder',
                          )}
                          value={newWalletName}
                          onChange={(e) => setNewWalletName(e.target.value)}
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
                            {truncateAddress(account)}
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
            <Columns space="8px">
              <Column>
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
              </Column>
              <Column>
                <Button
                  variant="flat"
                  height="36px"
                  color="accent"
                  onClick={handleValidateWalletName}
                  width="full"
                  borderRadius="9px"
                  tabIndex={2}
                >
                  {i18n.t('rename_wallet_prompt.update')}
                </Button>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
