import React, { useEffect } from 'react';

import { i18n } from '~/core/languages';
import { Bleed, Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';
import * as wallet from '../../handlers/wallet';

export function InviteCodePortal({
  onInviteCodeValidated,
}: {
  onInviteCodeValidated: () => void;
}) {
  useEffect(() => {
    const wipeIncompleteWallet = async () => {
      const { hasVault } = await wallet.getStatus();
      if (hasVault) {
        wallet.wipe();
      }
    };
    wipeIncompleteWallet();
  }, []);

  const inviteCodeValidated = React.useCallback(async () => {
    onInviteCodeValidated();
  }, [onInviteCodeValidated]);

  return (
    <Box width="full" style={{ zIndex: 1 }}>
      <Box style={{ marginTop: 135 }}>
        <Stack space="4px">
          <Box width="full" display="flex" justifyContent="center">
            <LogoWithLetters color="label" />
          </Box>
          <Box
            width="full"
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <Text
              align="center"
              color="labelTertiary"
              size="16pt"
              weight="bold"
            >
              {i18n.t('welcome.subtitle')}
            </Text>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Inline>
          <Input
            height="44px"
            placeholder="Enter your beta code"
            variant="bordered"
            borderColor="accent"
            style={{
              paddingRight: 87,
              caretColor: accentColorAsHsl,
            }}
          />
          <Box position="absolute" style={{ right: '24px' }}>
            <Box padding="7px">
              <Button
                onClick={inviteCodeValidated}
                color="fillSecondary"
                height="30px"
                borderRadius="6px"
                variant="raised"
              >
                <Inline alignVertical="center" space="6px">
                  <Text align="center" color="label" size="14pt" weight="heavy">
                    {'Join'}
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
        </Inline>
      </Box>
    </Box>
  );
}
