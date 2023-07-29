import React from 'react';

import { SupportedLanguageKey, supportedLanguages } from '~/core/languages';
import { useCurrentLanguageStore } from '~/core/state';
import { Box } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

export function Language() {
  const { currentLanguage, setCurrentLanguage } = useCurrentLanguageStore();
  const supportedLanguageKeys = Object.keys(
    supportedLanguages,
  ) as SupportedLanguageKey[];

  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          {supportedLanguageKeys.map((language, index) => (
            <MenuItem
              first={index === 0}
              last={index === supportedLanguageKeys.length - 1}
              rightComponent={
                currentLanguage === language ? <MenuItem.SelectionIcon /> : null
              }
              key={language}
              titleComponent={
                <MenuItem.Title text={supportedLanguages[language].label} />
              }
              onClick={() => setCurrentLanguage(language)}
            />
          ))}
        </Menu>
      </MenuContainer>
    </Box>
  );
}
