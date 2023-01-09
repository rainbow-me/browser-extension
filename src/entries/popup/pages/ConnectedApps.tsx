import * as React from 'react';
import { Address, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { useAppSessionsStore } from '~/core/state';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Box,
  Button,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

import { SwitchNetworkMenu } from '../components/SwitchMenu/SwitchNetworkMenu';
import { WalletAvatar } from '../components/WalletAvatar/WalletAvatar';
import { useAppMetadata } from '../hooks/useAppMetadata';
import { useAppSession } from '../hooks/useAppSession';

export function ConnectedApps() {
  const { appSessions, clearSessions } = useAppSessionsStore();
  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
          height: 489,
        }}
      >
        <Rows alignVertical="top">
          {Object.keys(appSessions).map((key, i) => (
            <Row height="content" key={i}>
              <ConnectedApp
                host={appSessions[key].host}
                url={appSessions[key].url}
                address={appSessions[key].address}
                chainId={appSessions[key].chainId}
              />
            </Row>
          ))}
        </Rows>
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
}

function ConnectedApp({
  host,
  url,
  address,
  chainId,
}: {
  host: string;
  url: string;
  address: Address;
  chainId: number;
}) {
  const { data: ensName } = useEnsName({ address });
  const { updateAppSessionChainId, disconnectAppSession } = useAppSession({
    host,
  });
  const { appLogo, appName } = useAppMetadata({ url });

  return (
    <SwitchNetworkMenu
      onChainChanged={updateAppSessionChainId}
      chainId={chainId}
      onDisconnect={disconnectAppSession}
      triggerComponent={
        <Box width="full" paddingHorizontal="8px">
          <Box
            id="switch-network-menu"
            background={{
              default: 'transparent',
              hover: 'surfaceSecondaryElevated',
            }}
            borderRadius="12px"
          >
            <Inset horizontal="12px" vertical="8px">
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
                      {`${appName}`}
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
                      <Text color="labelTertiary" size="12pt" weight="semibold">
                        {ensName || truncateAddress(address)}
                      </Text>
                    </Inline>
                  </Stack>
                </Box>
              </Inline>
            </Inset>
          </Box>
        </Box>
      }
    />
  );
}
