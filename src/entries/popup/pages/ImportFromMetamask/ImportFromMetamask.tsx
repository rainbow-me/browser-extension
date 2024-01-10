import { Box, Separator, Stack, Symbol, Text } from '~/design-system';

export function ImportFromMetamask() {
  return (
    <Stack space="24px" alignItems="center" paddingHorizontal="20px">
      <Stack space="12px" alignItems="center">
        <Text size="16pt" weight="bold">
          Import from MetaMask
        </Text>
        <Text color="labelTertiary" size="12pt" weight="medium">
          Transfer your wallet names, address book, connected dApps, and App
          preferences.
        </Text>
      </Stack>

      <Separator color="separatorTertiary" width={106} />

      <Stack space="24px" alignItems="center">
        <Symbol symbol="doc.badge.plus" color="pink" size={35} weight="bold" />

        <Box
          gap="8px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          borderRadius="12px"
          borderColor="buttonStroke"
          borderWidth="2px"
          style={{ borderStyle: 'dashed' }}
        >
          <Text color="labelSecondary" size="12pt" weight="medium">
            Drag-n-drop or
            <Text color="blue" size="12pt" weight="medium">
              browse
            </Text>
            to import
          </Text>

          <Box
            borderRadius="5px"
            padding="4px"
            background="surfaceSecondaryElevated"
            borderColor="buttonStroke"
          >
            <Text color="labelSecondary" size="12pt" weight="medium">
              MetaMask state logs.json
            </Text>
          </Box>
        </Box>
      </Stack>

      <Separator color="separatorTertiary" width={106} />

      <Stack space="12px" alignItems="center">
        <Box
          borderRadius="5px"
          padding="4px"
          background="surfaceSecondaryElevated"
          borderColor="buttonStroke"
        ></Box>
      </Stack>
    </Stack>
  );
}
