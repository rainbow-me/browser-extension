import React, { useEffect, useState } from 'react';

import appConnectionSheetImageMask from 'static/assets/appConnectionSheetImageMask.svg';
import { i18n } from '~/core/languages';
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

  const { appSession, activeSession } = useAppSession({ host: appHost });
  useEffect(() => {
    setTimeout(() => {
      if (!isLowerCaseMatch(activeSession?.address, currentAddress)) {
        setshow(true);
      }
    }, 1000);
  }, [appSession, activeSession?.address, currentAddress]);

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
                      overflow: 'hidden',
                    }}
                    borderRadius="6px"
                    background="fill"
                    borderWidth="1px"
                    borderColor="buttonStroke"
                  >
                    <Inline
                      alignHorizontal="center"
                      alignVertical="center"
                      height="full"
                    >
                      <ExternalImage src={appLogo} width="14" height="14" />
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
                    {i18n.t('app_connection_switcher.sheet.connect_to', {
                      appName: appName || appHost,
                    })}
                  </TextOverflow>
                </Stack>
                <Text
                  color="labelTertiary"
                  size="12pt"
                  weight="medium"
                  align="center"
                >
                  {i18n.t('app_connection_switcher.sheet.allow_to', {
                    appName: appName || appHost,
                  })}
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
                    {i18n.t('app_connection_switcher.sheet.connect')}
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
                      {i18n.t(
                        'app_connection_switcher.sheet.connect_different_wallet',
                      )}
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
                  {i18n.t('app_connection_switcher.sheet.dont_show_again')}
                </Text>
              </Inline>
            </Stack>
          </Box>
        </Box>
      </BottomSheet>
    </>
  );
};
