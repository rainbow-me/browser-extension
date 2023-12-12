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

export default function SortdDropdown() {
  const { sort, setNftSort } = useNftsStore();
  const onValueChange = useCallback(
    (value: typeof sort) => {
      setNftSort(value);
    },
    [setNftSort],
  );
  const { currentTheme } = useCurrentThemeStore();
  const [open, setIsOpen] = useState(false);

  useKeyboardShortcut({
    condition: () => open,
    handler: (e) => {
      e.stopImmediatePropagation();
      if (e.key === shortcuts.home.NFT_SORT_RECENT.key) {
        onValueChange('recent');
        setIsOpen(false);
      } else if (e.key === shortcuts.home.NFT_SORT_ABC.key) {
        onValueChange('alphabetical');
        setIsOpen(false);
      }
    },
  });

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(openChange) => !openChange && setIsOpen(false)}
    >
      <DropdownMenuTrigger asChild>
        <Box onClick={() => setIsOpen(true)}>
          <Lens
            className={
              currentTheme === 'dark' ? gradientBorderDark : gradientBorderLight
            }
            style={{ display: 'flex', alignItems: 'center' }}
            testId={'nfts-sort-dropdown'}
          >
            <Box style={{ paddingRight: 7, paddingLeft: 7 }}>
              <Inline alignVertical="center" space="6px">
                <Symbol
                  symbol={sort === 'recent' ? 'clock' : 'list.bullet'}
                  weight="bold"
                  size={13}
                  color="labelSecondary"
                />
                <Text weight="bold" size="14pt" color="label">
                  {sort === 'recent'
                    ? i18n.t('nfts.sort_option_recent')
                    : i18n.t('nfts.sort_option_abc')}
                </Text>
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
          onValueChange={(value) => onValueChange(value as typeof sort)}
        >
          <Stack space="4px">
            <Stack>
              <DropdownMenuRadioItem highlightAccentColor value="recent">
                <HomeMenuRow
                  leftComponent={
                    <Symbol size={12} symbol="clock" weight="semibold" />
                  }
                  centerComponent={
                    <Text size="14pt" weight="semibold">
                      {i18n.t('nfts.sort_option_recent_long')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint
                      hint={shortcuts.home.NFT_SORT_RECENT.display}
                    />
                  }
                />
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem highlightAccentColor value="alphabetical">
                <HomeMenuRow
                  leftComponent={
                    <Symbol size={12} symbol="list.bullet" weight="semibold" />
                  }
                  centerComponent={
                    <Text
                      size="14pt"
                      weight="semibold"
                      testId={'nfts-sort-option-abc'}
                    >
                      {i18n.t('nfts.sort_option_abc_long')}
                    </Text>
                  }
                  rightComponent={
                    <ShortcutHint hint={shortcuts.home.NFT_SORT_ABC.display} />
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
