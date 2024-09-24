import chroma from 'chroma-js';
import React from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import {
  AccentColorProvider,
  Box,
  Column,
  Columns,
  Inline,
  Stack,
  Symbol,
  TextOverflow,
} from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { NudgeBanner } from '~/design-system/components/NudgeBanner/NudgeBanner';
import { globalColors } from '~/design-system/styles/designTokens';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAvatar } from '../../hooks/useAvatar';
import { useWalletName } from '../../hooks/useWalletName';
import { zIndexes } from '../../utils/zIndexes';
import { DappIcon } from '../DappIcon/DappIcon';

export const AppConnectionNudgeBanner = ({
  show,
  connect,
  hide,
  bannerHoverRef,
}: {
  show: boolean;
  connect: () => void;
  hide: () => void;
  bannerHoverRef: React.MutableRefObject<boolean>;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentTheme } = useCurrentThemeStore();
  const { displayName } = useWalletName({ address: currentAddress || '0x' });
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });

  const accentWithOpacity = React.useCallback(
    (opacity: number) => {
      const color = avatar?.color || globalColors.blue50;
      return chroma(color).alpha(opacity).css();
    },
    [avatar],
  );

  const useDarkForegroundColor =
    chroma.contrast(avatar?.color || globalColors.blue50, '#fff') < 2.125;

  return (
    <NudgeBanner show={show} zIndex={zIndexes.BOTTOM_SHEET}>
      <Box
        onMouseEnter={() => {
          bannerHoverRef.current = true;
        }}
        onMouseLeave={() => {
          bannerHoverRef.current = false;
        }}
        padding="9px"
        testId="app-connection-nudge-banner"
      >
        <Columns>
          <Column>
            <Columns alignVertical="center" space="10px">
              <Column width="content">
                <Box
                  background="fillSecondary"
                  borderRadius="10px"
                  boxShadow="12px"
                  position="relative"
                  style={{
                    height: '36px',
                    overflow: 'hidden',
                    width: '36px',
                  }}
                >
                  <DappIcon appLogo={dappMetadata?.appLogo} size="36px" />
                </Box>
              </Column>
              <Column>
                <Box paddingRight="10px">
                  <Stack space="8px">
                    <Inline alignVertical="center" space="4px">
                      <Box
                        background="transparent"
                        borderColor="fill"
                        borderRadius="round"
                        borderWidth="1.5px"
                        style={{ borderWidth: 1.5, height: 8, width: 8 }}
                      />
                      <TextOverflow
                        color="labelSecondary"
                        size="12pt"
                        weight="bold"
                      >
                        {displayName}
                      </TextOverflow>
                    </Inline>
                    <TextOverflow color="label" size="14pt" weight="bold">
                      {i18n.t('app_connection_switcher.banner.connect_to', {
                        appName:
                          dappMetadata?.appName ||
                          dappMetadata?.appHost ||
                          'dApp',
                      })}
                    </TextOverflow>
                  </Stack>
                </Box>
              </Column>
            </Columns>
          </Column>
          <Column width="content">
            <Inline space="4px">
              <ButtonOverflow>
                <Box
                  borderRadius="10px"
                  onClick={connect}
                  padding="3px"
                  style={{
                    backgroundColor: accentWithOpacity(0.25),
                    boxShadow: `0 0 10px 2px ${accentWithOpacity(0.2)}`,
                    height: 36,
                    width: 36,
                  }}
                  testId="nudge-banner-connect"
                  tabIndex={0}
                >
                  <Box
                    alignItems="center"
                    borderRadius="7px"
                    borderWidth="1.5px"
                    display="flex"
                    justifyContent="center"
                    paddingTop="1px"
                    style={{
                      backgroundColor: accentWithOpacity(
                        currentTheme === 'dark' ? 0.6 : 1,
                      ),
                      borderColor: accentWithOpacity(0.8),
                      height: 30,
                      width: 30,
                    }}
                  >
                    <AccentColorProvider
                      color={
                        useDarkForegroundColor
                          ? globalColors.grey100
                          : globalColors.white100
                      }
                      respectColor
                    >
                      <Box
                        style={{ opacity: useDarkForegroundColor ? 0.65 : 1 }}
                      >
                        <Symbol
                          color="accent"
                          size={14.75}
                          symbol="return.left"
                          weight="heavy"
                        />
                      </Box>
                    </AccentColorProvider>
                  </Box>
                </Box>
              </ButtonOverflow>
              <ButtonOverflow>
                <Box
                  borderColor="transparent"
                  borderWidth="1.5px"
                  borderRadius="10px"
                  onClick={hide}
                  style={{
                    height: 36,
                    padding: 1.5,
                    width: 36,
                  }}
                  tabIndex={1}
                >
                  <Box
                    alignItems="center"
                    background="fillTertiary"
                    borderColor="separatorTertiary"
                    borderRadius="7px"
                    borderWidth="1.5px"
                    boxShadow="12px"
                    display="flex"
                    justifyContent="center"
                    paddingTop="1px"
                    style={{
                      height: 30,
                      width: 30,
                    }}
                  >
                    <Symbol
                      color="labelSecondary"
                      size={10.75}
                      symbol="xmark"
                      weight="heavy"
                    />
                  </Box>
                </Box>
              </ButtonOverflow>
            </Inline>
          </Column>
        </Columns>
      </Box>
    </NudgeBanner>
  );
};
