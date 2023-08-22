import React, { useEffect, useState } from 'react';

import appConnectionSheetImageMask from 'static/assets/appConnectionSheetImageMask.svg';
import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
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
import { useDebounce } from '../../hooks/useDebounce';
import usePrevious from '../../hooks/usePrevious';
import { useWalletName } from '../../hooks/useWalletName';
import { zIndexes } from '../../utils/zIndexes';
import { Checkbox } from '../Checkbox/Checkbox';
import ExternalImage from '../ExternalImage/ExternalImage';
import { Navbar } from '../Navbar/Navbar';
import { WalletAvatar } from '../WalletAvatar/WalletAvatar';

import { AppConnectionWalletSwitcher } from './AppConnectionWalletSwitcher';

export const AppConnectionNudgeSheet = ({
  show,
  showWalletSwitcher,
  connect,
  setShow,
  setShowWalletSwitcher,
}: {
  show: boolean;
  showWalletSwitcher: boolean;
  connect: () => void;
  setShow: (show: boolean) => void;
  setShowWalletSwitcher: (show: boolean) => void;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress || '0x' });
  const { url } = useActiveTab();
  const { appHost, appName, appLogo } = useAppMetadata({ url });
  const { setNudgeSheetDisabled } = useAppConnectionWalletSwitcherStore();
  const previousShow = usePrevious(show);
  const name = useDebounce(displayName, 500);

  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const connectToDifferentWallet = () => {
    setShowWalletSwitcher(true);
    setShow(false);
  };

  useEffect(() => {
    if (previousShow && !show && doNotShowAgain) {
      setNudgeSheetDisabled();
    }
  }, [doNotShowAgain, previousShow, setNudgeSheetDisabled, show]);

  return (
    <>
      <AppConnectionWalletSwitcher
        show={showWalletSwitcher}
        setShow={setShowWalletSwitcher}
      />
      <BottomSheet show={show} zIndex={zIndexes.BOTTOM_SHEET}>
        <Box testId="app-connection-nudge-sheet">
          <Navbar
            leftComponent={
              <Navbar.CloseButton onClick={() => setShow(false)} />
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
                      {name}
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
                    testId="nudge-sheet-connect"
                    symbol="return.left"
                    symbolSide="left"
                    width="full"
                    color={'accent'}
                    height="44px"
                    onClick={connect}
                    variant={'flat'}
                    disabled={false}
                    tabIndex={0}
                    enterCta
                  >
                    {i18n.t('app_connection_switcher.sheet.connect')}
                  </Button>
                  <Button
                    testId="nudge-sheet-connect-different-wallet"
                    color="fillSecondary"
                    height="44px"
                    width="full"
                    onClick={connectToDifferentWallet}
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
                <Checkbox
                  onClick={() =>
                    setDoNotShowAgain((doNotShowAgain) => !doNotShowAgain)
                  }
                  selected={doNotShowAgain}
                />
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
