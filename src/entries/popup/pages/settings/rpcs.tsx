import React, { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { SUPPORTED_CHAINS } from '~/core/references';
import { useCustomRPCsStore } from '~/core/state';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useUserChainsStore } from '~/core/state/userChains';
import {
  getCustomChains,
  getSupportedTestnetChains,
} from '~/core/utils/chains';
import { chainIdMap } from '~/core/utils/userChains';
import { Box, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function SettingsNetworksRPCs() {
  const {
    state: { chainId },
  } = useLocation();
  const navigate = useRainbowNavigate();
  const { customChains, setActiveRPC, setDefaultRPC } = useCustomRPCsStore();
  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();

  const { userChains, updateUserChain } = useUserChainsStore();

  const handleToggleChain = useCallback(
    (newVal: boolean) => {
      updateUserChain({
        chainId: chainId,
        enabled: newVal,
      });
    },
    [chainId, updateUserChain],
  );

  const handleRPCClick = useCallback(
    (rpcUrl?: string): void => {
      if (rpcUrl) {
        setActiveRPC({
          rpcUrl,
          chainId: chainId,
        });
      } else {
        setDefaultRPC({ chainId });
      }
    },
    [chainId, setActiveRPC, setDefaultRPC],
  );

  const handleTestnetClick = useCallback((rpcUrl: string): void => {
    console.log('rpcUrl', rpcUrl);
  }, []);

  const suportedChain = useMemo(
    () => SUPPORTED_CHAINS.find(({ id }) => id === chainId),
    [chainId],
  );

  const isDefaultRPC = () => {
    const { customChains: chains } = getCustomChains();
    const customChain = chains.find(
      (chain: Chain) => chain.id === (chainId as number),
    );
    console.log('custom chain!', customChain);
    return typeof customChain === 'undefined';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const mainnetChains =
    customChains[Number(chainId)]?.chains?.filter((chain) => !chain.testnet) ||
    [];

  const customTestnetChains =
    customChains[Number(chainId)]?.chains?.filter((chain) => chain.testnet) ||
    [];
  const supportedTestnetChains = getSupportedTestnetChains().filter((chain) => {
    return chainIdMap[chainId].includes(chain.id) && chain.id !== chainId;
  });

  const testnetChains = [...customTestnetChains, ...supportedTestnetChains];

  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          <MenuItem
            first
            titleComponent={
              <MenuItem.Title text={i18n.t('settings.networks.enabled')} />
            }
            rightComponent={
              <Toggle
                testId="set-rainbow-default-toggle"
                checked={userChains[chainId]}
                handleChange={handleToggleChain}
                tabIndex={-1}
              />
            }
            onToggle={() => handleToggleChain(!userChains[chainId])}
          />
        </Menu>
        <Menu>
          <MenuItem.Description
            text={i18n.t('settings.networks.rpc_endpoints')}
          />
          <Box paddingHorizontal="1px" paddingVertical="1px">
            {suportedChain && (
              <MenuItem
                first={true}
                leftComponent={
                  <ChainBadge chainId={chainId} size="18" shadow />
                }
                onClick={() => handleRPCClick('')}
                key={'default'}
                rightComponent={
                  isDefaultRPC() ? <MenuItem.SelectionIcon /> : null
                }
                titleComponent={<MenuItem.Title text={'Default'} />}
                labelComponent={
                  <Text color={'labelTertiary'} size="11pt" weight={'medium'}>
                    {`Rainbow's default RPC`}
                  </Text>
                }
              />
            )}
            {mainnetChains.map((chain, index) => (
              <Box key={`${chain.name}`} testId={`network-row-${chain.name}`}>
                <MenuItem
                  first={!suportedChain && index === 0}
                  leftComponent={
                    <ChainBadge chainId={chain.id} size="18" shadow />
                  }
                  onClick={() => handleRPCClick(chain.rpcUrls.default.http[0])}
                  key={chain.name}
                  rightComponent={
                    chain.rpcUrls.default.http[0] ===
                    customChains[Number(chainId)]?.activeRpcUrl ? (
                      <MenuItem.SelectionIcon />
                    ) : null
                  }
                  titleComponent={<MenuItem.Title text={chain.name} />}
                  labelComponent={
                    <Text color={'labelTertiary'} size="11pt" weight={'medium'}>
                      {chain.rpcUrls.default.http[0]}
                    </Text>
                  }
                />
              </Box>
            ))}
          </Box>
        </Menu>
        <Menu>
          <MenuItem
            testId={'custom-chain-link'}
            first
            last
            leftComponent={
              <Symbol
                symbol="plus.circle.fill"
                weight="medium"
                size={18}
                color="accent"
              />
            }
            hasRightArrow
            onClick={() =>
              navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC__DETAILS, {
                state: {
                  chainId,
                },
              })
            }
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.networks.custom_rpc.add_asset')}
              />
            }
          />
        </Menu>
        {developerToolsEnabled && (
          <Menu>
            <MenuItem.Description text={i18n.t('settings.networks.testnets')} />
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {testnetChains.map((chain, index) => (
                <Box key={`${chain.name}`} testId={`network-row-${chain.name}`}>
                  <MenuItem
                    first={!suportedChain && index === 0}
                    leftComponent={
                      <ChainBadge chainId={chain.id} size="18" shadow />
                    }
                    onClick={() =>
                      handleTestnetClick(chain.rpcUrls.default.http[0])
                    }
                    key={chain.name}
                    rightComponent={
                      chain.rpcUrls.default.http[0] ===
                      customChains[Number(chainId)]?.activeRpcUrl ? (
                        <MenuItem.SelectionIcon />
                      ) : null
                    }
                    titleComponent={<MenuItem.Title text={chain.name} />}
                    labelComponent={
                      <Text
                        color={'labelTertiary'}
                        size="11pt"
                        weight={'medium'}
                      >
                        {chainIdMap[chainId].includes(chain.id) &&
                        chain.id !== chainId
                          ? `Rainbow's default`
                          : chain.rpcUrls.default.http[0]}
                      </Text>
                    }
                  />
                </Box>
              ))}
            </Box>
          </Menu>
        )}
      </MenuContainer>
    </Box>
  );
}
