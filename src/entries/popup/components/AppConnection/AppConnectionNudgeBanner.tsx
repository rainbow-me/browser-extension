import React from 'react';

import { i18n } from '~/core/languages';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
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
import { useDebounce } from '../../hooks/useDebounce';
import { useWalletName } from '../../hooks/useWalletName';
import { zIndexes } from '../../utils/zIndexes';
import ExternalImage from '../ExternalImage/ExternalImage';

export const AppConnectionNudgeBanner = ({
  show,
  connect,
}: {
  show: boolean;
  connect: () => void;
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const { displayName } = useWalletName({ address: currentAddress || '0x' });
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });

  const name = useDebounce(displayName, 500);

  return (
    <NudgeBanner show={show} zIndex={zIndexes.BOTTOM_SHEET}>
      <Box testId="app-connection-nudge-banner" padding="10px">
        <Columns>
          <Column>
            <Columns space="10px" alignVertical="center">
              <Column width="content">
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
                  position="relative"
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
                      <ExternalImage
                        src={dappMetadata?.appLogo}
                        width="30"
                        height="30"
                      />
                    </Box>
                  </Inline>
                </Box>
              </Column>
              <Column>
                <Box>
                  <Stack space="8px">
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
                      {i18n.t('app_connection_switcher.banner.connect_to', {
                        appName: dappMetadata?.appName || dappMetadata?.appHost,
                      })}
                    </TextOverflow>
                  </Stack>
                </Box>
              </Column>
            </Columns>
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
                    testId="nudge-banner-connect"
                    symbol="return.left"
                    symbolSide="left"
                    width="fit"
                    color={'red'}
                    height="30px"
                    onClick={connect}
                    variant={'square'}
                    tabIndex={0}
                    borderRadius="8px"
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
  );
};
