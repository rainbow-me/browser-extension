import React, { useEffect, useState } from 'react';

import { RAINBOW_WAITLIST_URL } from '~/core/references/links';
import { Bleed, Box, Button, Inline, Stack, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import * as wallet from '../../handlers/wallet';

export function InviteCodePortal({
  onInviteCodeValidated,
}: {
  onInviteCodeValidated: () => void;
}) {
  const [inviteCode, setInviteCode] = useState('');

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
    <Box paddingTop="32px">
      <Stack space="16px">
        {/* all of these margins and paddings were needed for the animations we have */}
        {/* AnimatePresence was messing up with position absolute */}
        <Box style={{ height: '44px' }} width="full">
          <Box position="absolute" style={{ width: '310px' }}>
            <Input
              height="44px"
              placeholder="Enter your beta code"
              variant="bordered"
              borderColor="accent"
              onChange={(value) => setInviteCode(value.target.value)}
              value={inviteCode}
              style={{
                paddingRight: 87,
                paddingTop: 17,
                paddingBottom: 17,
                paddingLeft: 16,
                caretColor: accentColorAsHsl,
                fontSize: 14,
              }}
            />
          </Box>
          <Box style={{ marginLeft: '227px' }}>
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
        </Box>

        <Box paddingHorizontal="16px">
          <Text
            align="center"
            color="labelTertiary"
            size="12pt"
            weight="semibold"
          >
            {
              'Rainbow is currently in a private beta stage and an invite code is required to gain access. If you need one, you can'
            }
            &nbsp;
            <a
              href={RAINBOW_WAITLIST_URL}
              target="_blank"
              style={{ color: accentColorAsHsl }}
              rel="noreferrer"
            >
              {'get one here'}
            </a>
            {'.'}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
