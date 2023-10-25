import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isTestnetChainId } from '~/core/utils/chains';
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
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { ChainBadge } from '../../ChainBadge/ChainBadge';
import { Navbar } from '../../Navbar/Navbar';

type Hint = {
  show: boolean;
  type: 'tesnetModeInMainnet' | 'notTestnetModeInTestnet';
  chainId: ChainId;
};

const INITIAL_HINT: Hint = {
  show: false,
  type: 'tesnetModeInMainnet',
  chainId: ChainId.mainnet,
};

export const TestnetModeWatcher = ({
  pendingRequest,
  rejectRequest,
}: {
  pendingRequest?: ProviderRequestPayload;
  rejectRequest?: () => void;
}) => {
  const { data: dappMetadata } = useDappMetadata({
    url: pendingRequest?.meta?.sender.url,
  });
  const dappHost = dappMetadata?.appHost || '';

  const { testnetMode, setTestnetMode } = useTestnetModeStore();
  const { activeSession } = useAppSession({
    host: dappHost,
  });

  const [hint, setHint] = useState<Hint>(INITIAL_HINT);

  const closeSheet = () => {
    setHint(INITIAL_HINT);
    rejectRequest?.();
  };

  const action = () => {
    setHint(INITIAL_HINT);
    setTestnetMode(!testnetMode);
  };

  useEffect(() => {
    if (activeSession && !hint.show) {
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
  }, [activeSession, hint.show, testnetMode]);

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
