import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Inline, Separator, Stack, Text } from '~/design-system';
import { TextInline } from '~/design-system/docs/components/TextInline';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

export const RequestAccountsInfo = ({
  appHostName,
  appName,
  appLogo,
}: {
  appHostName?: string;
  appName?: string;
  appLogo?: string;
}) => {
  return (
    <Box
      style={{
        paddingLeft: 50,
        paddingRight: 50,
        paddingTop: 64,
        paddingBottom: 42,
      }}
      background="surfacePrimaryElevatedSecondary"
    >
      <Stack space="32px">
        <DappIcon appLogo={appLogo} size="60px" />
        <Stack space="32px">
          <Text
            size="20pt"
            weight="semibold"
            color="labelSecondary"
            align="center"
          >
            <TextInline color="label">{appName}</TextInline>{' '}
            {i18n.t('approve_request.wallet_info_title')}
          </Text>

          <Text align="center" color="accent" size="20pt" weight="bold">
            {appHostName}
          </Text>
        </Stack>
        <Inline alignHorizontal="center">
          <Box style={{ width: '186px' }}>
            <Separator color="separatorTertiary" />
          </Box>
        </Inline>

        <Text align="center" color="labelTertiary" size="14pt" weight="regular">
          {i18n.t('approve_request.wallet_info_description', {
            appName,
          })}
        </Text>
      </Stack>
    </Box>
  );
};
