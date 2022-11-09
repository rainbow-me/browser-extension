import * as React from 'react';
import { Link } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { useAppSessionsStore } from '~/core/state';
import { getConnectedAppIcon } from '~/core/utils/connectedApps';
import { Box, Inline, Inset, Row, Rows, Stack, Text } from '~/design-system';

import { useAppSession } from '../../hooks/useAppSession';
import { ChainBadge } from '../ChainBadge/ChainBadge';
import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';
import { SFSymbol, Symbols } from '../SFSymbol/SFSymbol';
import { supportedChains } from '../SwitchMenu/SwitchNetworkMenu';

interface HomePageHeaderProps {
  title: string;
  leftSymbol: Symbols;
  rightSymbol: Symbols;
  mainPage?: boolean;
}
const messenger = initializeMessenger({ connect: 'inpage' });

const HeaderActionButton = ({ symbol }: { symbol: Symbols }) => {
  return (
    <Box
      style={{
        height: '32px',
        width: '32px',
      }}
      background="surfaceSecondaryElevated"
      borderRadius="round"
      boxShadow="30px accent"
      borderColor="buttonStroke"
      borderWidth="1px"
    >
      <Inline
        space="4px"
        height="full"
        alignHorizontal="center"
        alignVertical="center"
      >
        <Inline alignHorizontal="center" alignVertical="center">
          <SFSymbol symbol={symbol} size={14} />
        </Inline>
      </Inline>
    </Box>
  );
};

const HeaderLeftMenu = ({ children }: { children: React.ReactNode }) => {
  const [host, setHost] = React.useState('');
  const { appSessions } = useAppSessionsStore();

  const { updateAppSessionChainId, disconnectAppSession, appSession } =
    useAppSession({ host });

  chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const url = tabs[0].url;
    if (url) {
      const host = new URL(url).host;
      setHost(host);
    }
  });
  const isConnectedToCurrentHost = appSessions?.[host];

  const shuffleChainId = React.useCallback(
    (chainId: string) => {
      updateAppSessionChainId(Number(chainId));
      messenger.send(`chainChanged:${host}`, chainId);
    },
    [host, updateAppSessionChainId],
  );

  const disconnect = React.useCallback(() => {
    disconnectAppSession();
    messenger.send(`disconnect:${host}`, null);
  }, [disconnectAppSession, host]);

  return (
    <Menu>
      <MenuTrigger asChild>
        <Box
          position="relative"
          style={{
            cursor: 'pointer',
          }}
          id="home-page-header-left"
        >
          {children}
        </Box>
      </MenuTrigger>
      <MenuContent>
        <Inset top="8px" bottom="12px">
          <Inline alignHorizontal="justify" alignVertical="center" space="8px">
            <Inline space="8px" alignVertical="center">
              <Box
                style={{
                  height: 14,
                  width: 14,
                  borderRadius: 3.5,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={getConnectedAppIcon(host)}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                id={`home-page-header-host-${
                  isConnectedToCurrentHost ? host : 'not-connected'
                }`}
              >
                <Rows space="8px">
                  <Row>
                    <Text size="14pt" weight="bold">
                      {host}
                    </Text>
                  </Row>
                  {!isConnectedToCurrentHost && (
                    <Row>
                      <Text size="11pt" weight="bold">
                        {i18n.t('page_header.not_connected')}
                      </Text>
                    </Row>
                  )}
                </Rows>
              </Box>
            </Inline>
            <SFSymbol
              size={6}
              color={isConnectedToCurrentHost ? 'green' : undefined}
              symbol="circleFill"
            />
          </Inline>
        </Inset>

        <Stack space="4px">
          <Stack space="12px">
            <MenuSeparator />
            <Text color="label" size="14pt" weight="semibold">
              {'Networks'}
            </Text>
          </Stack>

          <Box>
            <MenuRadioGroup
              value={`${appSession?.chainId}`}
              onValueChange={shuffleChainId}
            >
              {Object.keys(supportedChains).map((chain, i) => {
                const { chainId, name } = supportedChains[chain];
                return (
                  <MenuRadioItem value={chain} key={i}>
                    <Box
                      style={{
                        cursor: 'pointer',
                      }}
                      id={`switch-network-item-${i}`}
                    >
                      <Inline space="8px" alignVertical="center">
                        <ChainBadge chainId={chainId} size="small" />
                        <Text color="label" size="14pt" weight="semibold">
                          {name}
                        </Text>
                      </Inline>
                    </Box>
                  </MenuRadioItem>
                );
              })}
            </MenuRadioGroup>
            <Box style={{ cursor: 'pointer' }} as="button" onClick={disconnect}>
              <Inset vertical="8px">
                <Inline alignVertical="center" space="8px">
                  <Box style={{ width: 18, height: 18 }}>
                    <Inline
                      height="full"
                      alignVertical="center"
                      alignHorizontal="center"
                    >
                      <SFSymbol size={12} symbol="xmark" />
                    </Inline>
                  </Box>
                  <Text size="14pt" weight="bold">
                    {i18n.t('page_header.disconnect')}
                  </Text>
                </Inline>
              </Inset>
            </Box>
          </Box>

          <Stack space="4px">
            <MenuSeparator />

            <Inset vertical="8px">
              <Link id="home-page-header-connected-apps" to={'/connected'}>
                <Inline alignVertical="center" space="8px">
                  <Box style={{ width: 18, height: 18 }}>
                    <Inline
                      height="full"
                      alignVertical="center"
                      alignHorizontal="center"
                    >
                      <SFSymbol size={14} symbol="squareOnSquareDashed" />
                    </Inline>
                  </Box>
                  <Text size="14pt" weight="bold">
                    {i18n.t('page_header.all_connected_apps')}
                  </Text>
                </Inline>
              </Link>
            </Inset>
          </Stack>
        </Stack>

        <MenuItemIndicator style={{ marginLeft: 'auto' }}>o</MenuItemIndicator>
      </MenuContent>
    </Menu>
  );
};

const HeaderRighttMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Box
          position="relative"
          style={{
            cursor: 'pointer',
          }}
        >
          {children}
        </Box>
      </MenuTrigger>
      <MenuContent>
        <Stack space="4px">
          <Inset top="8px" bottom="8px">
            <Link to={'/settings'}>
              <Inline alignVertical="center" space="8px">
                <SFSymbol size={12} symbol="gearshapeFill" />
                <Text size="14pt" weight="bold">
                  {i18n.t('page_header.settings')}
                </Text>
              </Inline>
            </Link>
          </Inset>
          <Inset top="8px" bottom="8px">
            <Inline alignVertical="center" space="8px">
              <SFSymbol size={12} symbol="qrcode" />
              <Text size="14pt" weight="bold">
                {i18n.t('page_header.qr_code')}
              </Text>
            </Inline>
          </Inset>
        </Stack>
        <Stack space="4px">
          <MenuSeparator />
          <Box>
            <Inset top="8px" bottom="8px">
              <Inline alignVertical="center" space="8px">
                <SFSymbol size={12} symbol="personCropCircleFill" />
                <Text size="14pt" weight="bold">
                  {i18n.t('page_header.rainbow_profile')}
                </Text>
              </Inline>
            </Inset>
            <Inset top="8px" bottom="8px">
              <Inline alignVertical="center" space="8px">
                <SFSymbol size={12} symbol="binocularsFill" />
                <Text size="14pt" weight="bold">
                  {i18n.t('page_header.view_on_explorer')}
                </Text>
              </Inline>
            </Inset>
          </Box>
        </Stack>

        <MenuItemIndicator style={{ marginLeft: 'auto' }}>o</MenuItemIndicator>
      </MenuContent>
    </Menu>
  );
};

export function HomePageHeader({
  title,
  leftSymbol,
  rightSymbol,
}: HomePageHeaderProps) {
  return (
    <Box
      style={{
        height: '62px',
      }}
      paddingHorizontal="10px"
    >
      <Inline alignVertical="center" height="full" alignHorizontal="justify">
        <HeaderLeftMenu>
          <HeaderActionButton symbol={leftSymbol} />
        </HeaderLeftMenu>

        <Box>
          <Text size="14pt" weight="heavy">
            {title}
          </Text>
        </Box>

        <HeaderRighttMenu>
          <HeaderActionButton symbol={rightSymbol} />
        </HeaderRighttMenu>
      </Inline>
    </Box>
  );
}
