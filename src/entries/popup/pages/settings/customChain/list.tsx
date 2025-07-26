import { AddressZero } from '@ethersproject/constants';
import { useCallback, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useNetworkStore } from '~/core/state/networks/networks';
import { getCustomChainIconUrl } from '~/core/utils/assets';
import { Box, Stack, Symbol, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';

import ExternalImage from '../../../components/ExternalImage/ExternalImage';
import { ROUTES } from '../../../urls';

export function SettingsCustomChainsList() {
  const navigate = useRainbowNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();
  const customNetworks = useNetworkStore((state) =>
    state.getSupportedCustomNetworks(),
  );
  const addCustomChain = useNetworkStore((state) => state.addCustomChain);

  const filteredNetworks = useMemo(() => {
    const networks = customNetworks.filter((network) =>
      developerToolsEnabled ? true : !network.testnet.isTestnet,
    );

    if (!searchTerm.trim()) {
      return networks;
    }

    return networks.filter((network) =>
      network.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customNetworks, searchTerm, developerToolsEnabled]);

  const handleNetworkSelect = useCallback(
    (network: (typeof customNetworks)[0]) => {
      // Create a chain object similar to what the form creates
      const chain = {
        id: network.id,
        name: network.name,
        nativeCurrency: {
          symbol: network.nativeAsset.symbol,
          decimals: 18,
          name: network.nativeAsset.symbol,
        },
        rpcUrls: {
          default: { http: [network.defaultRPCURL] },
          public: { http: [network.defaultRPCURL] },
        },
        blockExplorers: {
          default: {
            name: network.defaultExplorerURL
              ? new URL(network.defaultExplorerURL).hostname
              : '',
            url: network.defaultExplorerURL || '',
          },
        },
        testnet: network.testnet.isTestnet,
      };

      addCustomChain(network.id, chain, network.defaultRPCURL, true);

      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.network_added'),
        description: i18n.t(
          'settings.networks.custom_rpc.network_added_correctly',
          { networkName: network.name },
        ),
      });

      navigate(ROUTES.SETTINGS__NETWORKS, {
        state: { backTo: ROUTES.SETTINGS },
      });
    },
    [addCustomChain, navigate],
  );

  const handleAddCustomNetwork = useCallback(() => {
    navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC);
  }, [navigate]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const showNoResults = searchTerm.trim() && filteredNetworks.length === 0;

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        {/* Search Input */}
        <Input
          placeholder="Search networks..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="surfaceBordered"
          height="32px"
          autoFocus
          testId="search-networks-input"
        />

        {/* Networks List */}
        <MenuContainer>
          <Menu>
            {filteredNetworks.map((network, index) => (
              <MenuItem
                key={network.id}
                first={index === 0}
                last={!showNoResults && index === filteredNetworks.length - 1}
                leftComponent={
                  <ExternalImage
                    borderRadius="10px"
                    customFallbackSymbol="globe"
                    height={20}
                    src={getCustomChainIconUrl(network.id, AddressZero)}
                    width={20}
                  />
                }
                titleComponent={<MenuItem.Title text={network.name} />}
                labelComponent={
                  network.testnet.isTestnet ? (
                    <Text color="labelQuaternary" size="11pt" weight="medium">
                      {i18n.t('settings.networks.testnet')}
                    </Text>
                  ) : null
                }
                onClick={() => handleNetworkSelect(network)}
                testId={`custom-network-${network.id}`}
              />
            ))}

            {showNoResults && (
              <MenuItem
                first
                titleComponent={<MenuItem.Title text="No networks found" />}
                disabled
                testId="no-networks-found"
              />
            )}

            {/* Add Custom Network Button */}
            {(filteredNetworks.length > 0 || showNoResults) && (
              <MenuItem
                last
                leftComponent={
                  <Symbol
                    symbol="plus.circle.fill"
                    weight="medium"
                    size={18}
                    color="blue"
                  />
                }
                titleComponent={
                  <MenuItem.Title
                    color="blue"
                    text={i18n.t(
                      'settings.networks.custom_rpc.add_custom_network',
                    )}
                  />
                }
                onClick={handleAddCustomNetwork}
                testId="add-custom-network-manual"
              />
            )}
          </Menu>
        </MenuContainer>
      </Stack>
    </Box>
  );
}
