import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
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
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { animatedRouteTransitionConfig } from '~/design-system/styles/designTokens';

export const ConfirmPasswordPrompt = ({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const transition = animatedRouteTransitionConfig['base'];
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
    <AnimatePresence>
      {show && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          backdropFilter="blur(26px)"
          padding="40px"
        >
          <Rows alignVertical="center">
            <Row height="content">
              <Box
                as={motion.div}
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={transition}
                padding="12px"
                background="surfaceMenu"
                borderRadius="12px"
              >
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
                    <Inline space="8px" alignHorizontal="center">
                      <Button
                        variant="flat"
                        height="44px"
                        color="fillSecondary"
                        onClick={onClose}
                      >
                        {i18n.t('common_actions.cancel')}
                      </Button>
                      <Button
                        variant="flat"
                        height="44px"
                        color="accent"
                        onClick={handleValidatePassword}
                      >
                        {i18n.t('common_actions.continue')}
                      </Button>
                    </Inline>
                  </Row>
                </Rows>
              </Box>
            </Row>
          </Rows>
        </Box>
      )}
    </AnimatePresence>
  );
};
