import { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useNftsStore } from '~/core/state/nfts';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';

import { gradientBorderDark, gradientBorderLight } from './NFTs.css';

export default function DisplayModeDropdown() {
  const { displayMode, setNftDisplayMode } = useNftsStore();
  const onValueChange = useCallback(
    (value: typeof displayMode) => {
      setNftDisplayMode(value);
    },
    [setNftDisplayMode],
  );
  const { currentTheme } = useCurrentThemeStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Box
          className={
            currentTheme === 'dark' ? gradientBorderDark : gradientBorderLight
          }
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Box style={{ paddingRight: 7, paddingLeft: 7 }}>
            <Inline alignVertical="center" space="6px">
              <Symbol
                symbol={
                  displayMode === 'grouped' ? 'square.grid.2x2' : 'list.bullet'
                }
                weight="bold"
                size={13}
                color="labelSecondary"
              />
              <Symbol
                symbol="chevron.down"
                weight="bold"
                size={10}
                color="labelTertiary"
              />
            </Inline>
          </Box>
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          onValueChange={(value) => onValueChange(value as typeof displayMode)}
        >
          <Stack space="4px">
            <Stack>
              <DropdownMenuRadioItem highlightAccentColor value="grouped">
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      size={12}
                      symbol="square.grid.2x2"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('nfts.display_mode_gallery')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint
                      hint={shortcuts.home.GO_TO_SETTINGS.display}
                    />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="byCollection">
                <HomeMenuRow
                  leftComponent={
                    <Symbol size={12} symbol="list.bullet" weight="semibold" />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('nfts.display_mode_collections')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint
                      hint={shortcuts.home.GO_TO_SETTINGS.display}
                    />
                  }
                />
              </DropdownMenuRadioItem>
            </Stack>
          </Stack>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
