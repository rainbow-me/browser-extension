import React, { useEffect, useState } from 'react';

import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isL2Chain } from '~/core/utils/chains';
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
  console.log('-- url,url', url);
  const { data: dappMetadata } = useDappMetadata({ url });

  const { testnetMode } = useTestnetModeStore();
  const { activeSession } = useAppSession({
    host: dappMetadata?.appHost || '',
  });

  const [closedByUser, setClosedByUser] = useState(false);

  console.log('-- activeSession', activeSession);
  const [hint, setHint] = useState<{
    show: boolean;
    type?: 'tesnetModeInMainnet' | 'notTestnetModeInTestnet';
    chainId: ChainId;
  }>({ show: false, chainId: ChainId.mainnet });

  const closeSheet = () => {
    setHint({ show: false, chainId: ChainId.mainnet });
    setClosedByUser(true);
  };

  useEffect(() => {
    console.log('=--- activeSession', activeSession);
  }, [activeSession]);
  console.log('--- ppppppppp');
  useEffect(() => {
    console.log('--- ppppppppp');
    if (activeSession && !hint.show && !closedByUser) {
      const isCurrentAddressConnected = isLowerCaseMatch(
        activeSession.address,
        currentAddress,
      );
      if (isCurrentAddressConnected) {
        const activeSessionChainId = activeSession?.chainId;
        console.log('settinghint');
        if (testnetMode && !isL2Chain(activeSessionChainId)) {
          setHint({
            show: true,
            type: 'tesnetModeInMainnet',
            chainId: activeSessionChainId,
          });
        } else if (!testnetMode && isL2Chain(activeSessionChainId)) {
          setHint({
            show: true,
            type: 'notTestnetModeInTestnet',
            chainId: activeSessionChainId,
          });
        }
      }
    }
  }, [activeSession, closedByUser, currentAddress, hint.show, testnetMode]);

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
                {`Connect to ${ChainNameDisplay[hint.chainId]}`}
              </Text>
              <Text
                align="center"
                color="labelTertiary"
                size="10pt"
                weight="bold"
              >
                🕹️{' '}
                <TextLink scale={false} color="green">
                  Testnet Mode
                </TextLink>{' '}
                {`is currently active. Would you like to disable it and connect to
                ${ChainNameDisplay[hint.chainId]}?`}
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
                  onClick={() => null}
                  variant={'flat'}
                  disabled={false}
                  tabIndex={0}
                  enterCta
                >
                  {'Disable and connect'}
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
                    {'Cancel'}
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
