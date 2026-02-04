import { useEffect } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Button, Text } from '~/design-system';

import { RNBWCoinIcon } from './RNBWCoinIcon';

const DOWNLOAD_URL =
  'https://rainbow.me/download?utm_source=bx&utm_campaign=rnbw_airdrop_button';

export function RNBWRewards() {
  useEffect(() => {
    analytics.track(event.rnbwRewardsTabViewed);
  }, []);

  const handleDownload = () => {
    goToNewTab({ url: DOWNLOAD_URL });
    analytics.track(event.rnbwRewardsGetButtonClicked);
  };

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      paddingTop="24px"
      width="full"
      height="full"
      style={{ isolation: 'isolate', clipPath: 'inset(0 0 -100px 0)' }}
    >
      {/* Coin illustration with glow */}
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        position="relative"
        paddingBottom="20px"
      >
        {/* Yellow glow behind coin */}
        <Box
          position="absolute"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#F6D56B',
            filter: 'blur(40px)',
            opacity: 0.25,
          }}
        />
        <Box
          style={{
            filter: 'drop-shadow(0px 6px 24px rgba(0, 0, 0, 0.25))',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <RNBWCoinIcon size={56} />
        </Box>
      </Box>

      {/* Subtitle */}
      <Box paddingBottom="12px" style={{ opacity: 0.6 }}>
        <Text align="center" size="12pt" weight="heavy" color="labelSecondary">
          {i18n.t('airdrop.banner.subtitle')}
        </Text>
      </Box>

      {/* Title */}
      <Box paddingBottom="16px">
        <Text align="center" size="20pt" weight="heavy" color="label">
          {i18n.t('airdrop.banner.title')}
        </Text>
      </Box>

      {/* Description */}
      <Box
        style={{ maxWidth: 280 }}
        paddingHorizontal="20px"
        paddingBottom="20px"
      >
        <Text
          align="center"
          size="12pt"
          weight="medium"
          color="labelQuaternary"
        >
          {i18n.t('airdrop.banner.description')}
        </Text>
      </Box>

      {/* CTA Button */}
      <Box paddingBottom="16px">
        <Button
          color="accent"
          height="32px"
          variant="raised"
          onClick={handleDownload}
          paddingHorizontal="24px"
        >
          <Text size="14pt" weight="heavy" color="label">
            {i18n.t('airdrop.banner.cta')}
          </Text>
        </Button>
      </Box>

      {/* Availability text */}
      <Box style={{ opacity: 0.6 }}>
        <Text align="center" size="12pt" weight="medium" color="labelTertiary">
          {i18n.t('airdrop.banner.availability')}
        </Text>
      </Box>
    </Box>
  );
}
