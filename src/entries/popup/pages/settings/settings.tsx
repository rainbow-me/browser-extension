import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import {
  RAINBOW_LEARN_URL,
  RAINBOW_SHARE_URL,
  RAINBOW_SUPPORT_URL,
  RAINBOW_TWITTER_URL,
} from '~/core/references/links';
import { themeOptions } from '~/core/references/themes';
import { useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useIsDefaultWalletStore } from '~/core/state/currentSettings/isDefaultWallet';
import { ThemeOption } from '~/core/types/settings';
import { Box, Inline, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';

import { testSandbox } from '../../handlers/wallet';
import { ROUTES } from '../../urls';

export function Settings() {
  const navigate = useNavigate();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { isDefaultWallet, setIsDefaultWallet } = useIsDefaultWalletStore();

  const { currentUserSelectedTheme, setCurrentTheme } = useCurrentThemeStore();

  const testSandboxBackground = useCallback(async () => {
    const response = await testSandbox();

    alert(response);
  }, []);

  const testSandboxPopup = useCallback(async () => {
    try {
      console.log('about to leak...');
      const r = await fetch('https://api.ipify.org?format=json');
      const res = await r.json();
      console.log('response from server after leaking', res);
      alert('Popup leaked!');
    } catch (e) {
      alert('Popup sandboxed!');
    }
  }, []);

  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          <MenuItem
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.use_rainbow_as_default_wallet')}
              />
            }
            rightComponent={
              <Toggle
                checked={isDefaultWallet}
                handleChange={setIsDefaultWallet}
              />
            }
          />
          <MenuItem.Description
            text={i18n.t('settings.default_wallet_description')}
          />
        </Menu>
        <Menu>
          <MenuItem
            leftComponent={
              <Symbol
                symbol="lock.fill"
                weight="medium"
                size={18}
                color="blue"
              />
            }
            hasRightArrow
            onClick={() => navigate(ROUTES.SETTINGS__PRIVACY)}
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.privacy_and_security.title')}
              />
            }
          />
        </Menu>
        <Menu>
          <MenuItem
            hasRightArrow
            leftComponent={
              <Symbol
                symbol="bolt.fill"
                color="red"
                weight="medium"
                size={18}
              />
            }
            onClick={() => navigate(ROUTES.SETTINGS__TRANSACTIONS)}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.transactions.title')} />
            }
          />
          <MenuItem
            hasRightArrow
            leftComponent={
              <Symbol
                symbol="eurosign.circle"
                color="green"
                size={18}
                weight="medium"
              />
            }
            onClick={() => navigate(ROUTES.SETTINGS__CURRENCY)}
            rightComponent={
              <MenuItem.Selection
                text={supportedCurrencies[currentCurrency].label}
              />
            }
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.currency.title')} />
            }
          />
          <SwitchMenu
            align="end"
            renderMenuTrigger={
              <MenuItem
                hasChevron
                leftComponent={
                  <Symbol
                    symbol="moon.stars"
                    color="purple"
                    size={18}
                    weight="medium"
                  />
                }
                rightComponent={
                  <MenuItem.Selection
                    text={
                      themeOptions[currentUserSelectedTheme as ThemeOption]
                        .label
                    }
                  />
                }
                titleComponent={
                  <MenuItem.Title text={i18n.t('settings.theme.title')} />
                }
              />
            }
            menuItemIndicator={
              <Symbol
                symbol="checkmark"
                color="label"
                size={12}
                weight="semibold"
              />
            }
            renderMenuItem={(option, i) => {
              const { label, symbol } = themeOptions[option as ThemeOption];

              return (
                <Box id={`switch-option-item-${i}`}>
                  <Inline space="8px" alignVertical="center">
                    <Inline alignVertical="center" space="8px">
                      <Symbol
                        size={14}
                        symbol={symbol}
                        color="label"
                        weight="semibold"
                      />
                    </Inline>
                    <Text weight="regular" size="14pt">
                      {label}
                    </Text>
                  </Inline>
                </Box>
              );
            }}
            menuItems={Object.keys(themeOptions)}
            selectedValue={currentUserSelectedTheme}
            onValueChange={(value) => {
              setCurrentTheme(value as ThemeOption);
            }}
          />
          <MenuItem
            leftComponent={
              <Symbol
                symbol="person.text.rectangle.fill"
                color="blue"
                size={18}
                weight="semibold"
              />
            }
            hasRightArrow
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.contacts')} />
            }
          />
        </Menu>
        <Menu>
          <MenuItem
            leftComponent={<MenuItem.TextIcon icon="🌈" />}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.share_rainbow')} />
            }
            rightComponent={
              <Symbol
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
                size={12}
                weight="semibold"
              />
            }
            onClick={() => window.open(RAINBOW_SHARE_URL, '_blank')}
          />
          <MenuItem
            leftComponent={<MenuItem.TextIcon icon="🧠" />}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.learn_about_ethereum')} />
            }
            rightComponent={
              <Symbol
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
                size={12}
                weight="semibold"
              />
            }
            onClick={() => window.open(RAINBOW_LEARN_URL, '_blank')}
          />
          <MenuItem
            leftComponent={<MenuItem.TextIcon icon="🐦" />}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.follow_us_on_twitter')} />
            }
            rightComponent={
              <Symbol
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
                size={12}
                weight="semibold"
              />
            }
            onClick={() => window.open(RAINBOW_TWITTER_URL, '_blank')}
          />
          <MenuItem
            leftComponent={<MenuItem.TextIcon icon="💬" />}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.feedback_and_support')} />
            }
            rightComponent={
              <Symbol
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
                size={12}
                weight="semibold"
              />
            }
            onClick={() => window.open(RAINBOW_SUPPORT_URL, '_blank')}
          />
        </Menu>
        <Menu>
          <MenuItem.Description text="Below buttons are for testing only" />
          <MenuItem
            titleComponent={<MenuItem.Title text="test sandbox popup" />}
            onClick={testSandboxPopup}
            testId="test-sandbox-popup"
          />
          <MenuItem
            titleComponent={<MenuItem.Title text="test sandbox background" />}
            onClick={testSandboxBackground}
            testId="test-sandbox-background"
          />
        </Menu>
        <Box padding="10px" alignItems="center" justifyContent="center">
          <Text
            size="12pt"
            weight="semibold"
            color="labelTertiary"
            align="center"
          >
            1.2.34 (56)
          </Text>
        </Box>
      </MenuContainer>
    </Box>
  );
}
