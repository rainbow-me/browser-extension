import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';
import { PasswordInput } from '~/entries/popup/components/PasswordInput/PasswordInput';
import { updatePassword } from '~/entries/popup/handlers/wallet';

export function ChangePassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async () => {
    if (newPassword === '') {
      setError('Password not set');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    await updatePassword(state?.currentPassword, newPassword);
    navigate(-1);
  };

  useEffect(() => {
    setError(null);
  }, [setError, newPassword, confirmNewPassword]);
  return (
    <Box
      paddingHorizontal="20px"
      background="surfaceSecondary"
      paddingTop="64px"
      height="full"
    >
      <Rows alignVertical="justify" space="24px">
        <Row height="content">
          <Rows space="24px">
            <Row>
              <Inline alignHorizontal="center">
                <Box
                  borderRadius="round"
                  background="purple"
                  style={{ height: 60, width: 60 }}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Inline
                    alignHorizontal="center"
                    alignVertical="center"
                    height="full"
                  >
                    <Symbol symbol="lock.fill" weight="bold" size={24} />
                  </Inline>
                </Box>
              </Inline>
            </Row>
            <Row>
              <Inline alignHorizontal="center">
                <Text size="16pt" weight="bold">
                  {i18n.t(
                    'settings.privacy_and_security.change_password.header_label',
                  )}
                </Text>
              </Inline>
            </Row>
          </Rows>
        </Row>
        <Inset horizontal="104px">
          <Separator color="separatorTertiary" />
        </Inset>
        <Rows space="24px">
          <Row>
            <Rows space="12px">
              <Row>
                <Text size="14pt" weight="medium">
                  {i18n.t(
                    'settings.privacy_and_security.change_password.new_password',
                  )}
                </Text>
              </Row>
              <Row>
                <PasswordInput
                  placeholder={i18n.t(
                    'settings.privacy_and_security.change_password.new_password',
                  )}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  borderColor={error ? 'red' : undefined}
                />
              </Row>
            </Rows>
          </Row>
          <Row>
            <Rows space="12px">
              <Row>
                <Text size="14pt" weight="medium">
                  {i18n.t(
                    'settings.privacy_and_security.change_password.confirm_password',
                  )}
                </Text>
              </Row>
              <Row>
                <Rows>
                  <Row>
                    <PasswordInput
                      placeholder={i18n.t(
                        'settings.privacy_and_security.change_password.input_placeholder',
                      )}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
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
        </Rows>
        <Row>
          <Box paddingVertical="20px" paddingTop="80px">
            <Rows space="8px">
              <Row>
                <Button
                  color="accent"
                  height="44px"
                  variant="flat"
                  width="full"
                  onClick={handleUpdatePassword}
                >
                  {i18n.t(
                    'settings.privacy_and_security.change_password.update_password',
                  )}
                </Button>
              </Row>
              <Row height="content">
                <Button
                  color="blue"
                  height="44px"
                  variant="transparent"
                  width="full"
                  onClick={() => navigate(-1)}
                >
                  {i18n.t('common_actions.cancel')}
                </Button>
              </Row>
            </Rows>
          </Box>
        </Row>
      </Rows>
    </Box>
  );
}
