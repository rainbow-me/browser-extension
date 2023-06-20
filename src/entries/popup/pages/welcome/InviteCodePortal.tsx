import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { RAINBOW_WAITLIST_URL } from '~/core/references/links';
import { postInviteCode } from '~/core/resources/inviteCode';
import { goToNewTab } from '~/core/utils/tabs';
import {
  AccentColorProvider,
  Bleed,
  Box,
  Button,
  Inline,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { TextLink } from '~/design-system/components/TextLink/TextLink';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { globalColors } from '~/design-system/styles/designTokens';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { Spinner } from '../../components/Spinner/Spinner';

export function InviteCodePortal({
  onInviteCodeValidated,
}: {
  onInviteCodeValidated: (validated: boolean) => void;
}) {
  const [validatingCode, setValidatingCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [validCode, setValidCode] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onInviteCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInviteCode(e.target.value);
      setValidCode(null);
    },
    [],
  );

  const inviteCodeValidated = useCallback(async () => {
    setValidatingCode(true);
    inputRef?.current?.focus();
    try {
      const result = await postInviteCode({ code: inviteCode });
      setValidCode(result.valid);
      if (!result.valid) {
        setValidatingCode(false);
      }
      setTimeout(() => {
        onInviteCodeValidated(result.valid);
      }, 500);
    } catch (e) {
      setValidatingCode(false);
    }
  }, [onInviteCodeValidated, inviteCode]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        if (e.key === 'Enter') {
          inviteCodeValidated();
        }
      },
      [inviteCodeValidated],
    );

  const goToGetCode = useCallback(() => {
    goToNewTab({
      url: RAINBOW_WAITLIST_URL,
      active: false,
    });
  }, []);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <Box
      width="full"
      key="invite-code"
      as={motion.div}
      initial={{
        opacity: 1,
        marginTop: 0,
      }}
      animate={{
        opacity: 1,
        marginTop: 0,
      }}
      exit={{
        opacity: 0,
        marginTop: -51,
      }}
      layout
      paddingTop="32px"
    >
      <Stack space="16px">
        {/* all of these margins and paddings were needed for the animations we have */}
        {/* AnimatePresence was messing up with position absolute */}
        <Box style={{ height: '44px' }} width="full">
          <AnimatePresence initial={false}>
            {validCode === false ? (
              <Box
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="invalid-code-message"
                exit={{ opacity: 0 }}
                position="absolute"
                width="full"
                style={{ width: '310px', marginTop: '-18px' }}
              >
                <Inline
                  alignVertical="center"
                  space="4px"
                  alignHorizontal="center"
                >
                  <Symbol
                    symbol={'exclamationmark.triangle.fill'}
                    color="red"
                    size={12}
                    weight="medium"
                  />
                  <Text align="center" color="red" size="11pt" weight="medium">
                    {i18n.t('welcome.invalid_code')}
                  </Text>
                </Inline>
              </Box>
            ) : null}
          </AnimatePresence>
          <Box position="absolute" style={{ width: '310px' }}>
            <AccentColorProvider
              color={validCode === false ? 'red' : globalColors.blue60}
            >
              <Input
                innerRef={inputRef}
                height="44px"
                placeholder={i18n.t('welcome.enter_code')}
                variant="bordered"
                borderColor={'accent'}
                onChange={onInviteCodeChange}
                value={inviteCode}
                onKeyDown={handleKeyDown}
                style={{
                  paddingRight: 87,
                  paddingTop: 17,
                  paddingBottom: 17,
                  paddingLeft: 16,
                  caretColor: accentColorAsHsl,
                  fontSize: 14,
                }}
              />
            </AccentColorProvider>
          </Box>
          <Box style={{ marginLeft: '227px' }}>
            <Box padding="7px">
              <Button
                onClick={inviteCodeValidated}
                color={validCode ? 'blue' : 'fillSecondary'}
                height="30px"
                borderRadius="6px"
                variant="raised"
              >
                <Inline alignVertical="center" space="6px">
                  <Text align="center" color="label" size="14pt" weight="heavy">
                    {i18n.t('welcome.join')}
                  </Text>
                  {!validatingCode ? (
                    <Box style={{ rotate: '-90deg' }}>
                      <Bleed vertical="4px" horizontal="4px">
                        <ChevronDown color="label" />
                      </Bleed>
                    </Box>
                  ) : (
                    <Spinner size={10} color="label" />
                  )}
                </Inline>
              </Button>
            </Box>
          </Box>
        </Box>

        <Box style={{ zIndex: 100 }} paddingHorizontal="16px">
          <Text
            align="center"
            color="labelTertiary"
            size="12pt"
            weight="semibold"
          >
            {i18n.t('welcome.invite_code_explanation')}
            &nbsp;
            <TextLink onClick={goToGetCode} color="blue">
              {i18n.t('welcome.invite_code_explanation_link')}
            </TextLink>
            {'.'}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
