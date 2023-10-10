import React from 'react';

import { i18n } from '~/core/languages';
import { useUserChainsStore } from '~/core/state/userChains';
import { getSupportedChains } from '~/core/utils/chains';
import { Box, Inset } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';

export function SettingsNetworks() {
  const { userChains, updateUserChain } = useUserChainsStore();
  const supportedChains = getSupportedChains();

  return (
    <Box paddingHorizontal="20px">
      <Inset bottom="8px">
        <QuickPromo
          text={i18n.t('settings.networks.quick_promo.text')}
          textBold={i18n.t('settings.networks.quick_promo.text_bold')}
          symbol="sparkle"
          symbolColor="accent"
          promoType="network_settings"
        />
      </Inset>

      <MenuContainer testId="settings-menu-container">
        <Menu>
          {supportedChains.map((chain, index) => (
            <MenuItem
              first={index === 0}
              last={index === supportedChains.length - 1}
              leftComponent={<ChainBadge chainId={chain.id} size="18" shadow />}
              rightComponent={
                userChains[chain.id] ? <MenuItem.SelectionIcon /> : null
              }
              key={chain.name}
              titleComponent={<MenuItem.Title text={chain.name} />}
              onClick={() =>
                updateUserChain({
                  chainId: chain.id,
                  enabled: !userChains[chain.id],
                })
              }
            />
          ))}
        </Menu>
      </MenuContainer>
    </Box>
  );
}
