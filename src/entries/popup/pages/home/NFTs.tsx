import { motion } from 'framer-motion';
import React, { useCallback } from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';
import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

import { useCoolMode } from '../../hooks/useCoolMode';

export function NFTs() {
  const ref = useCoolMode({ emojis: ['🌈', '🖼️'] });
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });
  const { testnetMode } = useTestnetModeStore();

  const openProfile = useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginTop="-20px"
      paddingTop="80px"
      ref={ref}
      style={{ height: 336 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0) }}
      width="full"
    >
      <Box paddingBottom="14px">
        <Stack alignHorizontal="center" space="16px">
          <Box>
            <Box
              animate={{
                scale: [0.8, 1, 0.8, 1, 0.8],
                rotate: [0, 90, 180, 270, 360],
                y: [4, -4, 4, -4, 4],
              }}
              as={motion.div}
              initial={{ scale: 0.75, rotate: 0, y: 4 }}
              key="sparkleAnimation"
              transition={{
                delay: 0.5,
                duration: 8,
                ease: [0.2, 0, 0, 1],
                repeat: Infinity,
              }}
            >
              <Symbol
                color="yellow"
                disableSmoothing
                size={28}
                symbol="sparkle"
                weight="heavy"
              />
            </Box>
          </Box>
          <Text
            align="center"
            size="20pt"
            weight="semibold"
            color="labelTertiary"
          >
            {i18n.t('nfts.coming_soon_header')}
          </Text>
        </Stack>
      </Box>
      <Inset bottom="10px" horizontal="40px">
        <Text
          align="center"
          color="labelQuaternary"
          size="12pt"
          weight="medium"
        >
          {i18n.t('nfts.coming_soon_description')}
        </Text>
      </Inset>
      <Lens
        borderRadius="8px"
        cursor="pointer"
        onClick={openProfile}
        padding="6px"
        width="fit"
      >
        <Inline alignHorizontal="center" alignVertical="center" space="3px">
          <Text
            align="center"
            color="accent"
            cursor="pointer"
            size="12pt"
            weight="heavy"
          >
            {i18n.t('nfts.view_on_web')}
          </Text>
          <Symbol
            color="accent"
            cursor="pointer"
            size={9.5}
            symbol="chevron.right"
            weight="heavy"
          />
        </Inline>
      </Lens>
    </Box>
  );
}
