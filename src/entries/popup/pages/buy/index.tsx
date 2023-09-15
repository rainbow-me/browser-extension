/* eslint-disable no-nested-ternary */
import { useMemo } from 'react';

import { fetchProviderWidgetUrl, useProvidersList } from '~/core/resources/f2c';
import { useCurrentAddressStore } from '~/core/state/currentSettings/currentAddress';
import { Box } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { CoinbaseIcon } from '../../components/CoinbaseIcon/CoinbaseIcon';
import { MoonpayIcon } from '../../components/MoonpayIcon/MoonpayIcon';
import { RampIcon } from '../../components/RampIcon/RampIcon';

export function Buy() {
  const { currentAddress: depositAddress } = useCurrentAddressStore();
  const { data } = useProvidersList();
  const providers = useMemo(
    () => data?.filter((provider) => provider.enabled === true),
    [data],
  );

  return (
    <Box>
      <Box paddingHorizontal="20px">
        <MenuContainer>
          {providers?.map((provider, idx) => {
            return (
              <Menu key={idx}>
                <MenuItem
                  testId={`provider-${provider.id}`}
                  first
                  titleComponent={
                    <MenuItem.Title text={provider.content.title} />
                  }
                  labelComponent={
                    <MenuItem.Label text={provider.content.description} />
                  }
                  leftComponent={
                    {
                      moonpay: <MoonpayIcon />,
                      ramp: <RampIcon />,
                      coinbase: <CoinbaseIcon />,
                    }[provider.id]
                  }
                  onClick={async () => {
                    const { data } = await fetchProviderWidgetUrl({
                      provider: provider.id,
                      depositAddress,
                    });
                    window.open(data.url, '_blank');
                  }}
                  hasRightArrow
                />
              </Menu>
            );
          })}
        </MenuContainer>
      </Box>
    </Box>
  );
}
