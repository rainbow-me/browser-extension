import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import {
  Bleed,
  Box,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { TextInline } from '~/design-system/docs/components/TextInline';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';

const ThisAppIsLikelyMalicious = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="20px"
      paddingVertical="16px"
      gap="12px"
      borderColor="separatorTertiary"
      borderRadius="20px"
      borderWidth="2px"
    >
      <Symbol
        symbol="exclamationmark.octagon.fill"
        size={20}
        weight="heavy"
        color="red"
      />
      <Stack space="8px">
        <Text size="14pt" weight="bold">
          {i18n.t('approve_request.malicious_warning.title')}
        </Text>
        <Text color="labelTertiary" size="12pt" weight="semibold">
          {i18n.t('approve_request.malicious_warning.message')}
        </Text>
      </Stack>
    </Box>
  );
};

const VerifiedBadge = () => (
  <Symbol size={17} symbol="checkmark.seal.fill" weight="bold" color="blue" />
);
const ScamBadge = () => (
  <Symbol
    size={17}
    symbol="network.badge.shield.half.filled"
    weight="bold"
    color="red"
  />
);

const getStatusBadge = (status: DAppStatus | undefined) => {
  if (status === DAppStatus.Scam)
    return { badge: <ScamBadge />, color: 'red' } as const;
  if (status === DAppStatus.Verified)
    return { badge: <VerifiedBadge />, color: 'blue' } as const;

  return { badge: null, color: 'accent' } as const;
};

export const RequestAccountsInfo = ({
  appHostName,
  appName,
  appLogo,
  status,
}: {
  appHostName?: string;
  appName?: string;
  appLogo?: string;
  status?: DAppStatus;
}) => {
  const isScamDapp = status === DAppStatus.Scam;
  const { badge, color } = getStatusBadge(status);

  return (
    <Box
      style={{
        height: 398,
        paddingBottom: isScamDapp ? 20 : 42,
      }}
      paddingHorizontal="50px"
      paddingTop="64px"
      background="surfacePrimaryElevatedSecondary"
    >
      <Stack space="32px" alignItems="center">
        <Inline alignHorizontal="center">
          <Box
            style={{
              width: 60,
              height: 60,
              overflow: 'hidden',
            }}
            borderRadius="18px"
            alignItems="center"
          >
            {appLogo ? (
              <ExternalImage src={appLogo} width="60" height="60" />
            ) : null}
          </Box>
        </Inline>

        <Stack space="24px">
          <Text
            size="20pt"
            weight="semibold"
            color="labelSecondary"
            align="center"
          >
            <TextInline color="label">{appName}</TextInline>{' '}
            {i18n.t('approve_request.wallet_info_title')}
          </Text>

          <Inline space="6px" alignVertical="center" alignHorizontal="center">
            {badge}
            <Text align="center" color={color} size="20pt" weight="bold">
              {appHostName}
            </Text>
          </Inline>
        </Stack>

        <Box style={{ width: '186px' }} marginVertical="-4px">
          <Separator color="separatorTertiary" />
        </Box>

        {isScamDapp ? (
          <Bleed horizontal="30px">
            <ThisAppIsLikelyMalicious />
          </Bleed>
        ) : (
          <Text
            align="center"
            color="labelTertiary"
            size="14pt"
            weight="regular"
          >
            {i18n.t('approve_request.wallet_info_description', {
              appName,
            })}
          </Text>
        )}
      </Stack>
    </Box>
  );
};
