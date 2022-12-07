import React from 'react';
import { useNavigate } from 'react-router-dom';

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
import { Input } from '~/design-system/components/Input/Input';
import { dangerouslyUpdatePassword } from '~/entries/popup/handlers/wallet';

export function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  const handleUpdatePassword = async () => {
    if (newPassword === '') {
      // TODO: below will be replaced by PasswordInput error msg
      alert('Password is empty');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      // TODO: below will be replaced by PasswordInput error msg
      alert('Passwords do not match');
      return;
    }
    await dangerouslyUpdatePassword(newPassword);
    alert('Password updated');
    navigate('/settings/privacy');
  };
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
                {/* TODO: switch for password input */}
                <Input
                  height="40px"
                  placeholder="Password"
                  variant="bordered"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                {/* TODO: switch for password input */}
                <Input
                  height="40px"
                  placeholder={i18n.t(
                    'settings.privacy_and_security.change_password.inputPlaceholder',
                  )}
                  variant="bordered"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </Row>
            </Rows>
          </Row>
        </Rows>
        <Row>
          <Box paddingVertical="20px" paddingTop="104px">
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
