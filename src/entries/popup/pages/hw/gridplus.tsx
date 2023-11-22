import React, { useEffect } from 'react';

import gridplusDevice from 'static/assets/hw/grid-plus-device.png';
import { i18n } from '~/core/languages';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Separator, Text } from '~/design-system';
import { TextLink } from '~/design-system/components/TextLink/TextLink';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
// import { ROUTES } from '../../urls';

export function ConnectGridPlus() {
  const navigate = useRainbowNavigate();
  useEffect(() => {
    setTimeout(async () => {
      await wallet.connectGridPlus();
      //   if (!res) alert('error connecting to GridPlus');
      //   if (res?.accountsToImport?.length) {
      //     navigate(ROUTES.HW_WALLET_LIST, {
      //       state: {
      //         ...res,
      //         vendor: 'GridPlus',
      //       },
      //     });
      //   }
    }, 1500);
  }, [navigate]);

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('hw.connect_gridplus_title')}
        </Text>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('hw.connect_gridplus_description')}{' '}
            <TextLink
              color="blue"
              onClick={() => goToNewTab({ url: 'https://learn.rainbow.me/' })}
            >
              {i18n.t('hw.learn_more')}
            </TextLink>
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box
        paddingTop="28px"
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        <img src={gridplusDevice} width="160" />
      </Box>
    </FullScreenContainer>
  );
}
