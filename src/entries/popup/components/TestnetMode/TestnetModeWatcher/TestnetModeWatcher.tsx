import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isTestnetChainId } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Box,
  Button,
  Separator,
  Stack,
  Text,
  TextOverflow,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { TextLink } from '~/design-system/components/TextLink/TextLink';
import { useActiveTab } from '~/entries/popup/hooks/useActiveTab';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { ChainBadge } from '../../ChainBadge/ChainBadge';
import { Navbar } from '../../Navbar/Navbar';

export const TestnetModeWatcher = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });
  const dappHost = dappMetadata?.appHost || '';

  const { testnetMode, setTestnetMode } = useTestnetModeStore();
  const { activeSession, disconnectSession } = useAppSession({
    host: dappHost,
  });

  const [hint, setHint] = useState<{
    show: boolean;
    type?: 'tesnetModeInMainnet' | 'notTestnetModeInTestnet';
    chainId: ChainId;
  }>({ show: false, chainId: ChainId.mainnet });

  const closeSheet = () => {
    setHint({ show: false, chainId: ChainId.mainnet });
    disconnectSession({
      address: currentAddress,
      host: dappHost,
    });
  };

  const action = () => {
    setHint({ show: false, chainId: ChainId.mainnet });
    setTestnetMode(!testnetMode);
  };

  useEffect(() => {
    if (activeSession && !hint.show) {
      const isCurrentAddressConnected = isLowerCaseMatch(
        activeSession.address,
        currentAddress,
      );
      if (isCurrentAddressConnected) {
        const activeSessionChainId = activeSession?.chainId;
        const activeChainIsTestnet = isTestnetChainId({
          chainId: activeSessionChainId,
        });
        if (testnetMode && !activeChainIsTestnet) {
          setHint({
            show: true,
            type: 'tesnetModeInMainnet',
            chainId: activeSessionChainId,
          });
        } else if (!testnetMode && activeChainIsTestnet) {
          setHint({
            show: true,
            type: 'notTestnetModeInTestnet',
            chainId: activeSessionChainId,
          });
        }
      }
    }
  }, [activeSession, currentAddress, hint.show, testnetMode]);

  return (
    <BottomSheet show={hint.show} zIndex={zIndexes.BOTTOM_SHEET}>
      <Box>
        <Navbar
          leftComponent={
            <Navbar.CloseButton variant="transparent" onClick={closeSheet} />
          }
        />
        <Box marginTop="-16px" paddingHorizontal="20px">
          <Stack space="24px" alignHorizontal="center">
            <ChainBadge size="45" chainId={hint.chainId} />
            <Stack space="12px" alignHorizontal="center">
              <Text color="label" size="16pt" weight="bold">
                {i18n.t('testnet_mode_watcher.connect_to', {
                  chainName: ChainNameDisplay[hint.chainId],
                })}
              </Text>
              <Text
                align="center"
                color="labelTertiary"
                size="10pt"
                weight="bold"
              >
                🕹️{' '}
                <TextLink scale={false} color="green">
                  {i18n.t('testnet_mode_watcher.testnet_mode')}
                </TextLink>{' '}
                {i18n.t(
                  `testnet_mode_watcher.${
                    hint.type === 'tesnetModeInMainnet'
                      ? 'testnet_mode_active'
                      : 'testnet_mode_not_active'
                  }`,
                  {
                    chainName: ChainNameDisplay[hint.chainId],
                  },
                )}
              </Text>
            </Stack>
            <Box style={{ width: '106px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
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
                  onClick={action}
                  variant={'flat'}
                  disabled={false}
                  tabIndex={0}
                  enterCta
                >
                  {i18n.t(
                    `testnet_mode_watcher.${
                      hint.type === 'tesnetModeInMainnet'
                        ? 'disable_and_connect'
                        : 'enable_and_connect'
                    }`,
                  )}
                </Button>
                <Button
                  testId="nudge-sheet-connect-different-wallet"
                  color="fillSecondary"
                  height="44px"
                  width="full"
                  onClick={closeSheet}
                  variant="plain"
                  disabled={false}
                  tabIndex={0}
                >
                  <TextOverflow weight="bold" size="16pt" color="label">
                    {i18n.t(`testnet_mode_watcher.cancel`)}
                  </TextOverflow>
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </BottomSheet>
  );
};
