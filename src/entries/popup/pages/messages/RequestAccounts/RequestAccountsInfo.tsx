import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { Bleed, Box, Inline, Separator, Stack, Text } from '~/design-system';
import { TextInline } from '~/design-system/docs/components/TextInline';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

import { DappHostName, ThisDappIsLikelyMalicious } from '../DappScanStatus';

export const RequestAccountsInfo = ({
  appHostName,
  appName,
  appLogo,
  dappStatus,
}: {
  appHostName?: string;
  appName?: string;
  appLogo?: string;
  dappStatus?: DAppStatus;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;

  return (
    <Box
      style={{
        height: 398,
        paddingBottom: isScamDapp ? 20 : 42,
      }}
      paddingHorizontal="50px"
      paddingTop="64px"
      background="surfacePrimaryElevatedSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="26px"
    >
      <Box width="full">
        <Inline alignHorizontal="center" alignVertical="center">
          <DappIcon appLogo={appLogo} size="60px" />
        </Inline>
      </Box>
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

        <DappHostName hostName={appHostName} dappStatus={dappStatus} />
      </Stack>

      <Box style={{ width: '186px' }} marginVertical="-4px">
        <Separator color="separatorTertiary" />
      </Box>

      {isScamDapp ? (
        <Bleed horizontal="30px">
          <ThisDappIsLikelyMalicious />
        </Bleed>
      ) : (
        <Text align="center" color="labelTertiary" size="14pt" weight="regular">
          {i18n.t('approve_request.wallet_info_description', {
            appName,
          })}
        </Text>
      )}
    </Box>
  );
};
