import {
  Box,
  Button,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';

export function ImportFromMetamask() {
  return (
    <Box
      paddingHorizontal="20px"
      paddingBottom="20px"
      justifyContent="space-between"
      alignItems="center"
      display="flex"
      flexDirection="column"
      flexGrow="1"
    >
      <Stack space="24px" alignItems="center" paddingHorizontal="14px">
        <Stack space="12px" alignItems="center">
          <Text size="16pt" weight="bold">
            Import from MetaMask
          </Text>
          <Text
            color="labelTertiary"
            size="12pt"
            weight="medium"
            align="center"
          >
            Transfer your wallet names, address book, connected dApps, and App
            preferences.
          </Text>
        </Stack>

        <Separator color="separatorTertiary" width={106} />

        <Box
          gap="24px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="12px"
          borderColor="buttonStroke"
          borderWidth="2px"
          style={{ borderStyle: 'dashed', height: 210 }}
          width="full"
        >
          <Symbol
            symbol="doc.badge.plus"
            color="pink"
            size={35}
            weight="bold"
          />

          <Stack space="8px" alignItems="center">
            <Inline space="4px" wrap={false}>
              <Text color="labelSecondary" size="12pt" weight="medium">
                Drag-n-drop or
              </Text>
              <Text color="blue" size="12pt" weight="medium" as="span">
                browse
              </Text>
              <Text color="labelSecondary" size="12pt" weight="medium">
                to import
              </Text>
            </Inline>

            <Box
              borderRadius="5px"
              padding="4px"
              background="surfaceSecondaryElevated"
              borderColor="buttonStroke"
              borderWidth="1px"
            >
              <Text color="labelSecondary" size="12pt" weight="medium">
                MetaMask state logs.json
              </Text>
            </Box>
          </Stack>
        </Box>

        <Separator color="separatorTertiary" width={106} />

        <Stack space="12px" alignItems="center">
          <Box
            borderRadius="8px"
            padding="8px"
            background="surfaceSecondaryElevated"
            borderColor="buttonStroke"
            borderWidth="1px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="full"
          >
            <Text color="orange" size="12pt" weight="medium">
              Settings
            </Text>
            <Symbol
              symbol="arrow.right"
              color="labelQuaternary"
              size={8}
              weight="medium"
            />
            <Text color="orange" size="12pt" weight="medium">
              Advanced
            </Text>
            <Symbol
              symbol="arrow.right"
              color="labelQuaternary"
              size={8}
              weight="medium"
            />
            <Text color="orange" size="12pt" weight="medium">
              Download State Logs
            </Text>
          </Box>
          <Text
            color="labelSecondary"
            size="12pt"
            weight="medium"
            align="center"
          >
            Download your State logs from MetaMask here and import them here to
            Rainbow.
          </Text>
        </Stack>
      </Stack>

      <Button height="44px" variant="flat" color="fill" width="full">
        Do this later
      </Button>
    </Box>
  );
}
