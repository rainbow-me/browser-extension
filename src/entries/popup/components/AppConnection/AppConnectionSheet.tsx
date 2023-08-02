import React, { useEffect, useState } from 'react';

import appConnectionSheetImageMask from 'static/assets/appConnectionSheetImageMask.svg';
import { useCurrentAddressStore } from '~/core/state';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Box,
  Button,
  Inline,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useWalletName } from '../../hooks/useWalletName';
import { zIndexes } from '../../utils/zIndexes';
import { Checkbox } from '../Checkbox/Checkbox';
import ExternalImage from '../ExternalImage/ExternalImage';
import { Navbar } from '../Navbar/Navbar';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

export const AppConnectionSheet = () => {
  const [show, setshow] = useState(false);
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress || '0x' });
  const { url } = useActiveTab();
  const { appHost, appName, appLogo } = useAppMetadata({ url });

  const { appSession } = useAppSession({ host: appHost });
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

  return (
    <>
      <BottomSheet show={show} zIndex={zIndexes.BOTTOM_SHEET}>
        <Box>
          <Navbar
            leftComponent={
              <Navbar.CloseButton onClick={() => setshow(false)} />
            }
          />
          <Box marginTop="-16px">
            <Stack space="24px" alignHorizontal="center">
              <Box>
                <WalletAvatar
                  address={currentAddress}
                  size={44}
                  background="transparent"
                  mask={appConnectionSheetImageMask}
                />
                <Box
                  position="absolute"
                  style={{
                    marginLeft: '-9px',
                    marginTop: '-18px',
                    borderRadius: '8px',
                  }}
                >
                  <Box
                    style={{
                      height: '18px',
                      width: '18px',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <ExternalImage src={appLogo} width="18" height="18" />
                    </Inline>
                  </Box>
                </Box>
              </Box>
              <Stack space="16px" alignHorizontal="center">
                <Stack space="10px" alignHorizontal="center">
                  <Inline space="4px" alignVertical="center">
                    <Symbol
                      symbol="circle"
                      size={8}
                      weight="medium"
                      color="labelTertiary"
                    />
                    <TextOverflow color="label" size="12pt" weight="bold">
                      {displayName}
                    </TextOverflow>
                  </Inline>
                  <TextOverflow color="label" size="12pt" weight="bold">
                    {`Connect to ${appName || appHost}?`}
                  </TextOverflow>
                </Stack>
                <Text
                  color="labelTertiary"
                  size="12pt"
                  weight="medium"
                  align="center"
                >
                  {`Allow ${
                    appName || appHost
                  } to view your wallet address, balance, activity
                  and request approval for transactions.`}
                </Text>
              </Stack>
            </Stack>
          </Box>
          <Box padding="20px">
            <Stack space="16px" alignHorizontal="center">
              <Box width="full">
                <Stack space="8px">
                  <Button
                    symbol="return.left"
                    symbolSide="left"
                    width="full"
                    color={'accent'}
                    height="44px"
                    onClick={undefined}
                    variant={'flat'}
                    disabled={false}
                    tabIndex={0}
                    enterCta
                  >
                    {'Connect'}
                  </Button>
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
                      {'Connect different wallet'}
                    </TextOverflow>
                  </Button>
                </Stack>
              </Box>

              <Inline alignVertical="center" space="4px">
                <Checkbox selected={false} />
                <Text
                  align="center"
                  weight="semibold"
                  size="12pt"
                  color="labelSecondary"
                >
                  Don’t show this again
                </Text>
              </Inline>
            </Stack>
          </Box>
        </Box>
      </BottomSheet>
    </>
  );
};
