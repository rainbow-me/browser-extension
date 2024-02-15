import { i18n } from '~/core/languages';
import { Box, Inline, Separator, Symbol, Text } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';

export function TokenApprovals() {
  const approvals = [
    {
      icon: null,
      name: null,
      contract: '0x000…10E2',
      amount: Number.MAX_VALUE,
      moreInfoLink: 'https://etherscan.com',
    },
  ];
  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="16px"
      gap="12px"
      background="surfaceSecondaryElevated"
      borderColor="separatorTertiary"
      borderRadius="16px"
      borderWidth="1px"
    >
      <Text color="label" size="14pt" weight="bold">
        {i18n.t('token_details.approvals')}
      </Text>
      <Separator color="separatorTertiary" />
      <Box display="flex" flexDirection="column" gap="20px">
        {approvals?.map(({ icon, name, amount, contract }) => (
          <DropdownMenu key={contract}>
            <DropdownMenuTrigger asChild>
              <Box display="flex" justifyContent="space-between" key={contract}>
                <Inline alignVertical="center" space="4px">
                  {icon || (
                    <Symbol
                      size={15}
                      symbol="doc.plaintext"
                      weight="medium"
                      color="labelTertiary"
                    />
                  )}
                  <Text color="labelTertiary" size="14pt" weight="semibold">
                    {name || contract}
                  </Text>
                </Inline>
                <Inline alignVertical="center" space="4px">
                  <Text color="labelSecondary" size="12pt" weight="semibold">
                    {amount === Number.MAX_VALUE
                      ? i18n.t('approvals.unlimited')
                      : amount}
                  </Text>
                  <Symbol
                    size={12}
                    symbol="arrow.up.forward.circle"
                    weight="medium"
                    color="labelQuaternary"
                  />
                </Inline>
              </Box>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => null}>
                <Box padding="4px">
                  <Text size="14pt" weight="semibold">
                    Open in explorer
                  </Text>
                </Box>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => null}>
                <Box padding="4px">
                  <Text size="14pt" weight="semibold">
                    Revoke approval
                  </Text>
                </Box>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </Box>
    </Box>
  );
}
