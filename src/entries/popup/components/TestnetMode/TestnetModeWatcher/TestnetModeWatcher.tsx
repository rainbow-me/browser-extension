import { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { getChain } from '~/core/utils/chains';
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
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { ChainBadge } from '../../ChainBadge/ChainBadge';
import { Navbar } from '../../Navbar/Navbar';

type Hint = {
  show: boolean;
  chainId: ChainId;
};

const INITIAL_HINT: Hint = {
  show: false,
  chainId: ChainId.mainnet,
};

export const TestnetModeWatcher = ({
  pendingRequest,
  rejectRequest,
}: {
  pendingRequest?: ProviderRequestPayload;
  rejectRequest?: () => void;
}) => {
  const chainsLabel = useNetworkStore((state) => state.getChainsLabel());
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

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (!hint.show) return;
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        closeSheet();
      }
    },
  });

  useEffect(() => {
    if (activeSession && !hint.show) {
      const activeSessionChainId = activeSession?.chainId;
      const activeChainIsTestnet = getChain({
        chainId: activeSessionChainId,
      }).testnet;
      if (testnetMode && !activeChainIsTestnet) {
        setHint({
          show: true,
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
                  chainName: chainsLabel[hint.chainId],
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
                {i18n.t(`testnet_mode_watcher.testnet_mode_active`, {
                  chainName: chainsLabel[hint.chainId],
                })}
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
                  testId="testnet-mode-enable"
                  symbol="return.left"
                  symbolSide="left"
                  width="full"
                  color={'accent'}
                  height="44px"
                  onClick={action}
                  variant={'flat'}
                  disabled={false}
                  tabIndex={0}
                  autoFocus={true}
                  enterCta
                >
                  {i18n.t(`testnet_mode_watcher.disable_and_connect`)}
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
