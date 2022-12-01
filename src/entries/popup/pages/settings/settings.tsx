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
import { ThemeType, themeOptions } from '~/core/references/themes';
import { useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useIsDefaultWalletStore } from '~/core/state/currentSettings/isDefaultWallet';
import { Box, Inline, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';

import { testSandbox } from '../../handlers/wallet';

export function Settings() {
  const navigate = useNavigate();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { isDefaultWallet, setIsDefaultWallet } = useIsDefaultWalletStore();

  const { currentTheme, setCurrentTheme } = useCurrentThemeStore();

  const testSandboxBackground = useCallback(async () => {
    console.log('asking the bg if it can leak!');
    const response = await testSandbox();
    console.log('response', response);

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
            hasSfSymbol
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
            hasSfSymbol
            leftComponent={
              <SFSymbol symbol="lockFill" color="blue" size={18} />
            }
            hasRightArrow
            onClick={() => navigate('/settings/privacy')}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.privacy_and_security')} />
            }
          />
        </Menu>
        <Menu>
          <MenuItem
            hasRightArrow
            leftComponent={<SFSymbol symbol="boltFill" color="red" />}
            onClick={() => navigate('/settings/transactions')}
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.transactions')} />
            }
          />
          <MenuItem
            hasRightArrow
            leftComponent={<SFSymbol symbol="send" color="green" />}
            onClick={() => navigate('/settings/currency')}
            rightComponent={
              <MenuItem.Selection
                text={supportedCurrencies[currentCurrency].label}
              />
            }
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.currency')} />
            }
          />
          <SwitchMenu
            align="end"
            renderMenuTrigger={
              <MenuItem
                hasChevron
                leftComponent={
                  <SFSymbol symbol="moonStars" color="purple" size={18} />
                }
                rightComponent={
                  <MenuItem.Selection text={themeOptions[currentTheme].label} />
                }
                titleComponent={
                  <MenuItem.Title text={i18n.t('settings.theme')} />
                }
              />
            }
            menuItemIndicator={<SFSymbol symbol="checkMark" size={11} />}
            renderMenuItem={(option, i) => {
              const { label, symbol } = themeOptions[option as ThemeType];

              return (
                <Box id={`switch-option-item-${i}`}>
                  <Inline space="8px" alignVertical="center">
                    <Inline alignVertical="center" space="8px">
                      <SFSymbol size={18} symbol={symbol} />
                    </Inline>
                    <Text weight="medium" size="14pt">
                      {label}
                    </Text>
                  </Inline>
                </Box>
              );
            }}
            menuItems={Object.keys(themeOptions)}
            selectedValue={currentTheme}
            onValueChange={(value) => {
              setCurrentTheme(value as ThemeType);
            }}
          />
          <MenuItem
            leftComponent={
              <SFSymbol
                symbol="personTextRectangleFill"
                color="blue"
                size={18}
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
              <SFSymbol
                symbol="arrowUpRightCircle"
                color="labelTertiary"
                size={14}
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
              <SFSymbol
                symbol="arrowUpRightCircle"
                color="labelTertiary"
                size={14}
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
              <SFSymbol
                symbol="arrowUpRightCircle"
                color="labelTertiary"
                size={14}
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
              <SFSymbol
                symbol="arrowUpRightCircle"
                color="labelTertiary"
                size={14}
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
