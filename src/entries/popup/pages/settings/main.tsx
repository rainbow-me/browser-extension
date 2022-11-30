import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { Box, Inline, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { PageHeader } from '~/entries/popup/components/PageHeader/PageHeader';
import {
  SFSymbol,
  Symbols,
} from '~/entries/popup/components/SFSymbol/SFSymbol';
import { menuTransition } from '~/entries/popup/utils/animation';

Symbol;
import { SwitchMenu } from '../../components/SwitchMenu/SwitchMenu';

interface ThemeOption {
  symbol: Symbols;
  label: string;
}
const themeOptions: { [key: string]: ThemeOption } = {
  system: { symbol: 'gearshapeFill', label: 'System' },
  light: { symbol: 'boltFill', label: 'Light' },
  dark: { symbol: 'moonStars', label: 'Dark' },
};

export function Main() {
  const navigate = useNavigate();
  const [rainbowAsDefaultWallet, setRainbowAsDefaultWallet] = useState(true);
  const handleChangeDefaultWallet = (checked: boolean) => {
    setRainbowAsDefaultWallet(checked);
  };
  const { currentCurrency } = useCurrentCurrencyStore();

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader title="Settings" leftRoute="/" leftSymbol="arrowLeft" />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
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
                  checked={rainbowAsDefaultWallet}
                  handleChange={handleChangeDefaultWallet}
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
                <MenuItem.Title
                  text={i18n.t('settings.privacy_and_security')}
                />
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
                <Box>
                  <MenuItem
                    hasChevron
                    leftComponent={
                      <SFSymbol symbol="moonStars" color="purple" size={18} />
                    }
                    rightComponent={<MenuItem.Selection text="System" />}
                    titleComponent={
                      <MenuItem.Title text={i18n.t('settings.theme')} />
                    }
                  />
                </Box>
              }
              menuItemIndicator={<SFSymbol symbol="checkMark" size={11} />}
              renderMenuItem={(option, i) => {
                const { label, symbol } = themeOptions[option];

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
              selectedValue="system"
              onValueChange={(value) => {
                console.log(value);
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
            />
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="🧠" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.learn_about_ethereum')}
                />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="🐦" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.follow_us_on_twitter')}
                />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
            <MenuItem
              leftComponent={<MenuItem.TextIcon icon="💬" />}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.feedback_and_support')}
                />
              }
              rightComponent={
                <SFSymbol
                  symbol="arrowUpRightCircle"
                  color="labelTertiary"
                  size={14}
                />
              }
            />
          </Menu>
        </MenuContainer>
      </Box>
      <Box
        padding="20px"
        alignItems="center"
        justifyContent="center"
        style={{ textAlign: 'center' }}
      >
        <Text size="12pt" weight="semibold" color="labelTertiary">
          1.2.34 (56)
        </Text>
      </Box>
    </Box>
  );
}
