import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

export function ThisDappIsLikelyMalicious() {
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
}

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

  return { badge: null, color: 'labelSecondary' } as const;
};

export function DappHostName({
  hostName,
  dappStatus,
}: {
  hostName?: string;
  dappStatus?: DAppStatus;
}) {
  const { badge, color } = getStatusBadge(dappStatus);
  return (
    <Inline space="5px" alignVertical="center" alignHorizontal="center">
      {badge}
      <Text align="center" color={color} size="16pt" weight="bold">
        {hostName}
      </Text>
    </Inline>
  );
}
