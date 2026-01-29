import { i18n } from '~/core/languages';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Button, Stack, Text } from '~/design-system';

import { RNBWCoinIcon } from './RNBWCoinIcon';

const DOWNLOAD_URL =
  'https://rainbow.me/download#:~:text=Download%20for%20mobile';

export function RNBWAirdropBanner() {
  const { testnetMode } = useTestnetModeStore();
  const handleDownload = () => goToNewTab({ url: DOWNLOAD_URL });

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      paddingBottom="32px"
      style={{
        minHeight: 500 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0),
        background: '#191A1C',
      }}
      width="full"
    >
      {/* Coin illustration with glow */}
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        position="relative"
        style={{ marginBottom: 24 }}
      >
        {/* Yellow glow behind coin */}
        <Box
          position="absolute"
          style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: '#F6D56B',
            filter: 'blur(52px)',
            opacity: 0.2,
          }}
        />
        <Box
          style={{
            filter: 'drop-shadow(0px 8px 24px rgba(0, 0, 0, 0.4))',
          }}
        >
          <RNBWCoinIcon size={64} />
        </Box>
      </Box>

      <Stack alignHorizontal="center" space="12px">
        {/* Subtitle */}
        <Box style={{ letterSpacing: '4px' }}>
          <Text align="center" size="12pt" weight="bold" color="yellow">
            {i18n.t('airdrop.banner.subtitle')}
          </Text>
        </Box>

        {/* Title */}
        <Text align="center" size="26pt" weight="heavy" color="label">
          {i18n.t('airdrop.banner.title')}
        </Text>

        {/* Description */}
        <Box paddingHorizontal="32px">
          <Text
            align="center"
            size="14pt"
            weight="medium"
            color="labelSecondary"
          >
            {i18n.t('airdrop.banner.description')}
          </Text>
        </Box>

        {/* CTA Button */}
        <Box paddingTop="20px" paddingHorizontal="32px">
          <Button
            color="accent"
            height="44px"
            variant="raised"
            width="full"
            onClick={handleDownload}
          >
            {i18n.t('airdrop.banner.cta')}
          </Button>
        </Box>

        {/* Availability text */}
        <Box paddingTop="8px">
          <Text
            align="center"
            size="12pt"
            weight="medium"
            color="labelQuaternary"
          >
            {i18n.t('airdrop.banner.availability')}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
