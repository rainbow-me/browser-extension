import React, { useState } from 'react';
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
import { Input } from '~/design-system/components/Input/Input';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

export const ConfirmPasswordPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  // TODO: hook up with password check logic
  const handleValidatePassword = () => {
    if (password !== '') {
      navigate('/settings/privacy/changePassword');
      return;
    }
    alert('Password is empty');
  };
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
              {/* TODO: switch to PasswordInput */}
              <Input
                height="40px"
                variant="bordered"
                placeholder={i18n.t(
                  'settings.privacy_and_security.confirmPassword.inputPlaceholder',
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
                onClick={onClose}
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
