import { AnimatePresence, motion } from 'framer-motion';
import React, {
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import appConnectionWalletItemImageMask from 'static/assets/appConnectionWalletItemImageMask.svg';
import { i18n } from '~/core/languages';
import { selectUserAssetsBalance } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { Lens } from '~/design-system/components/Lens/Lens';

import { AppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useWalletName } from '../../hooks/useWalletName';
import { AppInteractionItem } from '../AppConnectionMenu/AppInteractionItem';
import { ChainBadge } from '../ChainBadge/ChainBadge';
import {
  ContextMenu,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';
import { ContextMenuContentWithSubMenu } from '../ContextMenu/ContextSubMenu';
import { DropdownMenuRadioGroup } from '../DropdownMenu/DropdownMenu';
import { DropdownSubMenu } from '../DropdownMenu/DropdownSubMenu';
import { SwitchNetworkMenuSelector } from '../SwitchMenu/SwitchNetworkMenu';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

import { appConnectionWalletItem } from './AppConnectionWalletItem.css';

interface WalletItemConnectedWrapperProps {
  children: ReactElement;
  appMetadata: AppMetadata;
  address: Address;
  onClose?: () => null;
  onOpen?: () => null;
}

export const AppConnectionWalletItemConnectedWrapper = React.forwardRef(
  (props: WalletItemConnectedWrapperProps) => {
    const { children, appMetadata, address } = props;
    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
    const [subMenuOpen, setSubMenuOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const { updateSessionChainId, disconnectSession, appSession } =
      useAppSession({ host: appMetadata.appHost });

    const changeChainId = useCallback(
      (chainId: string) => {
        updateSessionChainId({ address, chainId: Number(chainId) });
      },
      [address, updateSessionChainId],
    );

    const disconnect = useCallback(() => {
      disconnectSession({ address, host: appMetadata.appHost });
      setSubMenuOpen(false);
      setMenuOpen(false);
    }, [address, appMetadata.appHost, disconnectSession]);

    const onValueChange = useCallback(
      (value: 'disconnect' | 'switch-networks' | 'open-dapp') => {
        switch (value) {
          case 'disconnect':
            disconnect();
            break;
          case 'switch-networks':
            setSubMenuOpen(!subMenuOpen);
            break;
          case 'open-dapp':
            break;
        }
      },
      [disconnect, subMenuOpen],
    );

    return (
      <ContextMenu onOpenChange={setMenuOpen} open={menuOpen}>
        <ContextMenuTrigger asChild>
          <Box>{children}</Box>
        </ContextMenuTrigger>

        <ContextMenuContentWithSubMenu reff={dropdownMenuRef}>
          <ContextMenuRadioGroup
            onValueChange={(value) =>
              onValueChange(
                value as 'disconnect' | 'switch-networks' | 'open-dapp',
              )
            }
          >
            <Box key="switch-networks">
              <DropdownSubMenu
                menuOpen={menuOpen}
                parentRef={dropdownMenuRef}
                setMenuOpen={setMenuOpen}
                subMenuOpen={subMenuOpen}
                setSubMenuOpen={setSubMenuOpen}
                subMenuContent={
                  <DropdownMenuRadioGroup
                    value={`${appSession.sessions[address]}`}
                    onValueChange={changeChainId}
                  >
                    <AccentColorProviderWrapper
                      color={appMetadata.appColor || undefined}
                    >
                      <SwitchNetworkMenuSelector
                        type="dropdown"
                        highlightAccentColor
                        selectedValue={`${appSession.sessions[address]}`}
                        onNetworkSelect={(e) => {
                          e?.preventDefault();
                          setSubMenuOpen(false);
                          // without this timeout the collapse of the context menu freezes the screen
                          setTimeout(() => {
                            setMenuOpen(false);
                          }, 1);
                        }}
                        onShortcutPress={changeChainId}
                        showDisconnect={!!appSession}
                        disconnect={disconnect}
                      />
                    </AccentColorProviderWrapper>
                  </DropdownMenuRadioGroup>
                }
                subMenuElement={
                  <AppInteractionItem
                    type="context"
                    appSession={appSession}
                    chevronDirection={subMenuOpen ? 'down' : 'right'}
                    showChevron
                  />
                }
              />
            </Box>
            <Box key="disconnect">
              <ContextMenuRadioItem value="disconnect">
                <Inline
                  height="full"
                  alignHorizontal="center"
                  alignVertical="center"
                  space="8px"
                >
                  <Box height="fit" style={{ width: '18px', height: '18px' }}>
                    <Inline
                      height="full"
                      alignHorizontal="center"
                      alignVertical="center"
                    >
                      <Symbol
                        size={12}
                        symbol="xmark"
                        weight="semibold"
                        color="label"
                      />
                    </Inline>
                  </Box>
                  <Text size="14pt" weight="semibold" color="label">
                    {i18n.t('app_connection_switcher.wallet_item.disconnect')}
                  </Text>
                </Inline>
              </ContextMenuRadioItem>
            </Box>
          </ContextMenuRadioGroup>
        </ContextMenuContentWithSubMenu>
      </ContextMenu>
    );
  },
);

AppConnectionWalletItemConnectedWrapper.displayName =
  'AppConnectionWalletItemConnectedWrapper';

interface WalletItemProps {
  address: Address;
  onClick?: () => void;
  chainId: ChainId;
  active?: boolean;
  connected: boolean;
  appMetadata: AppMetadata;
}

export const AppConnectionWalletItem = React.forwardRef(
  (props: WalletItemProps) => {
    const { address, onClick, chainId, active, connected } = props;
    const [hovering, setHovering] = useState(false);
    const { displayName } = useWalletName({ address });
    const showChainBadge = !!chainId && chainId !== ChainId.mainnet;

    const { currentCurrency: currency } = useCurrentCurrencyStore();
    const { connectedToHardhat } = useConnectedToHardhatStore();
    const { data: totalAssetsBalance } = useUserAssets(
      { address, currency, connectedToHardhat },
      { select: selectUserAssetsBalance() },
    );

    const userAssetsBalanceDisplay = convertAmountToNativeDisplay(
      totalAssetsBalance || 0,
      currency,
    );

    const subLabel = useMemo(
      () => (
        <AnimatePresence initial={false} mode="popLayout">
          {!hovering && (
            <Box
              as={motion.div}
              key={`${address}-${connected ? '' : 'not-'}-connected`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {connected ? (
                <Inline space="4px" alignVertical="center">
                  <Symbol
                    symbol={active ? 'circle.fill' : 'circle'}
                    size={8}
                    weight="medium"
                    color={active ? 'green' : 'labelTertiary'}
                  />
                  <Text
                    size="12pt"
                    weight="semibold"
                    align="left"
                    color="label"
                  >
                    {ChainNameDisplay[chainId]}
                  </Text>
                </Inline>
              ) : (
                <Inline space="4px" alignVertical="center">
                  <TextOverflow
                    color="labelQuaternary"
                    size="12pt"
                    weight="bold"
                  >
                    {userAssetsBalanceDisplay}
                  </TextOverflow>
                </Inline>
              )}
            </Box>
          )}
          {hovering && (
            <Box
              as={motion.div}
              key={`${address}-${connected ? '' : 'not-'}connected-hovering`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Text
                size="12pt"
                weight="semibold"
                align="left"
                color={connected ? 'red' : 'green'}
              >
                {i18n.t(
                  `app_connection_switcher.wallet_item.${
                    connected ? 'switch_connection' : 'connect'
                  }`,
                )}
              </Text>
            </Box>
          )}
        </AnimatePresence>
      ),
      [address, active, chainId, connected, hovering, userAssetsBalanceDisplay],
    );

    return (
      <Box
        as={motion.div}
        className={appConnectionWalletItem}
        onHoverStart={() => setHovering(true)}
        onHoverEnd={() => setHovering(false)}
      >
        <Lens
          handleOpenMenu={onClick}
          key={address}
          onClick={onClick}
          paddingHorizontal="12px"
          paddingVertical="8px"
          borderRadius="12px"
        >
          <Columns space="8px" alignVertical="center" alignHorizontal="justify">
            <Column width="content">
              <Box>
                <WalletAvatar
                  mask={
                    showChainBadge ? appConnectionWalletItemImageMask : null
                  }
                  address={address}
                  size={36}
                  emojiSize="20pt"
                  background="transparent"
                />
                <Box
                  style={{
                    marginLeft: '-7px',
                    marginTop: '-14px',
                  }}
                >
                  <Box
                    style={{
                      height: 14,
                      width: 14,
                      borderRadius: 7,
                    }}
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <AnimatePresence>
                        {showChainBadge ? (
                          <Box
                            as={motion.div}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <ChainBadge chainId={chainId} size="14" />
                          </Box>
                        ) : null}
                      </AnimatePresence>
                    </Inline>
                  </Box>
                </Box>
              </Box>
            </Column>
            <Column>
              <Box position="relative">
                <Rows space="8px" alignVertical="center">
                  <Row height="content">
                    <TextOverflow color="label" size="14pt" weight="semibold">
                      {displayName}
                    </TextOverflow>
                  </Row>
                  <Row>
                    <Box position="relative">{subLabel}</Box>
                  </Row>
                </Rows>
              </Box>
            </Column>
          </Columns>
        </Lens>
      </Box>
    );
  },
);

AppConnectionWalletItem.displayName = 'AppConnectionWalletItem';
