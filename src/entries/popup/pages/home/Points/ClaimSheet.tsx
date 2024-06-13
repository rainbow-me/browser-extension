import { motion } from 'framer-motion';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import {
  Box,
  Button,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { rowTransparentAccentHighlight } from '~/design-system/styles/rowTransparentAccentHighlight.css';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserAssetsBalance } from '~/entries/popup/hooks/useUserAssetsBalance';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { usePoints } from './usePoints';

export function ClaimSheet() {
  const navigate = useRainbowNavigate();
  const { currentAddress: address } = useCurrentAddressStore();
  const { data, isSuccess } = usePoints(address);
  const rewards = data?.user?.rewards;
  const { amount: opBalance } = useUserAssetsBalance({
    chain: ChainId.optimism,
    currency: 'ETH',
  });
  const opDisplay = `${parseFloat(Number(opBalance).toFixed(8))} ETH`;
  const { amount: baseBalance } = useUserAssetsBalance({
    chain: ChainId.base,
    currency: 'ETH',
  });
  const baseDisplay = `${parseFloat(Number(baseBalance).toFixed(8))} ETH`;
  const { amount: zoraBalance } = useUserAssetsBalance({
    chain: ChainId.zora,
    currency: 'ETH',
  });
  const zoraDisplay = `${parseFloat(Number(zoraBalance).toFixed(8))} ETH`;
  return (
    <BottomSheet
      show
      onClickOutside={() => navigate(-1)}
      zIndex={zIndexes.BOTTOM_SHEET}
    >
      <Box paddingTop="24px" paddingBottom="12px" isModal>
        <Box paddingBottom="16px">
          <Text
            weight="heavy"
            size="20pt"
            color="accent"
            textShadow="16px accent"
            align="center"
          >
            {i18n.t('points.rewards.choose_claim_network')}
          </Text>
        </Box>
        <Stack gap="10px">
          <Separator color="separatorTertiary" />
          <Rows>
            <Row>
              <ClaimSheetRow
                balance={rewards?.claimable || '0'}
                chain={ChainId.optimism}
                display={opDisplay}
              />
            </Row>
            <Row>
              <ClaimSheetRow
                balance={rewards?.claimable || '0'}
                chain={ChainId.base}
                display={baseDisplay}
              />
            </Row>
            <Row>
              <ClaimSheetRow
                balance={rewards?.claimable || '0'}
                chain={ChainId.zora}
                display={zoraDisplay}
              />
            </Row>
          </Rows>
        </Stack>
        <Box
          paddingHorizontal="20px"
          paddingTop="24px"
          paddingBottom="10px"
          background="surfacePrimaryElevated"
        >
          <Button
            color="fillTertiary"
            onClick={() => navigate(-1)}
            width="full"
            borderRadius="12px"
            height="44px"
            variant="transparentShadow"
            tabIndex={0}
            paddingHorizontal="20px"
            disabled={!isSuccess}
          >
            <Text
              size="16pt"
              weight="bold"
              textShadow="16px label"
              color="labelTertiary"
            >
              {i18n.t('close')}
            </Text>
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}

function ClaimSheetRow({
  balance,
  chain,
  display,
}: {
  balance: string;
  chain: ChainId;
  display: string;
}) {
  const navigate = useRainbowNavigate();
  return (
    <Inset horizontal="8px">
      <Box
        // style={{
        //   filter: chain !== ChainId.optimism ? 'grayscale(1)' : 'grayscale(0)',
        // }}
        paddingVertical="10px"
        className={rowTransparentAccentHighlight}
        borderRadius="12px"
        as={motion.div}
        whileTap={{ scale: 0.98 }}
        whileFocus={{ scale: 1.02 }}
        whileHover={{ scale: 1.02 }}
        paddingHorizontal="8px"
        onClick={() => {
          //   if (chain !== ChainId.optimism) return;
          navigate(ROUTES.CLAIM_OVERVIEW, {
            state: {
              tab: 'points',
              skipTransitionOnRoute: ROUTES.HOME,
              claimAmount: balance,
              claimNetwork: chain,
            },
          });
        }}
      >
        <Inset horizontal="8px">
          <Box display="flex" justifyContent="space-between">
            <Inline space="12px">
              <ChainBadge chainId={chain} size="32" />
              <Stack gap="10px">
                <Text
                  size="16pt"
                  color="label"
                  textShadow="16px label"
                  weight="heavy"
                >
                  {ChainNameDisplay[chain]}
                </Text>
                <Text size="12pt" color="labelQuaternary" weight="bold">
                  {display}
                </Text>
              </Stack>
            </Inline>
            {/* {chain !== ChainId.optimism && (
              <Inline alignVertical="center">
                <Box
                  display="flex"
                  alignItems="center"
                  borderRadius="5px"
                  padding="7px"
                  borderWidth="1px"
                  borderColor="labelQuaternary"
                  height="fit"
                >
                  <Text color="labelQuaternary" size="12pt" weight="bold">
                    {i18n.t('points.rewards.coming_soon')}
                  </Text>
                </Box>
              </Inline>
            )} */}
          </Box>
        </Inset>
      </Box>
    </Inset>
  );
}
