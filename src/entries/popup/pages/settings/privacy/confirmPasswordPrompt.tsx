import React, { useCallback, useEffect, useState } from 'react';
import { NavigateOptions } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Column,
  Columns,
  Inset,
  Row,
  Rows,
  Separator,
  Text,
} from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { PasswordInput } from '~/entries/popup/components/PasswordInput/PasswordInput';
import { verifyPassword } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';

export const ConfirmPasswordPrompt = ({
  show,
  extraState,
  onClose,
  redirect,
  onSuccess,
}: {
  show: boolean;
  extraState?: NavigateOptions['state'];
  onClose: () => void;
  redirect: string;
  onSuccess?: () => void;
}) => {
  const navigate = useRainbowNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const onToggleVisibility = useCallback(() => setVisible(!visible), [visible]);

  const handleValidatePassword = useCallback(async () => {
    const correctPassword = await verifyPassword(password);
    if (correctPassword) {
      onSuccess && onSuccess();
      navigate(redirect, {
        state: { ...extraState, password },
      });
      return;
    }
    setError(i18n.t('passwords.password_incorrect'));
  }, [extraState, navigate, onSuccess, password, redirect]);

  const handleClose = useCallback(() => {
    setPassword('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    setError(null);
  }, [setError, password]);

  useEffect(() => {
    return () => {
      setPassword('');
    };
  }, []);

  return (
    <Prompt handleClose={handleClose} show={show}>
      <Box padding="12px">
        <Rows space="24px">
          <Row>
            <Rows space="20px">
              <Row>
                <Box paddingTop="12px">
                  <Text size="16pt" weight="bold" align="center">
                    {i18n.t(
                      'settings.privacy_and_security.confirm_password.title',
                    )}
                  </Text>
                </Box>
              </Row>
              <Row>
                <Text
                  size="12pt"
                  weight="medium"
                  color="labelTertiary"
                  align="center"
                >
                  {i18n.t(
                    'settings.privacy_and_security.confirm_password.description',
                  )}
                </Text>
              </Row>
              <Row>
                <Inset horizontal="104px">
                  <Separator color="separatorTertiary" />
                </Inset>
              </Row>
              <Row>
                <Rows>
                  <Row>
                    <PasswordInput
                      testId={'password-input'}
                      placeholder={i18n.t('passwords.password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      borderColor={error ? 'red' : undefined}
                      tabIndex={1}
                      onSubmit={handleValidatePassword}
                      onToggleVisibility={onToggleVisibility}
                      autoFocus
                      visible={visible}
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
                  testId={'continue-button'}
                  variant="flat"
                  height="36px"
                  color="accent"
                  onClick={handleValidatePassword}
                  width="full"
                  borderRadius="9px"
                  tabIndex={2}
                >
                  {i18n.t('common_actions.continue')}
                </Button>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
