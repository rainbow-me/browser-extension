import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export const ConfirmPasswordPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleValidatePassword = async () => {
    const correctPassword = await verifyPassword(password);
    if (correctPassword) {
      navigate('/settings/privacy/changePassword', {
        state: { currentPassword: password },
      });
      return;
    }
    setError('Password incorrect');
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  useEffect(() => {
    setError(null);
  }, [setError, password]);

  useEffect(() => {
    return () => {
      setPassword('');
    };
  }, []);

  return (
    <Prompt show={show}>
      <Rows space="24px">
        <Row>
          <Rows space="20px">
            <Row>
              <Box paddingTop="12px">
                <Text size="16pt" weight="bold" align="center">
                  {i18n.t(
                    'settings.privacy_and_security.confirmPassword.title',
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
                  'settings.privacy_and_security.confirmPassword.description',
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
                    placeholder={i18n.t(
                      'settings.privacy_and_security.confirmPassword.input_placeholder',
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    borderColor={error ? 'red' : undefined}
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
                height="44px"
                color="fillSecondary"
                onClick={handleClose}
                width="full"
              >
                {i18n.t('common_actions.cancel')}
              </Button>
            </Column>
            <Column>
              <Button
                variant="flat"
                height="44px"
                color="accent"
                onClick={handleValidatePassword}
                width="full"
              >
                {i18n.t('common_actions.continue')}
              </Button>
            </Column>
          </Columns>
        </Row>
      </Rows>
    </Prompt>
  );
};
