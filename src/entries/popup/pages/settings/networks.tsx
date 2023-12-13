import React, { useMemo } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { SUPPORTED_CHAINS } from '~/core/references';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useUserChainsStore } from '~/core/state/userChains';
import { ChainId } from '~/core/types/chains';
import { getMainChains } from '~/core/utils/chains';
import { reorder } from '~/core/utils/draggable';
import { chainLabelMap, sortNetworks } from '~/core/utils/userChains';
import { Box, Inset, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { DraggableContext, DraggableItem } from '../../components/Draggable';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const chainLabel = ({ chainId }: { chainId: ChainId }) => {
  const chainLabels = [i18n.t('settings.networks.mainnet')];
  if (chainLabelMap[chainId]) {
    chainLabels.push(...chainLabelMap[chainId]);
  }
  return chainLabels.join(', ');
};

export function SettingsNetworks() {
  const navigate = useRainbowNavigate();
  const { userChainsOrder, updateUserChainsOrder } = useUserChainsStore();
  const mainChains = getMainChains();
  const { developerToolsEnabled, setDeveloperToolsEnabled } =
    useDeveloperToolsEnabledStore();
  const { featureFlags } = useFeatureFlagsStore();
  const { userChains } = useUserChainsStore();

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;
    const newUserChainsOrder = reorder(
      userChainsOrder,
      source.index,
      destination.index,
    );
    updateUserChainsOrder({ userChainsOrder: newUserChainsOrder });
  };

  const allNetworks = useMemo(
    () =>
      sortNetworks(userChainsOrder, mainChains).map((chain) => {
        const chainId = chain.id;
        // Always use the name of the supported network if it exists
        return {
          ...chain,
          name:
            SUPPORTED_CHAINS.find(({ id }) => id === chainId)?.name ||
            chain.name,
        };
      }),
    [mainChains, userChainsOrder],
  );

  console.log({
    allNetworks,
    userChainsOrder,
    mainChains,
  });

  return (
    <Box paddingHorizontal="20px">
      {featureFlags.custom_rpc && (
        <MenuContainer>
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
              onClick={() => navigate(ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC)}
              titleComponent={
                <MenuItem.Title
                  text={i18n.t('settings.networks.custom_rpc.title')}
                />
              }
            />
          </Menu>
        </MenuContainer>
      )}

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
          <DraggableContext onDragEnd={onDragEnd} height="fixed">
            <Box paddingHorizontal="1px" paddingVertical="1px">
              {allNetworks.map((chain: Chain, index) => (
                <Box key={`${chain.id}`} testId={`network-row-${chain.id}`}>
                  <DraggableItem id={`${chain.id}`} index={index}>
                    <MenuItem
                      first={index === 0}
                      leftComponent={
                        <ChainBadge chainId={chain.id} size="18" shadow />
                      }
                      onClick={() =>
                        navigate(ROUTES.SETTINGS__NETWORKS__RPCS, {
                          state: { chainId: chain.id, title: chain.name },
                        })
                      }
                      key={chain.name}
                      hasRightArrow
                      titleComponent={<MenuItem.Title text={chain.name} />}
                      labelComponent={
                        developerToolsEnabled ? (
                          <Text
                            color={'labelTertiary'}
                            size="11pt"
                            weight={'medium'}
                          >
                            {userChains[chain.id]
                              ? chainLabel({ chainId: chain.id })
                              : i18n.t('settings.networks.disabled')}
                          </Text>
                        ) : null
                      }
                    />
                  </DraggableItem>
                </Box>
              ))}
            </Box>
          </DraggableContext>
          <Box paddingHorizontal="16px" paddingVertical="16px">
            <Text size="12pt" weight="medium" color="labelTertiary">
              {i18n.t('settings.networks.description')}
            </Text>
          </Box>
        </Menu>
        <Menu>
          <MenuItem
            leftComponent={
              <Symbol
                symbol="hammer.fill"
                weight="medium"
                size={18}
                color="labelTertiary"
              />
            }
            titleComponent={
              <MenuItem.Title
                text={i18n.t('settings.networks.developer_tools.title')}
              />
            }
            rightComponent={
              <Toggle
                testId="developer-tools-toggle"
                checked={developerToolsEnabled}
                handleChange={() =>
                  setDeveloperToolsEnabled(!developerToolsEnabled)
                }
                tabIndex={-1}
              />
            }
            onToggle={() => setDeveloperToolsEnabled(!developerToolsEnabled)}
          />
          <MenuItem.Description
            text={i18n.t('settings.networks.developer_tools.toggle_explainer')}
          />
        </Menu>
        {/* {developerToolsEnabled && (
          <Menu>
            {allNetworks.map((chain: Chain, index) => (
              <Box key={`${chain.id}`} testId={`network-row-${chain.id}`}>
                <DraggableItem id={`${chain.id}`} index={index}>
                  <MenuItem
                    first={index === 0}
                    leftComponent={
                      <ChainBadge chainId={chain.id} size="18" shadow />
                    }
                    onClick={() =>
                      navigate(ROUTES.SETTINGS__NETWORKS__RPCS, {
                        state: { chainId: chain.id, title: chain.name },
                      })
                    }
                    key={chain.name}
                    hasRightArrow
                    titleComponent={<MenuItem.Title text={chain.name} />}
                    labelComponent={
                      developerToolsEnabled ? (
                        <Text
                          color={'labelTertiary'}
                          size="11pt"
                          weight={'medium'}
                        >
                          {chainLabel({ chainId: chain.id })}
                        </Text>
                      ) : null
                    }
                  />
                </DraggableItem>
              </Box>
            ))}
          </Menu>
        )} */}
      </MenuContainer>
    </Box>
  );
}
