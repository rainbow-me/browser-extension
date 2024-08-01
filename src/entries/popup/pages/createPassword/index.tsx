import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolName, TextColor } from '~/design-system/styles/designTokens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { updatePassword } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { getPasswordStrength, strengthMeta } from '../../utils/passwords';
import { OnboardBeforeConnectSheet } from '../welcome/OnboardBeforeConnectSheet';

export function CreatePassword() {
  const navigate = useRainbowNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [strength, setStrength] = useState<number | null>(null);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isMatching, setIsMatching] = useState<boolean | null>(null);
  const [entriesVisible, setEntriesVisible] = useState(false);
  const { state } = useLocation();

  const [showOnboardBeforeConnectSheet, setShowOnboardBeforeConnectSheet] =
    useState(state?.pendingRequest);

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

  const onToggleVisibility = () => setEntriesVisible(!entriesVisible);

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

  const handleSetPassword = useCallback(async () => {
    if (!isValid || !isMatching) return;
    await updatePassword('', newPassword);
    await removeImportWalletSecrets();
    navigate(ROUTES.READY);
  }, [isMatching, isValid, navigate, newPassword]);

  const showSoftAlert = strength !== null && strength > 0 && strength < 3;

  return (
    <>
      <OnboardBeforeConnectSheet
        show={showOnboardBeforeConnectSheet}
        onClick={() => setShowOnboardBeforeConnectSheet(false)}
      />
      <FullScreenContainer>
        <Rows alignVertical="justify">
          <Row height="content">
            <Stack space="24px" alignHorizontal="center">
              <Stack space="12px" alignHorizontal="center">
                <Text size="16pt" weight="bold" color="label" align="center">
                  {i18n.t('create_password.title')}
                </Text>
                <Box paddingHorizontal="15px">
                  <Text
                    size="12pt"
                    weight="regular"
                    color="labelTertiary"
                    align="center"
                  >
                    {i18n.t('create_password.description')}
                  </Text>
                </Box>
              </Stack>
              <Box width="full" style={{ width: '106px' }}>
                <Separator color="separatorTertiary" strokeWeight="1px" />
              </Box>
            </Stack>

            <Box paddingTop="24px" width="full">
              <Rows space="20px">
                <Row>
                  <Rows space="12px">
                    <Row>
                      <Box paddingHorizontal="12px">
                        <Inline
                          wrap={false}
                          alignVertical="center"
                          alignHorizontal="justify"
                          space="16px"
                        >
                          <Text size="14pt" weight="medium">
                            {i18n.t('passwords.password')}
                          </Text>

                          <Inline
                            space="2px"
                            wrap={false}
                            alignVertical="center"
                          >
                            <Text
                              size="14pt"
                              weight="regular"
                              color={
                                (strength &&
                                  (strengthMeta[strength as number]
                                    .color as TextColor)) ||
                                'labelTertiary'
                              }
                            >
                              {(strength && strengthMeta[strength].text) ||
                                i18n.t('passwords.8_chars_min')}
                            </Text>
                            {strength && strengthMeta[strength].symbol ? (
                              <>
                                <Box style={{ width: 1 }} />
                                <Symbol
                                  symbol={
                                    strengthMeta[strength].symbol as SymbolName
                                  }
                                  size={14}
                                  color={
                                    strengthMeta[strength].color as TextColor
                                  }
                                  weight={'bold'}
                                />
                              </>
                            ) : (
                              <Box style={{ height: 14 }} />
                            )}
                          </Inline>
                        </Inline>
                      </Box>
                    </Row>
                    <Row>
                      <PasswordInput
                        placeholder={i18n.t('passwords.password')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        testId="password-input"
                        onSubmit={handleSetPassword}
                        onToggleVisibility={onToggleVisibility}
                        tabIndex={1}
                        autoFocus
                        visible={entriesVisible}
                      />
                    </Row>
                  </Rows>
                </Row>
                <Row>
                  <Rows space="12px">
                    <Row>
                      <Box paddingHorizontal="12px">
                        <Text size="14pt" weight="medium">
                          {i18n.t('passwords.confirm_password')}
                        </Text>
                      </Box>
                    </Row>
                    <Row>
                      <Rows space="12px">
                        <Row>
                          <PasswordInput
                            placeholder={i18n.t('passwords.password')}
                            value={confirmNewPassword}
                            onChange={(e) =>
                              setConfirmNewPassword(e.target.value)
                            }
                            onBlur={handleOnBlur}
                            testId="confirm-password-input"
                            onSubmit={handleSetPassword}
                            onToggleVisibility={onToggleVisibility}
                            tabIndex={2}
                            visible={entriesVisible}
                          />
                        </Row>
                        <Row>
                          <Box paddingHorizontal="12px">
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
            </Box>
          </Row>
          <Row height="content">
            <Box width="full" paddingBottom="20px">
              <Rows alignVertical="top" space="20px">
                {showSoftAlert && (
                  <Box
                    padding="10px"
                    background="surfaceSecondaryElevated"
                    borderRadius="8px"
                    borderWidth="1px"
                    borderColor="separatorSecondary"
                  >
                    <Inline space="8px" wrap={false} alignVertical="center">
                      <Box width="fit">
                        <Symbol
                          symbol={strengthMeta[strength].symbol as SymbolName}
                          size={25}
                          color={strengthMeta[strength].color as TextColor}
                          weight={'bold'}
                        />
                      </Box>
                      <Box>
                        <Text size="12pt" weight="regular">
                          {strength === 1
                            ? i18n.t('passwords.try_another_password_weak')
                            : i18n.t('passwords.try_another_password_common')}
                        </Text>
                      </Box>
                    </Inline>
                  </Box>
                )}
                <Button
                  color={isValid && isMatching ? 'accent' : 'labelQuaternary'}
                  height="44px"
                  variant={isValid && isMatching ? 'flat' : 'disabled'}
                  width="full"
                  onClick={handleSetPassword}
                  testId="set-password-button"
                  tabIndex={3}
                >
                  {i18n.t('passwords.set_password')}
                </Button>
              </Rows>
            </Box>
          </Row>
        </Rows>
      </FullScreenContainer>
    </>
  );
}
