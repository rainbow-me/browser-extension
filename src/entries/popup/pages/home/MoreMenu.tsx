import * as React from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import {
  RAINBOW_FEEDBACK_URL,
  RAINBOW_SUPPORT_URL,
} from '~/core/references/links';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';
import { Box, Inline, Row, Rows, Stack, Symbol, Text } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '../../components/HomeMenuRow/HomeMenuRow';
import { MenuItem } from '../../components/Menu/MenuItem';
import { ShortcutHint } from '../../components/ShortcutHint/ShortcutHint';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import playSound from '../../utils/playSound';

export const MoreMenu = ({ children }: { children: React.ReactNode }) => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });
  const navigate = useRainbowNavigate();
  const { testnetMode, setTestnetMode } = useTestnetModeStore();
  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();

  const openProfile = React.useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  const handleTestnetMode = React.useCallback(() => {
    if (developerToolsEnabled) {
      setTestnetMode(!testnetMode);
    }
  }, [setTestnetMode, testnetMode, developerToolsEnabled]);

  const onValueChange = React.useCallback(
    (
      value:
        | 'settings'
        | 'profile'
        | 'lock'
        | 'qr-code'
        | 'support'
        | 'feedback'
        | 'testnet-mode',
    ) => {
      switch (value) {
        case 'settings':
          navigate(ROUTES.SETTINGS);
          break;
        case 'profile':
          openProfile();
          break;
        case 'lock':
          playSound('LockSound');
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
        case 'testnet-mode':
          handleTestnetMode();
          break;
      }
    },
    [navigate, openProfile, handleTestnetMode],
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
                <HomeMenuRow
                  testId="settings-link"
                  leftComponent={
                    <Symbol
                      size={12}
                      symbol="gearshape.fill"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('menu.home_header_right.settings')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint
                      hint={shortcuts.home.GO_TO_SETTINGS.display}
                    />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="qr-code">
                <HomeMenuRow
                  testId="qr-code"
                  leftComponent={
                    <Symbol size={12} symbol="qrcode" weight="semibold" />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('menu.home_header_right.qr_code')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.home.GO_TO_QR.display} />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="lock">
                <HomeMenuRow
                  testId="lock"
                  leftComponent={
                    <Symbol size={12} symbol="lock.fill" weight="semibold" />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('menu.home_header_right.lock_rainbow')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.home.LOCK.display} />
                  }
                />
              </DropdownMenuRadioItem>
              {(developerToolsEnabled || testnetMode) && (
                <DropdownMenuRadioItem
                  highlightAccentColor
                  value="testnet-mode"
                >
                  <HomeMenuRow
                    testId="testnet-mode"
                    leftComponent={
                      <Box marginLeft="-2px" marginRight="-2px">
                        <MenuItem.TextIcon icon="🕹" />
                      </Box>
                    }
                    centerComponent={
                      <Rows space="6px">
                        <Row>
                          <Text size="14pt" weight="semibold">
                            {i18n.t('menu.home_header_right.testnet_mode')}
                          </Text>
                        </Row>
                        <Row>
                          <Text
                            size="11pt"
                            color="labelTertiary"
                            weight="medium"
                          >
                            {testnetMode
                              ? i18n.t('menu.home_header_right.testnet_mode_on')
                              : i18n.t(
                                  'menu.home_header_right.testnet_mode_off',
                                )}
                          </Text>
                        </Row>
                      </Rows>
                    }
                    rightComponent={
                      <ShortcutHint
                        hint={shortcuts.home.TESTNET_MODE.display}
                      />
                    }
                  />
                </DropdownMenuRadioItem>
              )}
            </Stack>
            <Stack space="4px">
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem highlightAccentColor value="profile">
                <Box width="full">
                  <Inline
                    alignVertical="center"
                    alignHorizontal="justify"
                    space="4px"
                  >
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
                  <Inline
                    alignVertical="center"
                    alignHorizontal="justify"
                    space="4px"
                  >
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
                  <Inline
                    alignVertical="center"
                    alignHorizontal="justify"
                    space="4px"
                  >
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
