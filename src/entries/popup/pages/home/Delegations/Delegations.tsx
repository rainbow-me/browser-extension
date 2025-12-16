import { useCallback, useMemo } from 'react';
import { zeroAddress } from 'viem';

import { i18n } from '~/core/languages';
import { useActivationStatus } from '~/core/resources/delegations/activation';
import { useDelegations } from '~/core/resources/delegations/delegations';
import { useCurrentAddressStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { ChainDelegation, DelegationToRevoke } from '~/core/types/delegations';
import { getChain } from '~/core/utils/chains';
import { Box, Button, Inline, Stack, Symbol, Text } from '~/design-system';
import { ButtonSymbol } from '~/design-system/components/ButtonSymbol/ButtonSymbol';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { SmartWalletLockIcon } from './SmartWalletLockIcon';

// Shared Smart Wallet Card Component
const SmartWalletCard = ({ status }: { status: 'active' | 'disabled' }) => {
  const isActive = status === 'active';
  return (
    <Box
      borderRadius="16px"
      padding="20px"
      style={{
        background:
          'linear-gradient(180deg, rgba(27, 22, 48, 1) 0%, rgba(44, 30, 66, 1) 100%) padding-box, linear-gradient(180deg, #5F5AFA 0%, #FF7AB8 100%) border-box',
        border: '1px solid transparent',
      }}
    >
      <Stack space="16px" alignHorizontal="center">
        {/* Icon */}
        <SmartWalletLockIcon />

        {/* Title */}
        <Stack space="8px" alignHorizontal="center">
          <Text size="20pt" weight="bold" color="label" align="center">
            {i18n.t('delegations.smart_wallet.title')}
          </Text>

          {/* Status Badge */}
          <Box
            display="flex"
            alignItems="center"
            gap="6px"
            paddingHorizontal="10px"
            paddingVertical="5px"
            borderRadius="round"
            style={{
              border: '1px solid rgba(95, 90, 250, 0.6)',
            }}
          >
            <Symbol
              symbol={isActive ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
              size={14}
              weight="semibold"
              color={isActive ? 'green' : 'red'}
            />
            <Text size="12pt" weight="semibold" color="label">
              {i18n.t(
                isActive
                  ? 'delegations.smart_wallet.active'
                  : 'delegations.smart_wallet.disabled',
              )}
            </Text>
          </Box>
        </Stack>

        {/* Description */}
        <Text
          size="14pt"
          weight="regular"
          color="labelSecondary"
          align="center"
        >
          {i18n.t('delegations.smart_wallet.description')}
        </Text>
      </Stack>
    </Box>
  );
};

// Shared Backup Info Component
const BackupInfo = () => {
  return (
    <Stack space="8px">
      <Text size="12pt" weight="regular" color="labelTertiary" align="center">
        {i18n.t('delegations.smart_wallet.backup_info')}
      </Text>
      <Text size="12pt" weight="regular" color="blue" align="center">
        {i18n.t('delegations.smart_wallet.learn_more')}
      </Text>
    </Stack>
  );
};

const DelegationItem = ({
  delegation,
  onRevoke,
}: {
  delegation: ChainDelegation;
  onRevoke: () => void;
}) => {
  const chainInfo = getChain({ chainId: delegation.chainId as ChainId });

  return (
    <Box
      padding="16px"
      borderRadius="12px"
      background="surfaceSecondaryElevated"
    >
      <Inline space="12px" alignVertical="center" wrap={false}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Inline space="8px" alignVertical="center" wrap={false}>
            <ChainBadge chainId={delegation.chainId as ChainId} size={18} />
            <Text size="14pt" weight="semibold" color="label">
              {chainInfo.name}
            </Text>
          </Inline>
        </Box>
        <Inline space="8px" alignVertical="center" wrap={false}>
          {delegation.isThirdParty && (
            <CursorTooltip
              text={i18n.t('delegations.third_party_indicator_tooltip')}
              textWeight="semibold"
              textSize="12pt"
              textColor="labelSecondary"
              align="end"
            >
              <Box style={{ cursor: 'help' }}>
                <Symbol
                  symbol="exclamationmark.triangle.fill"
                  size={16}
                  weight="semibold"
                  color="orange"
                />
              </Box>
            </CursorTooltip>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Box style={{ cursor: 'default' }}>
                <ButtonSymbol
                  color="labelTertiary"
                  height="32px"
                  variant="transparentHover"
                  symbol="ellipsis.circle"
                />
              </Box>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                symbolLeft="xmark.circle.fill"
                color="red"
                onSelect={onRevoke}
              >
                {i18n.t('delegations.revoke.action')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Inline>
      </Inline>
    </Box>
  );
};

// Convert ChainDelegation to DelegationToRevoke format
const convertToDelegationToRevoke = (
  delegation: ChainDelegation,
): DelegationToRevoke => {
  return {
    chainId: delegation.chainId as ChainId,
    contractAddress: delegation.contractAddress,
  };
};

export const Delegations = () => {
  const { currentAddress } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();

  const {
    enabled: isActivated,
    isLoading: isLoadingActivation,
    enable,
  } = useActivationStatus({
    address: currentAddress || zeroAddress,
  });

  const { data: delegations, isLoading } = useDelegations({
    address: currentAddress,
  });

  // Activate smart wallet - called by "Activate Smart Wallet" button
  const handleActivate = useCallback(() => {
    if (!currentAddress) return;
    enable();
  }, [currentAddress, enable]);

  // Disable smart wallet - called by "Disable Smart Wallet" button
  const handleDisable = useCallback(() => {
    if (!currentAddress) return;

    // If there are delegations, revoke them first, then navigate to confirm disable
    if (delegations && delegations.length > 0) {
      const delegationsToRevoke = delegations.map(convertToDelegationToRevoke);

      if (delegationsToRevoke.length > 0) {
        // Navigate to revoke page with all delegations - will process them sequentially
        // Pass isDisabling flag and onComplete callback to navigate to confirm disable after revoking
        navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
          replace: true, // Use replace to avoid route stack issues
          state: {
            delegationsToRevoke,
            initialIndex: 0,
            backTo: ROUTES.SETTINGS__DELEGATIONS,
            isDisabling: true,
            onComplete: async () => {
              // Navigate to confirm disable page after all delegations are revoked
              navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, {
                replace: true,
              });
            },
          },
        });
        return;
      }
    }

    // No delegations to revoke, navigate directly to confirm disable page
    navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, { replace: true });
  }, [delegations, navigate, currentAddress]);

  // Revoke a single delegation - called by individual delegation items
  const handleRevokeOne = useCallback(
    (delegation: ChainDelegation) => {
      const delegationToRevoke = convertToDelegationToRevoke(delegation);

      // Navigate to revoke page with single delegation
      navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
        state: {
          delegationsToRevoke: [delegationToRevoke],
          initialIndex: 0,
          backTo: ROUTES.SETTINGS__DELEGATIONS,
        },
      });
    },
    [navigate],
  );

  const hasDelegations = delegations && delegations.length > 0;
  const isLoadingData = isLoading || isLoadingActivation;

  const content = useMemo(() => {
    if (isLoadingData) {
      return (
        <Box
          width="fit"
          alignItems="center"
          justifyContent="center"
          style={{ margin: 'auto', paddingTop: 120 }}
        >
          <Spinner size={30} color="accent" />
        </Box>
      );
    }

    return (
      <Box paddingHorizontal="20px" paddingTop="20px">
        <Stack space="20px">
          {/* Smart Wallet Card */}
          <SmartWalletCard status={isActivated ? 'active' : 'disabled'} />

          {/* Activated Networks Section - show delegations regardless of smart wallet activation status */}
          {hasDelegations && (
            <Stack space="12px">
              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('delegations.activated_networks')}
              </Text>
              <Stack space="12px">
                {delegations.map((delegation, i) => (
                  <DelegationItem
                    key={`${delegation.chainId}-${i}`}
                    delegation={delegation}
                    onRevoke={() => handleRevokeOne(delegation)}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Box>
    );
  }, [
    delegations,
    isLoadingData,
    handleRevokeOne,
    hasDelegations,
    isActivated,
  ]);

  return (
    <Box>
      <Box
        style={{
          overflow: 'scroll',
        }}
      >
        {content}
      </Box>

      {/* Action Button and Backup Info */}
      <Box padding="20px">
        <Stack space="16px">
          {isActivated ? (
            <>
              <Button
                color="blue"
                height="44px"
                variant="flat"
                width="full"
                onClick={handleDisable}
              >
                {i18n.t('delegations.disable_smart_wallet')}
              </Button>
              <BackupInfo />
            </>
          ) : (
            <>
              <Button
                color="blue"
                height="44px"
                variant="flat"
                width="full"
                onClick={handleActivate}
              >
                {i18n.t('delegations.activate_smart_wallet')}
              </Button>
              <BackupInfo />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
