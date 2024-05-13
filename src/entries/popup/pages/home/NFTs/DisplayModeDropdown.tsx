import { useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useNftsStore } from '~/core/state/nfts';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { HomeMenuRow } from '~/entries/popup/components/HomeMenuRow/HomeMenuRow';
import { ShortcutHint } from '~/entries/popup/components/ShortcutHint/ShortcutHint';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import { gradientBorderDark, gradientBorderLight } from './NFTs.css';

export default function DisplayModeDropdown() {
  const displayMode = useNftsStore.use.displayMode();
  const setNftDisplayMode = useNftsStore.use.setNftDisplayMode();

  const onValueChange = useCallback(
    (value: typeof displayMode) => {
      setNftDisplayMode(value);
    },
    [setNftDisplayMode],
  );
  const currentTheme = useCurrentThemeStore.use.currentTheme();
  const [open, setIsOpen] = useState(false);

  useKeyboardShortcut({
    condition: () => open,
    handler: (e) => {
      e.stopImmediatePropagation();
      if (e.key === shortcuts.nfts.DISPLAY_MODE_GROUPED.key) {
        onValueChange('grouped');
        setIsOpen(false);
      } else if (e.key === shortcuts.nfts.DISPLAY_MODE_COLLECTION.key) {
        onValueChange('byCollection');
        setIsOpen(false);
      }
    },
  });

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(openChange) => (!openChange ? setIsOpen(false) : null)}
    >
      <DropdownMenuTrigger asChild>
        <Box onClick={() => setIsOpen(true)}>
          <Lens
            className={
              currentTheme === 'dark' ? gradientBorderDark : gradientBorderLight
            }
            style={{ display: 'flex', alignItems: 'center' }}
            testId={'nfts-displaymode-dropdown'}
          >
            <Box style={{ paddingRight: 7, paddingLeft: 7 }}>
              <Inline alignVertical="center" space="6px">
                <Symbol
                  symbol={
                    displayMode === 'grouped'
                      ? 'square.grid.2x2'
                      : 'checklist.unchecked'
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
          </Lens>
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent marginRight="16px" marginTop="6px">
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
                      hint={shortcuts.nfts.DISPLAY_MODE_GROUPED.display}
                    />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="byCollection">
                <HomeMenuRow
                  leftComponent={
                    <Symbol
                      size={12}
                      symbol="checklist.unchecked"
                      weight="semibold"
                    />
                  }
                  centerComponent={
                    <Text
                      size="14pt"
                      weight="semibold"
                      testId={'nfts-displaymode-option-byCollection'}
                    >
                      {i18n.t('nfts.display_mode_collections')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint
                      hint={shortcuts.nfts.DISPLAY_MODE_COLLECTION.display}
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
