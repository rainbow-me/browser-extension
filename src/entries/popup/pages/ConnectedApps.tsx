import React, { useCallback, useState } from 'react';
import { Address, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { useAppSessionsStore, useCurrentAddressStore } from '~/core/state';
import { AppSession } from '~/core/state/appSessions';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

import { AppNetworkMenu } from '../components/SwitchMenu/AppNetworkMenu';
import { WalletAvatar } from '../components/WalletAvatar/WalletAvatar';
import { useAppMetadata } from '../hooks/useAppMetadata';
import { useAppSession } from '../hooks/useAppSession';

export const ConnectedApps = () => {
  const { appSessions, clearSessions } = useAppSessionsStore();
  const { currentAddress } = useCurrentAddressStore();

  const filteredSessions = Object.values(appSessions).reduce(
    (acc: [AppSession[], AppSession[]], session: AppSession) => (
      acc[isLowerCaseMatch(session.address, currentAddress) ? 0 : 1].push(
        session,
      ),
      acc
    ),
    [[], []],
  );

  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
          height: 489,
        }}
      >
        <Stack space="16px">
          <Rows alignVertical="top">
            {filteredSessions?.[0]?.map((session, i) => (
              <Row height="content" key={i}>
                <ConnectedApp
                  host={session.host}
                  url={session.url}
                  address={session.address}
                />
              </Row>
            ))}
          </Rows>

          {filteredSessions[1].length > 0 && (
            <>
              <Box paddingHorizontal="20px">
                <Text size="14pt" color="labelTertiary" weight="semibold">
                  {i18n.t('connected_apps.other_wallets')}
                </Text>
              </Box>

              <Rows alignVertical="top">
                {filteredSessions?.[1]?.map((session, i) => (
                  <Row height="content" key={i}>
                    <ConnectedApp
                      host={session.host}
                      url={session.url}
                      address={session.address}
                    />
                  </Row>
                ))}
              </Rows>
            </>
          )}
        </Stack>
      </Box>

      <Box
        borderColor="separatorSecondary"
        borderWidth="1px"
        alignItems="center"
        bottom="0"
        left="0"
        right="0"
      >
        <Inline alignHorizontal="center">
          <Button
            onClick={clearSessions}
            color="surfacePrimaryElevated"
            height="44px"
            variant="stroked"
          >
            <Inline alignHorizontal="center" alignVertical="center" space="8px">
              <Symbol
                symbol={'xmark'}
                color="red"
                size={12}
                weight="semibold"
              />
              <Text color="red" size="14pt" weight="bold">
                {i18n.t('connected_apps.disconnect')}
              </Text>
            </Inline>
          </Button>
        </Inline>
      </Box>
    </Box>
  );
};

const ConnectedApp = ({
  host,
  url,
  address,
}: {
  host: string;
  url: string;
  address: Address;
}) => {
  const [disconnectButtonVisible, setDisconnectButtonVisible] = useState(false);
  const { data: ensName } = useEnsName({ address });
  const { disconnectAppSession } = useAppSession({
    host,
  });
  const { appLogo, appName, appHost } = useAppMetadata({ url });

  const onMouseEnter = useCallback(() => setDisconnectButtonVisible(true), []);
  const onMouseLeave = useCallback(() => setDisconnectButtonVisible(false), []);

  return (
    <Box paddingHorizontal="8px">
      <Box
        background={{
          default: 'transparent',
          hover: 'surfacePrimaryElevatedSecondary',
        }}
        borderRadius="12px"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {disconnectButtonVisible && (
          <Box position="absolute" paddingTop="12px" style={{ right: 20 }}>
            <ButtonSymbol
              color="red"
              height="28px"
              variant="raised"
              symbol="xmark"
              borderRadius="8px"
              onClick={disconnectAppSession}
            />
          </Box>
        )}
        <AppNetworkMenu displayConnectedRoute={false} align="end" url={url}>
          <Box>
            <Box id="switch-network-menu">
              <Inset horizontal="12px" vertical="8px">
                <Inline alignHorizontal="justify" alignVertical="center">
                  <Inline space="8px" alignVertical="center">
                    <Box
                      background="fill"
                      borderRadius="12px"
                      style={{
                        width: '36px',
                        height: '36px',
                        overflow: 'hidden',
                      }}
                    >
                      <img src={appLogo} width="100%" height="100%" />
                    </Box>
                    <Box>
                      <Stack space="8px">
                        <Text
                          align="left"
                          size="14pt"
                          weight="semibold"
                          color="label"
                        >
                          {appName || appHost}
                        </Text>
                        <Inline space="4px" alignVertical="center">
                          <Box
                            background="fill"
                            borderRadius="30px"
                            style={{
                              width: '16px',
                              height: '16px',
                              overflow: 'hidden',
                            }}
                          >
                            <WalletAvatar
                              address={address}
                              size={16}
                              emojiSize="12pt"
                            />
                          </Box>
                          <Text
                            color="labelTertiary"
                            size="12pt"
                            weight="semibold"
                          >
                            {ensName || truncateAddress(address)}
                          </Text>
                        </Inline>
                      </Stack>
                    </Box>
                  </Inline>
                </Inline>
              </Inset>
            </Box>
          </Box>
        </AppNetworkMenu>
      </Box>
    </Box>
  );
};
