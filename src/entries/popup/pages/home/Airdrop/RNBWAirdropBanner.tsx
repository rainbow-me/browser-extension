import { i18n } from '~/core/languages';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Button, Inset, Stack, Text } from '~/design-system';

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
      paddingBottom="60px"
      paddingTop="20px"
      style={{
        minHeight: 500 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0),
        background: 'linear-gradient(180deg, #000 0%, #1a1a1a 100%)',
      }}
      width="full"
    >
      {/* Coin illustration */}
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        style={{ marginBottom: 24 }}
      >
        <RNBWCoinIcon size={100} />
      </Box>

      <Stack alignHorizontal="center" space="12px">
        {/* Subtitle */}
        <Text align="center" size="14pt" weight="semibold" color="yellow">
          {i18n.t('airdrop.banner.subtitle')}
        </Text>

        {/* Title */}
        <Text align="center" size="23pt" weight="heavy" color="label">
          {i18n.t('airdrop.banner.title')}
        </Text>

        {/* Description */}
        <Inset horizontal="20px">
          <Text
            align="center"
            size="14pt"
            weight="medium"
            color="labelSecondary"
          >
            {i18n.t('airdrop.banner.description')}
          </Text>
        </Inset>

        {/* CTA Button */}
        <Box paddingTop="16px">
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
      </Stack>
    </Box>
  );
}
