import React, { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Stack,
  Symbol,
  TextOverflow,
} from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { NudgeBanner } from '~/design-system/components/NudgeBanner/NudgeBanner';

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
        !isLowerCaseMatch(appSession?.activeSession?.address, currentAddress)
      ) {
        setshow(true);
      }
    }, 1000);
  }, [appSession, appSession?.activeSession?.address, currentAddress]);

  return (
    <>
      <NudgeBanner show={show} zIndex={zIndexes.BOTTOM_SHEET}>
        <Box padding="10px">
          <Columns>
            <Column>
              <Inline space="10px" alignVertical="center">
                <Box
                  style={{
                    height: '36px',
                    width: '36px',
                    overflow: 'hidden',
                  }}
                  borderRadius="10px"
                  background="fill"
                  borderWidth="1px"
                  borderColor="buttonStroke"
                >
                  <Inline
                    alignHorizontal="center"
                    alignVertical="center"
                    height="full"
                  >
                    <Box
                      style={{
                        height: '30px',
                        width: '30px',
                        overflow: 'hidden',
                      }}
                      borderRadius="8px"
                    >
                      <ExternalImage src={appLogo} width="30" height="30" />
                    </Box>
                  </Inline>
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
                    {i18n.t('app_connection_switcher.banner.connect_to', {
                      appName: appName || appHost,
                    })}
                  </TextOverflow>
                </Stack>
              </Inline>
            </Column>
            <Column width="content">
              <ButtonOverflow>
                <Box
                  padding="3px"
                  borderWidth="1px"
                  borderRadius="10px"
                  style={{
                    borderColor: 'rgba(206, 34, 51, 0.50)',
                  }}
                >
                  <Box
                    style={{ backgroundColor: 'rgba(206, 34, 51, 0.30)' }}
                    borderRadius="10px"
                  >
                    <Button
                      symbol="return.left"
                      symbolSide="left"
                      width="fit"
                      color={'red'}
                      height="30px"
                      onClick={undefined}
                      variant={'square'}
                      tabIndex={0}
                      borderRadius="8px"
                      disabled
                    >
                      {i18n.t('app_connection_switcher.banner.connect')}
                    </Button>
                  </Box>
                </Box>
              </ButtonOverflow>
            </Column>
          </Columns>
        </Box>
      </NudgeBanner>
    </>
  );
};
