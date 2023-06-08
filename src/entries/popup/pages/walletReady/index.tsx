import { i18n } from '~/core/languages';
import { Box, Inline, Separator, Stack, Symbol, Text } from '~/design-system';

import { ReadyShortcut } from './ReadyShortcut';

const isBrave = 'brave' in navigator;

const PinToToolbar = () => (
  <Box
    position="fixed"
    top="0"
    borderRadius="16px"
    style={{
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      maxWidth: '152px',
      right: isBrave ? '144px' : '104px',
    }}
    paddingHorizontal="12px"
    paddingVertical="16px"
    display="flex"
    gap="12px"
    background="surfacePrimaryElevated"
    borderColor="buttonStrokeSecondary"
    boxShadow="18px surfacePrimaryElevated"
  >
    <Text size="14pt" weight="bold">
      {i18n.t('wallet_ready.pin_rainbow_to_your_toolbar')}
    </Text>
    <Symbol symbol="arrow.up" color="purple" size={18} weight="bold" />
  </Box>
);

export function WalletReady() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      paddingTop="60px"
      paddingBottom="20px"
      position="relative"
      style={{
        minHeight: '600px',
      }}
    >
      <Box>
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('wallet_ready.title')}
        </Text>
        <Box padding="16px" paddingTop="10px" style={{ width: '264px' }}>
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('wallet_ready.subtitle')}
          </Text>
        </Box>
      </Box>

      <Box style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>

      <ReadyShortcut />

      <Box paddingHorizontal="20px">
        <Stack space="8px">
          <Box
            borderWidth="1px"
            borderColor="separatorSecondary"
            borderRadius="12px"
            paddingHorizontal="16px"
            paddingVertical="16px"
            as="a"
            display="block"
            href="https://rainbow.me/extension/get-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Inline alignVertical="center" alignHorizontal="justify">
              <Inline alignVertical="center">
                <Box
                  background="fillHorizontal"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="round"
                  style={{ width: '18px', height: '18px' }}
                >
                  <Box style={{ fontSize: '8px' }}>🌈</Box>
                </Box>
                <Box paddingLeft="8px">
                  <Text
                    size="14pt"
                    weight="heavy"
                    color="labelSecondary"
                    cursor="pointer"
                  >
                    {i18n.t('wallet_ready.get_started_with_rainbow')}
                  </Text>
                </Box>
              </Inline>
              <Symbol
                weight="medium"
                size={12}
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
                cursor="pointer"
              />
            </Inline>
            <Box paddingTop="12px">
              <Text
                size="11pt"
                weight="regular"
                color="labelTertiary"
                cursor="pointer"
              >
                {i18n.t('wallet_ready.get_started_with_rainbow_desc')}
              </Text>
            </Box>
          </Box>
          <Box
            borderWidth="1px"
            borderColor="separatorSecondary"
            borderRadius="12px"
            paddingHorizontal="16px"
            paddingVertical="16px"
            as="a"
            display="block"
            href="https://rainbow.me/extension/shortcuts"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              cursor: 'pointer',
            }}
          >
            <Inline alignVertical="center" alignHorizontal="justify">
              <Inline alignVertical="center">
                <Box
                  background="fillHorizontal"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius="round"
                  style={{ width: '18px', height: '18px' }}
                >
                  <Box>
                    <Text size="9pt" weight="bold" color="label">
                      ⌘
                    </Text>
                  </Box>
                </Box>
                <Box paddingLeft="8px">
                  <Text
                    size="14pt"
                    weight="heavy"
                    color="labelSecondary"
                    cursor="pointer"
                  >
                    {i18n.t('wallet_ready.discover_shortcuts')}
                  </Text>
                </Box>
              </Inline>
              <Symbol
                weight="medium"
                size={12}
                symbol="arrow.up.forward.circle"
                color="labelTertiary"
                cursor="pointer"
              />
            </Inline>
            <Box paddingTop="12px">
              <Text
                size="11pt"
                weight="regular"
                color="labelTertiary"
                cursor="pointer"
              >
                {i18n.t('wallet_ready.discover_shortcuts_desc')}
              </Text>
            </Box>
          </Box>
        </Stack>
      </Box>
      <PinToToolbar />
    </Box>
  );
}
