import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { RAINBOW_WAITLIST_URL } from '~/core/references/links';
import { postInviteCode } from '~/core/resources/inviteCode';
import {
  Bleed,
  Box,
  Button,
  Inline,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';

export function InviteCodePortal({
  onInviteCodeValidated,
}: {
  onInviteCodeValidated: (validated: boolean) => void;
}) {
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
    inputRef?.current?.focus();
    const result = await postInviteCode({ code: inviteCode });
    setValidCode(result.valid);
    setTimeout(() => {
      onInviteCodeValidated(result.valid);
    }, 500);
  }, [onInviteCodeValidated, inviteCode]);

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
            <Input
              innerRef={inputRef}
              height="44px"
              placeholder="Enter your beta code"
              variant="bordered"
              borderColor={validCode === false ? 'red' : 'accent'}
              onChange={onInviteCodeChange}
              value={inviteCode}
              style={{
                paddingRight: 87,
                paddingTop: 17,
                paddingBottom: 17,
                paddingLeft: 16,
                caretColor: validCode === false ? 'red' : accentColorAsHsl,
                fontSize: 14,
              }}
            />
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
                  <Box style={{ rotate: '-90deg' }}>
                    <Bleed vertical="4px" horizontal="4px">
                      <ChevronDown color="label" />
                    </Bleed>
                  </Box>
                </Inline>
              </Button>
            </Box>
          </Box>
        </Box>

        <Box paddingHorizontal="16px">
          <Text
            align="center"
            color="labelTertiary"
            size="12pt"
            weight="semibold"
          >
            {i18n.t('welcome.invite_code_explanation')}
            &nbsp;
            <a
              href={RAINBOW_WAITLIST_URL}
              target="_blank"
              style={{ color: accentColorAsHsl }}
              rel="noreferrer"
            >
              {i18n.t('welcome.invite_code_explanation_link')}
            </a>
            {'.'}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
