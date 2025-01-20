import React, { SetStateAction, useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { Box, Button, Inline, Separator, Symbol, Text } from '~/design-system';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { RainbowError, logger } from '~/logger';

import { FlyingRainbows } from '../../components/FlyingRainbows/FlyingRainbows';
import { PasswordInput } from '../../components/PasswordInput/PasswordInput';
import { Spinner } from '../../components/Spinner/Spinner';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import playSound from '../../utils/playSound';
import { AvatarSection } from '../home/Header';

export function Unlock() {
  const [password, setPassword] = useState('');
  const navigate = useRainbowNavigate();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onToggleVisibility = useCallback(() => setVisible(!visible), [visible]);

  const handlePasswordChange = useCallback(
    (event: { target: { value: SetStateAction<string> } }) => {
      setPassword(event.target.value);
      if (error) {
        setError('');
      }
    },
    [error],
  );

  const handleUnlock = useCallback(async () => {
    setLoading(true);
    try {
      if (await wallet.unlock(password)) {
        playSound('UnlockSound');
        navigate(ROUTES.HOME);
      } else {
        setError(i18n.t('passwords.wrong_password'));
        setLoading(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e) {
      logger.info('Unlock error: exception while trying to unlock');
      logger.error(e as RainbowError);
      setLoading(false);
    }
  }, [navigate, password]);

  return (
    <FlyingRainbows>
      <Box
        width="full"
        style={{ zIndex: 1, paddingTop: 125 }}
        background="transparent"
      >
        <Box
          width="full"
          display="flex"
          borderColor="separatorSecondary"
          borderWidth="1px"
          borderRadius="32px"
          paddingHorizontal="16px"
          paddingVertical="24px"
          flexDirection="column"
          background="surfacePrimaryElevatedSecondary"
          style={{
            backdropFilter: 'blur(26px)',
          }}
        >
          <Box
            width="full"
            justifyContent="center"
            alignItems="center"
            display="flex"
            flexDirection="column"
          >
            <Box width="fit" paddingBottom="24px">
              <AvatarSection />
            </Box>
            <Box width="fit" paddingBottom="10px">
              <Text align="center" color="label" size="16pt" weight="bold">
                {i18n.t('unlock.welcome_back')}
              </Text>
            </Box>
            <Box width="full">
              <Text
                align="center"
                color="labelTertiary"
                size="12pt"
                weight="regular"
              >
                {i18n.t('unlock.enter_password')}
              </Text>
            </Box>

            <Box width="full" padding="24px" style={{ width: '106px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
            <Box width="full" paddingBottom="10px" position="relative">
              {error !== '' && (
                <Box width="full" display="flex" justifyContent="center">
                  <Box position="absolute" width="fit" marginTop="-20px">
                    <Inline space="16px">
                      <Symbol
                        symbol="exclamationmark.triangle.fill"
                        color="red"
                        size={11}
                        weight="regular"
                      />
                      <Box marginLeft="-14px" paddingTop="2px">
                        <Text color="red" size="11pt" weight="regular">
                          {error}
                        </Text>
                      </Box>
                    </Inline>
                  </Box>
                </Box>
              )}
              <PasswordInput
                placeholder={i18n.t('passwords.password')}
                value={password}
                onChange={handlePasswordChange}
                borderColor={error !== '' ? 'red' : 'accent'}
                testId="password-input"
                onSubmit={handleUnlock}
                onToggleVisibility={onToggleVisibility}
                tabIndex={1}
                autoFocus
                visible={visible}
                style={{
                  caretColor: accentColorAsHsl,
                }}
              />
            </Box>
            <Box width="fit">
              {loading ? (
                <Button
                  color="accent"
                  height="36px"
                  variant="flat"
                  width="full"
                  onClick={handleUnlock}
                  testId="unlock-button"
                  tabIndex={2}
                >
                  <Inline space="6px" alignVertical="center">
                    <Text color="label" size="16pt" weight="bold">
                      {i18n.t('unlock.unlock')}
                    </Text>
                    <Spinner size={16} color="label" />
                  </Inline>
                </Button>
              ) : (
                <Button
                  color="accent"
                  height="36px"
                  variant="flat"
                  width="full"
                  symbol="arrow.right"
                  symbolSide="right"
                  onClick={handleUnlock}
                  testId="unlock-button"
                  tabIndex={2}
                >
                  {i18n.t('unlock.unlock')}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        <Box width="full" style={{ marginTop: '109px' }}>
          <Box display="flex" width="fit" style={{ margin: 'auto' }}>
            <Text
              align="center"
              color="labelTertiary"
              size="12pt"
              weight="regular"
              as="p"
            >
              {i18n.t('unlock.having_trouble')} <br />
              {i18n.t('unlock.contact')}&nbsp;
              <a
                href="https://x.com/rainbowdotme"
                target="_blank"
                style={{ color: accentColorAsHsl, cursor: 'pointer' }}
                rel="noreferrer"
              >
                {i18n.t('unlock.rainbow_support')}
              </a>
            </Text>
          </Box>
        </Box>
      </Box>
    </FlyingRainbows>
  );
}
