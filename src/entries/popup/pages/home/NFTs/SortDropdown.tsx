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

export default function SortdDropdown() {
  const { sort, setNftSort } = useNftsStore();
  const onValueChange = useCallback(
    (value: typeof sort) => {
      setNftSort(value);
    },
    [setNftSort],
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
                symbol="clock"
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
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
                      hint={shortcuts.home.GO_TO_SETTINGS.display}
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
                    <Text size="14pt" weight="semibold">
                      {i18n.t('nfts.sort_option_abc_long')}
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
