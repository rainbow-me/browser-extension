import { Options, passwordStrength } from 'check-password-strength';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolName, TextColor } from '~/design-system/styles/designTokens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { updatePassword } from '../../handlers/wallet';
import { ROUTES } from '../../urls';

const strengthMeta = [
  {
    text: i18n.t('passwords.too_weak'),
    color: 'orange',
    symbol: 'exclamationmark.triangle.fill',
  },
  {
    text: i18n.t('passwords.weak'),
    color: 'orange',
    symbol: 'exclamationmark.triangle.fill',
  },
  {
    text: i18n.t('passwords.strong'),
    color: 'green',
    symbol: 'checkmark.shield.fill',
  },
];

const passwordStrengthOptions = [
  {
    id: 0,
    value: 'Too weak',
    minDiversity: 0,
    minLength: 0,
  },
  {
    id: 1,
    value: 'Weak',
    minDiversity: 0,
    minLength: 8,
  },
  {
    id: 2,
    value: 'Strong',
    minDiversity: 4,
    minLength: 8,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
] as Options;

const getPasswordStrength = (password: string) => {
  return passwordStrength(password, passwordStrengthOptions).id;
};

export function CreatePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [strength, setStrength] = useState<number | null>(null);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isMatching, setIsMatching] = useState<boolean | null>(null);

  // Check if passwords match
  const checkIfPasswordsMatch = useCallback(() => {
    if (
      newPassword.length > 0 &&
      newPassword.length === confirmNewPassword.length
    ) {
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

  const handleSetPassword = async () => {
    if (!isValid) return;
    await updatePassword('', newPassword);
    navigate(ROUTES.READY);
  };

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="transparent"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('create_password.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('create_password.description')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box paddingTop="28px" width="full">
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
                      {i18n.t('passwords.password')}
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
                  placeholder={i18n.t('passwords.password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                <Rows>
                  <Row>
                    <PasswordInput
                      placeholder={i18n.t('passwords.password')}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      onBlur={handleOnBlur}
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
      </Box>
      <Box width="full" style={{ paddingTop: '210px' }}>
        <Rows alignVertical="top" space="8px">
          <Button
            color={isValid && isMatching ? 'accent' : 'labelQuaternary'}
            height="44px"
            variant={isValid && isMatching ? 'flat' : 'disabled'}
            width="full"
            onClick={handleSetPassword}
          >
            {i18n.t('passwords.set_password')}
          </Button>
        </Rows>
      </Box>
    </FullScreenContainer>
  );
}
