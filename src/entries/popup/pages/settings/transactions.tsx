import { useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import {
  useFlashbotsEnabledStore,
  useNonceStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useDefaultTxSpeedStore } from '~/core/state/currentSettings/defaultTxSpeed';
import { useCustomNetworkTransactionsStore } from '~/core/state/transactions/customNetworkTransactions';
import { GasSpeed } from '~/core/types/gas';
import { DefaultTxSpeedOption } from '~/core/types/settings';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Inline, Symbol, Text } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';

import { triggerToast } from '../../components/Toast/Toast';

export function Transactions() {
  const { defaultTxSpeed, setDefaultTxSpeed } = useDefaultTxSpeedStore();
  const { flashbotsEnabled, setFlashbotsEnabled } = useFlashbotsEnabledStore();
  const { clearNonces } = useNonceStore();
  const { clearPendingTransactions } = usePendingTransactionsStore();
  const { clearAllCustomNetworkTransactions } =
    useCustomNetworkTransactionsStore();
  const filteredTxSpeedOptionKeys = Object.values(GasSpeed).filter(
    (opt) => opt !== GasSpeed.CUSTOM,
  );
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  const clearTransactions = useCallback(() => {
    clearNonces();
    clearPendingTransactions();
    clearAllCustomNetworkTransactions();
    triggerToast({
      title: i18n.t(
        'settings.transactions.clear_transactions_and_nonces_success',
      ),
    });
  }, [
    clearAllCustomNetworkTransactions,
    clearNonces,
    clearPendingTransactions,
  ]);

  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          <Lens
            style={{
              borderRadius: 15,
            }}
            onClick={() => setSpeedDropdownOpen(true)}
            onKeyDown={() => setSpeedDropdownOpen(true)}
          >
            <SwitchMenu
              align="end"
              open={speedDropdownOpen}
              onClose={() => setSpeedDropdownOpen(false)}
              renderMenuTrigger={
                <Box>
                  <MenuItem
                    hasChevron
                    tabIndex={-1}
                    titleComponent={
                      <MenuItem.Title
                        text={i18n.t('settings.transactions.default_speed')}
                      />
                    }
                    rightComponent={
                      <MenuItem.Selection
                        text={i18n.t(`transaction_fee.${defaultTxSpeed}`)}
                      />
                    }
                  />
                </Box>
              }
              menuItemIndicator={
                <Symbol
                  symbol="checkmark"
                  size={12}
                  color="label"
                  weight="semibold"
                />
              }
              renderMenuItem={(option, i) => {
                return (
                  <Box id={`switch-option-item-${i}`}>
                    <Inline space="8px" alignVertical="center">
                      <Inline alignVertical="center" space="8px">
                        <Text weight="medium" size="14pt">
                          {txSpeedEmoji[option as GasSpeed]}
                        </Text>
                      </Inline>
                      <Text weight="medium" size="14pt">
                        {i18n.t(`transaction_fee.${option}`)}
                      </Text>
                    </Inline>
                  </Box>
                );
              }}
              menuItems={filteredTxSpeedOptionKeys}
              selectedValue={defaultTxSpeed}
              onValueChange={(value) => {
                setDefaultTxSpeed(value as DefaultTxSpeedOption);
              }}
            />
          </Lens>
        </Menu>
        <Menu>
          <MenuItem
            first
            rightComponent={
              <Toggle
                tabIndex={-1}
                testId="flashbots-transactions-toggle"
                checked={flashbotsEnabled}
                handleChange={setFlashbotsEnabled}
              />
            }
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.transactions.use_flashbots')}
              />
            }
            onToggle={() => setFlashbotsEnabled(!flashbotsEnabled)}
          />
          <MenuItem.Description
            text={`${i18n.t('settings.transactions.flashbots_description')} `}
            onClickLink={() =>
              goToNewTab({
                url: 'https://learn.rainbow.me/protecting-transactions-with-flashbots',
              })
            }
          />
        </Menu>
        <Menu>
          <MenuItem
            last
            titleComponent={
              <MenuItem.Title
                color="red"
                text={i18n.t(
                  'settings.transactions.clear_transactions_and_nonces',
                )}
              />
            }
            onClick={clearTransactions}
          />
        </Menu>
      </MenuContainer>
    </Box>
  );
}
