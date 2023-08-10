import React, { useEffect, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
  TextOverflow,
} from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { Account, useAccounts } from '../../hooks/useAccounts';
import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { zIndexes } from '../../utils/zIndexes';
import ExternalImage from '../ExternalImage/ExternalImage';
import { Navbar } from '../Navbar/Navbar';

import { AppConnectionWalletItem } from './AppConnectionWalletItem';
import { AppConnectionWalletItemDropdownMenu } from './AppConnectionWalletItemDropdownMenu';

export const AppConnectionWalletSwitcher = () => {
  const [show, setshow] = useState(false);
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const appMetadata = useAppMetadata({ url });

  const { appSession, activeSession, addSession, updateAppSessionAddress } =
    useAppSession({
      host: appMetadata.appHost,
    });

  const { sortedAccounts } = useAccounts(({ sortedAccounts }) => ({
    sortedAccounts,
  }));

  useEffect(() => {
    setTimeout(() => {
      if (
        appSession &&
        !isLowerCaseMatch(activeSession?.address, currentAddress)
      ) {
        setshow(true);
      }
    }, 1000);
  }, [appSession, activeSession?.address, currentAddress]);

  const { connectedAccounts, notConnectedAccounts } = useMemo(() => {
    const appSessionAccounts = Object.keys(appSession?.sessions || {});
    const [connectedAccounts, notConnectedAccounts] = sortedAccounts.reduce(
      (result, item) => {
        const [matching, nonMatching] = result;
        if (appSessionAccounts.includes(item?.address)) {
          matching.push(item);
        } else {
          nonMatching.push(item);
        }
        return [matching, nonMatching];
      },
      [[] as Account[], [] as Account[]],
    );
    return { connectedAccounts, notConnectedAccounts };
  }, [appSession?.sessions, sortedAccounts]);

  return (
    <Prompt show={show} zIndex={zIndexes.BOTTOM_SHEET} padding="12px">
      <Box style={{ height: '576px' }}>
        <Rows alignVertical="justify">
          <Row>
            <Navbar
              leftComponent={
                <Navbar.CloseButton
                  onClick={() => setshow(false)}
                  variant="transparent"
                />
              }
              titleComponent={
                <Inline alignVertical="center" space="4px">
                  <Box
                    style={{
                      height: '14px',
                      width: '14px',
                      overflow: 'hidden',
                    }}
                    borderRadius="4px"
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <ExternalImage
                        src={appMetadata.appLogo}
                        width="14"
                        height="14"
                      />
                    </Inline>
                  </Box>
                  <Text size="14pt" weight="heavy" align="center">
                    {i18n.t(
                      'app_connection_switcher.wallet_switcher.switch_wallets',
                    )}
                  </Text>
                </Inline>
              }
            />

            <Box
              paddingHorizontal="8px"
              style={{ overflow: 'scroll', height: '428px' }}
            >
              <Stack space="8px">
                <Box paddingTop="8px">
                  <Stack space="8px">
                    <Box paddingHorizontal="12px">
                      <Text weight="semibold" size="14pt" color="labelTertiary">
                        {i18n.t(
                          'app_connection_switcher.wallet_switcher.connected',
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <AccentColorProviderWrapper color="red">
                        {connectedAccounts.map((account) => (
                          <Box key={account.address} position="relative">
                            <AppConnectionWalletItem
                              key={account.address}
                              onClick={() =>
                                updateAppSessionAddress({
                                  address: account.address,
                                })
                              }
                              address={account.address}
                              chainId={appSession.sessions?.[account.address]}
                              active={isLowerCaseMatch(
                                activeSession?.address,
                                account.address,
                              )}
                              connected={true}
                              appMetadata={appMetadata}
                            />
                            <Box
                              position="absolute"
                              style={{ top: 10, right: 3 }}
                            >
                              <AppConnectionWalletItemDropdownMenu
                                appMetadata={appMetadata}
                                address={account.address}
                              />
                            </Box>
                          </Box>
                        ))}
                      </AccentColorProviderWrapper>
                    </Box>
                  </Stack>
                </Box>
                <Box paddingHorizontal="8px">
                  <Separator strokeWeight="1px" color="separatorSecondary" />
                </Box>
                <Box paddingTop="8px">
                  <Stack space="8px">
                    <Box paddingHorizontal="12px">
                      <Text weight="semibold" size="14pt" color="labelTertiary">
                        {i18n.t(
                          'app_connection_switcher.wallet_switcher.other_wallets',
                        )}
                      </Text>
                    </Box>
                    <Box>
                      <AccentColorProviderWrapper color="green">
                        {notConnectedAccounts.map((account) => (
                          <AppConnectionWalletItem
                            key={account.address}
                            onClick={() => {
                              addSession({
                                host: appMetadata.appHost,
                                address: account.address,
                                chainId:
                                  activeSession?.chainId || ChainId.mainnet,
                                url: appMetadata.appHost,
                              });
                            }}
                            address={account.address}
                            chainId={ChainId.mainnet}
                            connected={false}
                            appMetadata={appMetadata}
                          />
                        ))}
                      </AccentColorProviderWrapper>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Row>

          <Row height="content">
            <Separator strokeWeight="1px" color="separatorSecondary" />

            <Box padding="20px">
              <Box width="full">
                <Button
                  color="fillSecondary"
                  height="44px"
                  width="full"
                  onClick={() => setshow(false)}
                  variant="plain"
                  disabled={false}
                  tabIndex={0}
                >
                  <TextOverflow weight="bold" size="16pt" color="label">
                    {i18n.t('app_connection_switcher.wallet_switcher.cancel')}
                  </TextOverflow>
                </Button>
              </Box>
            </Box>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
};
