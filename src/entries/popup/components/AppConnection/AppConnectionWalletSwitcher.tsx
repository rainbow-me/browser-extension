import EventEmitter from 'events';

import { useEffect, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
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
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { Account, useAccounts } from '../../hooks/useAccounts';
import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppSession } from '../../hooks/useAppSession';
import { zIndexes } from '../../utils/zIndexes';
import { DappIcon } from '../DappIcon/DappIcon';
import { Navbar } from '../Navbar/Navbar';

import { AppConnectionWalletItem } from './AppConnectionWalletItem/AppConnectionWalletItem';
import { AppConnectionWalletItemDropdownMenu } from './AppConnectionWalletItem/AppConnectionWalletItemDropdownMenu';

interface WalletSwitcherProps {
  show: boolean;
  callback?: () => void;
}

const eventEmitter = new EventEmitter();

const listenWalletSwitcher = (
  callback: ({ callback }: WalletSwitcherProps) => void,
) => {
  eventEmitter.addListener('rainbow_app_connection_wallet_switcher', callback);
  return () => {
    eventEmitter.removeListener(
      'rainbow_app_connection_wallet_switcher',
      callback,
    );
  };
};

export const triggerWalletSwitcher = ({
  show,
  callback,
}: WalletSwitcherProps) => {
  eventEmitter.emit('rainbow_app_connection_wallet_switcher', {
    show,
    callback,
  });
};

export const AppConnectionWalletSwitcher = () => {
  const [walletSwitcher, setWalletSwitcher] = useState<WalletSwitcherProps>({
    show: false,
    callback: undefined,
  });

  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });

  useEffect(() => listenWalletSwitcher(setWalletSwitcher), []);

  const hideWalletSwitcher = () =>
    setWalletSwitcher({ show: false, callback: undefined });

  const { appSession, activeSession, addSession, updateAppSessionAddress } =
    useAppSession({
      host: dappMetadata?.appHost || '',
    });

  const { sortedAccounts } = useAccounts(({ sortedAccounts }) => ({
    sortedAccounts,
  }));

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
    <Prompt
      show={walletSwitcher.show}
      zIndex={zIndexes.APP_CONNECTION_WALLET_SWITCHER}
      padding="12px"
      backdropFilter={'blur(26px)'}
    >
      <Box
        id="app-connection-switch-wallets-prompt"
        testId="app-connection-wallet-switcher"
        style={{ height: '576px' }}
      >
        <Rows alignVertical="justify">
          <Row>
            <Navbar
              leftComponent={
                <Navbar.CloseButton
                  onClick={hideWalletSwitcher}
                  variant="transparent"
                />
              }
              titleComponent={
                <Inline alignVertical="center" space="6px">
                  <DappIcon appLogo={dappMetadata?.appLogo} size="14px" />
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
                      <AccentColorProvider color="red">
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
                            />
                            <Box
                              position="absolute"
                              style={{ top: 10, right: 3 }}
                            >
                              <AppConnectionWalletItemDropdownMenu
                                dappMetadata={dappMetadata}
                                address={account.address}
                              />
                            </Box>
                          </Box>
                        ))}
                      </AccentColorProvider>
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
                      <AccentColorProvider color="green">
                        {notConnectedAccounts.map((account) => (
                          <AppConnectionWalletItem
                            key={account.address}
                            onClick={() => {
                              dappMetadata?.appHost &&
                                addSession({
                                  host: dappMetadata.appHost,
                                  address: account.address,
                                  chainId:
                                    activeSession?.chainId || ChainId.mainnet,
                                  url,
                                });
                            }}
                            address={account.address}
                            chainId={ChainId.mainnet}
                            connected={false}
                          />
                        ))}
                      </AccentColorProvider>
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
                  onClick={hideWalletSwitcher}
                  variant="plain"
                  disabled={false}
                  tabIndex={0}
                >
                  <TextOverflow weight="bold" size="16pt" color="label">
                    {i18n.t('app_connection_switcher.wallet_switcher.done')}
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
