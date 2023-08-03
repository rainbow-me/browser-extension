import React, { useEffect, useMemo, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Text,
  TextOverflow,
} from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { Account, useAccounts } from '../../hooks/useAccounts';
import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { zIndexes } from '../../utils/zIndexes';
import ExternalImage from '../ExternalImage/ExternalImage';
import { Navbar } from '../Navbar/Navbar';

import AppConnectionWalletItem from './AppConnectionWalletItem';

export const AppConnectionWalletSwitcher = () => {
  const [show, setshow] = useState(false);
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const { appHost, appLogo } = useAppMetadata({ url });

  const { appSession } = useAppSession({ host: appHost });

  const { sortedAccounts } = useAccounts(({ sortedAccounts }) => ({
    sortedAccounts,
  }));

  useEffect(() => {
    setTimeout(() => {
      if (
        appSession &&
        !isLowerCaseMatch(appSession?.address, currentAddress)
      ) {
        setshow(true);
      }
    }, 1000);
  }, [appSession, appSession?.address, currentAddress]);

  const { connectedAccounts, notConnectedAccounts } = useMemo(() => {
    const appSessionAccounts = [appSession?.address];

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
  }, [appSession?.address, sortedAccounts]);

  return (
    <Prompt show={show} zIndex={zIndexes.BOTTOM_SHEET} padding="12px">
      <Box>
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
                background="fill"
                borderWidth="1px"
                borderColor="buttonStroke"
              >
                <Inline
                  alignHorizontal="center"
                  alignVertical="center"
                  height="full"
                >
                  <ExternalImage src={appLogo} width="10" height="10" />
                </Inline>
              </Box>
              <Text size="14pt" weight="heavy" align="center">
                {'Switch Wallets'}
              </Text>
            </Inline>
          }
        />

        <Box paddingHorizontal="8px">
          <Stack space="8px">
            <Box paddingTop="8px">
              <Stack space="8px">
                <Box paddingHorizontal="12px">
                  <Text weight="semibold" size="14pt" color="labelTertiary">
                    {'Connected'}
                  </Text>
                </Box>
                <Box>
                  {connectedAccounts.map((account) => (
                    <AppConnectionWalletItem
                      key={account.address}
                      onClick={() => null}
                      account={account.address}
                      chainId={appSession.chainId}
                    />
                  ))}
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
                    {'Other Wallets'}
                  </Text>
                </Box>
                <Box>
                  {notConnectedAccounts.map((account) => (
                    <AppConnectionWalletItem
                      key={account.address}
                      onClick={() => null}
                      account={account.address}
                      chainId={ChainId.mainnet}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Separator strokeWeight="1px" color="separatorSecondary" />
        <Box padding="20px">
          <Box width="full">
            <Button
              color="fillSecondary"
              height="44px"
              width="full"
              onClick={undefined}
              variant="plain"
              disabled={false}
              tabIndex={0}
            >
              <TextOverflow weight="bold" size="16pt" color="label">
                {'Cancel'}
              </TextOverflow>
            </Button>
          </Box>
        </Box>
      </Box>
    </Prompt>
  );
};
