import React from 'react';

import EthIcon from 'static/assets/ethIcon.png';
import { SupportedCurrencyKey, supportedCurrencies } from '~/core/references';
import { useSettingsStore } from '~/core/state/currentSettings/store';
import { Box, Inline } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

export function Currency() {
  const [currentCurrency, setCurrentCurrency] =
    useSettingsStore('currentCurrency');
  const supportedCurrencyKeys = Object.keys(
    supportedCurrencies,
  ) as SupportedCurrencyKey[];

  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          {supportedCurrencyKeys.map((currency, index) => (
            <MenuItem
              first={index === 0}
              last={index === supportedCurrencyKeys.length - 1}
              leftComponent={
                currency === 'ETH' ? (
                  <Inline alignHorizontal="center">
                    <Box style={{ width: 16, height: 16 }}>
                      <img src={EthIcon} width="100%" height="100%" />
                    </Box>
                  </Inline>
                ) : (
                  <MenuItem.TextIcon
                    icon={supportedCurrencies[currency].emoji}
                  />
                )
              }
              rightComponent={
                currentCurrency === currency ? <MenuItem.SelectionIcon /> : null
              }
              key={currency}
              titleComponent={
                <MenuItem.Title text={supportedCurrencies[currency].label} />
              }
              onClick={() => setCurrentCurrency(currency)}
            />
          ))}
        </Menu>
      </MenuContainer>
    </Box>
  );
}
