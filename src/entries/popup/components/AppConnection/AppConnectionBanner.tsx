import React, { useEffect, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { Box, Inline, Stack, Symbol, TextOverflow } from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useWalletName } from '../../hooks/useWalletName';
import { zIndexes } from '../../utils/zIndexes';
import ExternalImage from '../ExternalImage/ExternalImage';

export const AppConnectionBanner = () => {
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
        <Box padding="10px">
          <Inline space="10px" alignVertical="center">
            <Box
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <ExternalImage src={appLogo} width="36" height="36" />
            </Box>
            <Stack space="8px">
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
          </Inline>
        </Box>
      </BottomSheet>
    </>
  );
};
