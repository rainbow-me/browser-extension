import * as React from 'react';
import { useAccount, useEnsName } from 'wagmi';

import LockSound from 'static/assets/audio/ui_lock.mp3';
import { i18n } from '~/core/languages';
import {
  RAINBOW_FEEDBACK_URL,
  RAINBOW_SUPPORT_URL,
} from '~/core/references/links';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export const MoreMenu = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const navigate = useRainbowNavigate();

  const openProfile = React.useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  const onValueChange = React.useCallback(
    (
      value:
        | 'settings'
        | 'profile'
        | 'lock'
        | 'qr-code'
        | 'support'
        | 'feedback',
    ) => {
      switch (value) {
        case 'settings':
          navigate(ROUTES.SETTINGS);
          break;
        case 'profile':
          openProfile();
          break;
        case 'lock':
          new Audio(LockSound).play();
          wallet.lock();
          break;
        case 'qr-code':
          navigate(ROUTES.QR_CODE);
          break;
        case 'support':
          goToNewTab({ url: RAINBOW_SUPPORT_URL });
          break;
        case 'feedback':
          goToNewTab({ url: RAINBOW_FEEDBACK_URL });
          break;
      }
    },
    [navigate, openProfile],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box position="relative" testId="home-page-header-right">
          {children}
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="16px" sideOffset={1}>
        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(
              value as 'settings' | 'profile' | 'support' | 'feedback',
            )
          }
        >
          <Stack space="4px">
            <Stack>
              <DropdownMenuRadioItem highlightAccentColor value="settings">
                <Box testId="settings-link">
                  <Inline alignVertical="center" space="8px">
                    <Symbol
                      size={12}
                      symbol="gearshape.fill"
                      weight="semibold"
                    />
                    <Text size="14pt" weight="semibold">
                      {i18n.t('menu.home_header_right.settings')}
                    </Text>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="qr-code">
                <Inline alignVertical="center" space="8px">
                  <Symbol
                    size={12.75}
                    symbol="person.fill.viewfinder"
                    weight="semibold"
                  />
                  <Text size="14pt" weight="semibold">
                    {i18n.t('menu.home_header_right.qr_code')}
                  </Text>
                </Inline>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="lock">
                <Box testId="lock">
                  <Inline alignVertical="center" space="8px">
                    <Symbol
                      size={12}
                      symbol="lock.open.fill"
                      weight="semibold"
                    />
                    <Text size="14pt" weight="semibold">
                      {i18n.t('menu.home_header_right.lock_rainbow')}
                    </Text>
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
            </Stack>
            <Stack space="4px">
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem highlightAccentColor value="profile">
                <Box width="full">
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px">
                      <Symbol
                        size={12}
                        symbol="person.crop.circle.fill"
                        weight="semibold"
                      />
                      <Text size="14pt" weight="semibold">
                        {i18n.t('menu.home_header_right.rainbow_profile')}
                      </Text>
                    </Inline>
                    <Symbol
                      size={12}
                      symbol="arrow.up.forward.circle"
                      weight="semibold"
                      color="labelTertiary"
                    />
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="support">
                <Box width="full">
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px">
                      <Symbol
                        size={12}
                        symbol="book.closed.fill"
                        weight="semibold"
                      />
                      <Text size="14pt" weight="semibold">
                        {i18n.t('menu.home_header_right.guides_and_support')}
                      </Text>
                    </Inline>
                    <Symbol
                      size={12}
                      symbol="arrow.up.forward.circle"
                      weight="semibold"
                      color="labelTertiary"
                    />
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="feedback">
                <Box width="full">
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="8px">
                      <Symbol
                        size={12}
                        symbol="message.fill"
                        weight="semibold"
                      />
                      <Text size="14pt" weight="semibold">
                        {i18n.t('menu.home_header_right.share_feedback')}
                      </Text>
                    </Inline>
                    <Symbol
                      size={12}
                      symbol="arrow.up.forward.circle"
                      weight="semibold"
                      color="labelTertiary"
                    />
                  </Inline>
                </Box>
              </DropdownMenuRadioItem>
            </Stack>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
