import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
import { SymbolName, TextColor } from '~/design-system/styles/designTokens';
import { PasswordInput } from '~/entries/popup/components/PasswordInput/PasswordInput';
import { updatePassword } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import {
  getPasswordStrength,
  strengthMeta,
} from '~/entries/popup/utils/passwords';

export function ChangePassword() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [strength, setStrength] = useState<number | null>(null);

  const [isValid, setIsValid] = useState(false);
  const [isMatching, setIsMatching] = useState<boolean | null>(null);

  const [entriesVisible, setEntriesVisible] = useState(false);

  const onToggleVisibility = useCallback(
    () => setEntriesVisible(!entriesVisible),
    [entriesVisible],
  );

  // Check if passwords match
  const checkIfPasswordsMatch = useCallback(() => {
    if (newPassword.length > 0) {
      if (newPassword === confirmNewPassword) {
        setIsMatching(true);
        return true;
      } else {
        setIsMatching(false);
        return false;
      }
    } else {
      setIsMatching(null);
      return null;
    }
  }, [confirmNewPassword, newPassword]);

  // Check strength && validity
  useEffect(() => {
    if (newPassword.length > 0) {
      const pwdStrength = getPasswordStrength(newPassword);
      setStrength(pwdStrength);
      if (pwdStrength > 0) {
        checkIfPasswordsMatch();
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      setStrength(null);
      setIsValid(false);
    }
  }, [checkIfPasswordsMatch, confirmNewPassword, isMatching, newPassword]);

  const handleOnBlur = useCallback(() => {
    checkIfPasswordsMatch();
  }, [checkIfPasswordsMatch]);

  const handleUpdatePassword = async () => {
    if (!isValid || !isMatching) return;
    await updatePassword(state?.password, newPassword);
    navigate(-1);
  };

  return (
    <Box paddingHorizontal="20px" paddingTop="64px" height="full">
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
                <Box paddingHorizontal="12px">
                  <Inline
                    wrap={false}
                    alignVertical="center"
                    alignHorizontal="justify"
                    space="5px"
                  >
                    <Text size="14pt" weight="medium">
                      {i18n.t('passwords.new_password')}
                    </Text>

                    <Inline space="2px" wrap={false} alignVertical="center">
                      <Text
                        size="12pt"
                        weight="regular"
                        color={
                          (strength &&
                            (strengthMeta[strength as number]
                              .color as TextColor)) ||
                          'transparent'
                        }
                      >
                        {(strength && strengthMeta[strength].text) || (
                          <>&nbsp;</>
                        )}
                      </Text>
                      {strength && strengthMeta[strength].symbol ? (
                        <Symbol
                          symbol={strengthMeta[strength].symbol as SymbolName}
                          size={12}
                          color={strengthMeta[strength].color as TextColor}
                          weight={'bold'}
                        />
                      ) : (
                        <Symbol
                          symbol={'arrow.down'}
                          size={12}
                          color={'transparent'}
                          weight={'bold'}
                        />
                      )}
                    </Inline>
                  </Inline>
                </Box>
              </Row>
              <Row>
                <PasswordInput
                  testId={'new-password-input'}
                  placeholder={i18n.t('passwords.new_password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  tabIndex={1}
                  onSubmit={handleUpdatePassword}
                  onToggleVisibility={onToggleVisibility}
                  autoFocus
                  visible={entriesVisible}
                />
              </Row>
            </Rows>
          </Row>
          <Row>
            <Rows space="12px">
              <Row>
                <Text size="14pt" weight="medium">
                  {i18n.t('passwords.confirm_password')}
                </Text>
              </Row>
              <Row>
                <Rows>
                  <Row>
                    <PasswordInput
                      testId={'confirm-new-password-input'}
                      placeholder={i18n.t('passwords.password')}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      onBlur={handleOnBlur}
                      tabIndex={2}
                      onToggleVisibility={onToggleVisibility}
                      onSubmit={handleUpdatePassword}
                      visible={entriesVisible}
                    />
                  </Row>
                  <Row>
                    <Box paddingTop="12px" paddingLeft="12px">
                      <Text
                        size="14pt"
                        weight="semibold"
                        align="left"
                        color="labelTertiary"
                      >
                        {confirmNewPassword.length > 0 &&
                        isMatching === false ? (
                          i18n.t('passwords.passwords_do_not_match')
                        ) : (
                          <>&nbsp;</>
                        )}
                      </Text>
                    </Box>
                  </Row>
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
                  color={isValid && isMatching ? 'accent' : 'labelQuaternary'}
                  testId={'update-password'}
                  height="44px"
                  variant={isValid && isMatching ? 'flat' : 'disabled'}
                  width="full"
                  onClick={handleUpdatePassword}
                  tabIndex={3}
                >
                  {i18n.t('passwords.update_password')}
                </Button>
              </Row>
              <Row height="content">
                <Button
                  color="blue"
                  height="44px"
                  variant="transparent"
                  width="full"
                  onClick={() => navigate(-1)}
                  tabIndex={4}
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
