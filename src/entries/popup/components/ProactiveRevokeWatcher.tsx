import chroma from 'chroma-js';
import { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useShouldRevokeDelegation } from '~/core/resources/delegations/shouldRevoke';
import { useCurrentAddressStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { DelegationToRevoke } from '~/core/types/delegations';
import {
  Box,
  Column,
  Columns,
  Inline,
  Stack,
  Symbol,
  TextOverflow,
} from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { NudgeBanner } from '~/design-system/components/NudgeBanner/NudgeBanner';
import { globalColors } from '~/design-system/styles/designTokens';

import usePrevious from '../hooks/usePrevious';
import { useRainbowNavigate } from '../hooks/useRainbowNavigate';
import { ROUTES } from '../urls';
import { zIndexes } from '../utils/zIndexes';

export const ProactiveRevokeWatcher = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { data } = useShouldRevokeDelegation({ address: currentAddress });
  const [dismissed, setDismissed] = useState(false);
  const navigate = useRainbowNavigate();

  // Reset dismissed state on address change so we re-check
  const prevAddress = usePrevious(currentAddress);
  useEffect(() => {
    if (prevAddress && prevAddress !== currentAddress) {
      setDismissed(false);
    }
  }, [currentAddress, prevAddress]);

  const show = !!data?.shouldRevoke && !dismissed;

  const handleRevoke = useCallback(() => {
    const delegationsToRevoke: DelegationToRevoke[] = (data?.revokes ?? []).map(
      (r) => ({
        chainId: r.chainId as ChainId,
        contractAddress: r.address,
      }),
    );
    setDismissed(true);
    navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
      state: {
        address: currentAddress,
        delegationsToRevoke,
        initialIndex: 0,
        revokeReason: 'security_alert',
        backTo: ROUTES.HOME,
      },
    });
  }, [currentAddress, data, navigate]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const redWithOpacity = (opacity: number) =>
    chroma(globalColors.red60).alpha(opacity).css();

  return (
    <NudgeBanner show={show} zIndex={zIndexes.BOTTOM_SHEET}>
      <Box padding="9px" testId="proactive-revoke-nudge-banner">
        <Columns>
          <Column>
            <Columns alignVertical="center" space="10px">
              <Column width="content">
                <Box
                  alignItems="center"
                  borderRadius="10px"
                  display="flex"
                  justifyContent="center"
                  style={{
                    backgroundColor: redWithOpacity(0.15),
                    height: 36,
                    width: 36,
                  }}
                >
                  <Symbol
                    color="red"
                    size={18}
                    symbol="exclamationmark.triangle.fill"
                    weight="bold"
                  />
                </Box>
              </Column>
              <Column>
                <Box paddingRight="10px">
                  <Stack space="4px">
                    <TextOverflow color="label" size="14pt" weight="bold">
                      {i18n.t('delegations.proactive_revoke.title')}
                    </TextOverflow>
                    <TextOverflow
                      color="labelSecondary"
                      size="12pt"
                      weight="semibold"
                    >
                      {i18n.t('delegations.proactive_revoke.description')}
                    </TextOverflow>
                  </Stack>
                </Box>
              </Column>
            </Columns>
          </Column>
          <Column width="content">
            <Inline space="4px">
              <ButtonOverflow>
                <Box
                  borderRadius="10px"
                  onClick={handleRevoke}
                  padding="3px"
                  style={{
                    backgroundColor: redWithOpacity(0.25),
                    boxShadow: `0 0 10px 2px ${redWithOpacity(0.2)}`,
                    height: 36,
                    width: 36,
                  }}
                  testId="proactive-revoke-action"
                  tabIndex={0}
                >
                  <Box
                    alignItems="center"
                    borderRadius="7px"
                    borderWidth="1.5px"
                    display="flex"
                    justifyContent="center"
                    paddingTop="1px"
                    style={{
                      backgroundColor: redWithOpacity(0.8),
                      borderColor: redWithOpacity(0.6),
                      height: 30,
                      width: 30,
                    }}
                  >
                    <Symbol
                      color="label"
                      size={14.75}
                      symbol="exclamationmark.circle.fill"
                      weight="heavy"
                    />
                  </Box>
                </Box>
              </ButtonOverflow>
              <ButtonOverflow>
                <Box
                  borderColor="transparent"
                  borderWidth="1.5px"
                  borderRadius="10px"
                  onClick={handleDismiss}
                  style={{
                    height: 36,
                    padding: 1.5,
                    width: 36,
                  }}
                  tabIndex={1}
                >
                  <Box
                    alignItems="center"
                    background="fillTertiary"
                    borderColor="separatorTertiary"
                    borderRadius="7px"
                    borderWidth="1.5px"
                    boxShadow="12px"
                    display="flex"
                    justifyContent="center"
                    paddingTop="1px"
                    style={{
                      height: 30,
                      width: 30,
                    }}
                  >
                    <Symbol
                      color="labelSecondary"
                      size={10.75}
                      symbol="xmark"
                      weight="heavy"
                    />
                  </Box>
                </Box>
              </ButtonOverflow>
            </Inline>
          </Column>
        </Columns>
      </Box>
    </NudgeBanner>
  );
};
