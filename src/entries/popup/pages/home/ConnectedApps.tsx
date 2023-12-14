import { Address } from '@wagmi/core';
import { useCallback, useState } from 'react';
import { useEnsName } from 'wagmi';

import appsConnectedImageMask from 'static/assets/appsConnectedImageMask.svg';
import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { AppSession } from '~/core/state/appSessions';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Bleed,
  Box,
  Button,
  ButtonSymbol,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import { DappIcon } from '../../components/DappIcon/DappIcon';
import { ConnectedAppNetworkMenu } from '../../components/SwitchMenu/ConnectedAppNetworkMenu';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { useAppSession } from '../../hooks/useAppSession';
import { useAppSessions } from '../../hooks/useAppSessions';

export const ConnectedApps = () => {
  const { appSessions, disconnectAppSessions } = useAppSessions();
  const { currentAddress } = useCurrentAddressStore();

  const filteredSessions = Object.values(appSessions).reduce(
    (acc: [AppSession[], AppSession[]], session: AppSession) => (
      acc[
        isLowerCaseMatch(session.activeSessionAddress, currentAddress) ? 0 : 1
      ].push(session),
      acc
    ),
    [[], []],
  );

  const noConnectedApps =
    !filteredSessions?.[0]?.length && !filteredSessions?.[1]?.length;

  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
          height: 489,
        }}
      >
        {noConnectedApps && (
          <Box
            style={{ height: '100%', width: '100%', display: 'flex' }}
            alignItems="center"
            justifyContent="center"
          >
            <Stack alignHorizontal="center" space="16px">
              <Symbol
                symbol="square.dashed"
                size={26}
                color={'labelTertiary'}
                weight="bold"
              />
              <Text size="20pt" color="labelTertiary" weight="medium">
                {i18n.t('connected_apps.no_connections_title')}
              </Text>
              <Text size="11pt" color="labelTertiary" weight="medium">
                {i18n.t('connected_apps.no_connections_copy')}
              </Text>
            </Stack>
          </Box>
        )}

        <Stack space="16px">
          <Rows alignVertical="top">
            {filteredSessions?.[0]?.map((session, i) => (
              <Row height="content" key={i}>
                <ConnectedApp
                  host={session.host}
                  url={session.url}
                  address={session.activeSessionAddress}
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
                      address={session.activeSessionAddress}
                    />
                  </Row>
                ))}
              </Rows>
            </>
          )}
        </Stack>
      </Box>

      {!noConnectedApps && (
        <Box
          borderColor="separatorSecondary"
          borderWidth="1px"
          alignItems="center"
          bottom="0"
          left="0"
          right="0"
          style={{ overflow: 'hidden' }}
        >
          <Inline alignHorizontal="center">
            <Button
              onClick={disconnectAppSessions}
              color="surfacePrimaryElevated"
              height="44px"
              variant="stroked"
            >
              <Inline
                alignHorizontal="center"
                alignVertical="center"
                space="8px"
              >
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
      )}
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
  const { disconnectAppSession, activeSession } = useAppSession({
    host,
  });
  const { data: dappMetadata } = useDappMetadata({ url });

  const onMouseEnter = useCallback(() => setDisconnectButtonVisible(true), []);
  const onMouseLeave = useCallback(() => setDisconnectButtonVisible(false), []);

  return (
    <Box
      paddingHorizontal="8px"
      testId={`connected-app-${dappMetadata?.appHost}`}
    >
      <Box
        background={{
          default: 'transparent',
          hover: 'surfacePrimaryElevatedSecondary',
        }}
        borderRadius="12px"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Columns>
          <Column>
            <ConnectedAppNetworkMenu
              url={url}
              menuTriggerId={`connected-app-menu-${dappMetadata?.appHost}`}
            >
              <Inset horizontal="12px" vertical="8px">
                <Inline alignHorizontal="justify" alignVertical="center">
                  <Columns space="8px">
                    <Column width="content">
                      <DappIcon
                        appLogo={dappMetadata?.appLogo}
                        size="36px"
                        mask={appsConnectedImageMask}
                      />
                      <Box
                        style={{
                          marginLeft: '-7px',
                          marginTop: '-10.5px',
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
                            <Bleed top="7px">
                              <ChainBadge
                                chainId={
                                  activeSession?.chainId || ChainId.mainnet
                                }
                                size="14"
                              />
                            </Bleed>
                          </Inline>
                        </Box>
                      </Box>
                    </Column>

                    <Column>
                      <Box>
                        <Stack space="8px">
                          <Box style={{ wordBreak: 'break-all' }}>
                            <TextOverflow
                              align="left"
                              size="14pt"
                              weight="semibold"
                              color="label"
                            >
                              {dappMetadata?.appName || dappMetadata?.appHost}
                            </TextOverflow>
                          </Box>
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
                                addressOrName={address}
                                size={16}
                                emojiSize="12pt"
                              />
                            </Box>
                            <Text
                              color="labelTertiary"
                              size="12pt"
                              weight="semibold"
                              testId={`connected-app-${dappMetadata?.appHost}-${
                                ensName || truncateAddress(address)
                              }`}
                            >
                              {ensName || truncateAddress(address)}
                            </Text>
                          </Inline>
                        </Stack>
                      </Box>
                    </Column>
                  </Columns>
                </Inline>
              </Inset>
            </ConnectedAppNetworkMenu>
          </Column>
          <Column width="content">
            {disconnectButtonVisible && (
              <Box paddingTop="12px" paddingRight="12px">
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
          </Column>
        </Columns>
      </Box>
    </Box>
  );
};
