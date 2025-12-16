import {
  DelegationStatus,
  type DelegationWithChainId,
  type Revoke,
  useDelegations,
} from '@rainbow-me/delegation';
import { useCallback, useMemo } from 'react';
import { type Address, zeroAddress } from 'viem';

import { i18n } from '~/core/languages';
import { SMART_WALLET_LEARN_URL } from '~/core/references/links';
import { useActivationStatus } from '~/core/resources/delegations/activation';
import { useCurrentThemeStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { RevokeReason } from '~/core/types/delegations';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain, getChain } from '~/core/utils/chains';
import { getExplorerUrl, goToNewTab } from '~/core/utils/tabs';
import { Box, Button, Inline, Stack, Symbol, Text } from '~/design-system';
import { ButtonSymbol } from '~/design-system/components/ButtonSymbol/ButtonSymbol';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { SmartWalletLockIcon } from './SmartWalletLockIcon';
import { useDelegationAddress } from './useDelegationAddress';

const smartWalletCardStyles = {
  light: {
    background:
      'linear-gradient(180deg, #F7F5FF 0%, #FFF0FA 100%) padding-box, linear-gradient(180deg, rgba(95, 90, 250, 0.25) 0%, rgba(255, 122, 184, 0.25) 100%) border-box',
    badgeBorder: '1px solid rgba(95, 90, 250, 0.5)',
  },
  dark: {
    background:
      'linear-gradient(180deg, rgba(27, 22, 48, 1) 0%, rgba(44, 30, 66, 1) 100%) padding-box, linear-gradient(180deg, rgba(95, 90, 250, 0.4) 0%, rgba(255, 122, 184, 0.4) 100%) border-box',
    badgeBorder: '1px solid rgba(95, 90, 250, 0.6)',
  },
} as const;

// Shared Smart Wallet Card Component
const SmartWalletCard = ({ status }: { status: 'active' | 'disabled' }) => {
  const isActive = status === 'active';
  const currentTheme = useCurrentThemeStore((s) => s.currentTheme);
  const isDark = currentTheme === 'dark';
  const styles = smartWalletCardStyles[isDark ? 'dark' : 'light'];

  return (
    <Box
      borderRadius="16px"
      padding="20px"
      style={{
        background: styles.background,
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
            style={{ border: styles.badgeBorder }}
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
const BackupInfo = ({ isActive }: { isActive: boolean }) => {
  return (
    <Stack space="8px">
      <Text size="12pt" weight="regular" color="labelSecondary" align="center">
        {i18n.t(
          isActive
            ? 'delegations.smart_wallet.backup_info_enabled'
            : 'delegations.smart_wallet.backup_info_disabled',
        )}
      </Text>
      {SMART_WALLET_LEARN_URL ? (
        <Box
          style={{ cursor: 'pointer' }}
          onClick={() => goToNewTab({ url: SMART_WALLET_LEARN_URL })}
        >
          <Text size="12pt" weight="regular" color="blue" align="center">
            {i18n.t('delegations.smart_wallet.learn_more')}
          </Text>
        </Box>
      ) : null}
    </Stack>
  );
};

const DelegationItem = ({
  delegation,
  onRevoke,
}: {
  delegation: DelegationWithChainId;
  onRevoke: () => void;
}) => {
  const chainInfo = getChain({ chainId: delegation.chainId as ChainId });
  const contractAddress =
    delegation.revokeAddress ?? delegation.currentContract;
  const explorer = getBlockExplorerHostForChain(delegation.chainId as ChainId);
  const isThirdParty =
    delegation.delegationStatus === DelegationStatus.THIRD_PARTY_DELEGATED;

  return (
    <Box
      padding="16px"
      borderRadius="12px"
      background="surfaceSecondaryElevated"
    >
      <Inline space="12px" alignVertical="center" wrap={false}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Stack space="4px">
            <Inline space="8px" alignVertical="center" wrap={false}>
              <ChainBadge chainId={delegation.chainId as ChainId} size={18} />
              <Text size="14pt" weight="semibold" color="label">
                {chainInfo.name}
              </Text>
            </Inline>
            {isThirdParty &&
              (delegation.revokeAddress ?? delegation.currentContract) && (
                <Text size="12pt" weight="regular" color="labelTertiary">
                  {i18n.t('delegations.revoke.contract_label')}:{' '}
                  {truncateAddress(
                    (delegation.revokeAddress ?? delegation.currentContract)!,
                  )}
                </Text>
              )}
          </Stack>
        </Box>
        <Inline space="8px" alignVertical="center" wrap={false}>
          {isThirdParty && (
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
              {contractAddress && explorer && (
                <DropdownMenuItem
                  symbolLeft="safari"
                  onSelect={() =>
                    goToNewTab({
                      url: getExplorerUrl(explorer, contractAddress),
                    })
                  }
                >
                  {i18n.t('delegations.view_on_explorer')}
                </DropdownMenuItem>
              )}
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

/** Revoke needs address; use userAddress as fallback when contract unknown. Handler only needs chainId. */
const toRevoke = (d: DelegationWithChainId, userAddress: Address): Revoke => ({
  chainId: d.chainId,
  address: d.revokeAddress ?? d.currentContract ?? userAddress,
});

export const Delegations = () => {
  const currentAddress = useDelegationAddress();
  const navigate = useRainbowNavigate();

  const address = currentAddress ?? zeroAddress;
  const { isActive: isActivated, enable } = useActivationStatus({
    address,
  });

  const delegations = useDelegations(address);

  const handleActivate = useCallback(() => {
    if (!currentAddress) return;
    enable();
  }, [currentAddress, enable]);

  const handleDisable = useCallback(() => {
    if (!currentAddress) return;

    if (delegations && delegations.length > 0) {
      const delegationsToRevoke: Revoke[] = delegations.map((d) =>
        toRevoke(d, currentAddress),
      );

      if (delegationsToRevoke.length > 0) {
        navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
          replace: true,
          state: {
            address: currentAddress,
            delegationsToRevoke,
            initialIndex: 0,
            backTo: ROUTES.SETTINGS__DELEGATIONS,
            isDisabling: true,
            revokeReason: RevokeReason.DISABLE_SMART_WALLET,
          },
        });
        return;
      }
    }

    // No delegations to revoke, navigate directly to confirm disable page
    navigate(ROUTES.SETTINGS__DELEGATIONS__CONFIRM_DISABLE, {
      replace: true,
      state: { address: currentAddress },
    });
  }, [currentAddress, delegations, navigate]);

  // Revoke a single delegation - called by individual delegation items
  const handleRevokeOne = useCallback(
    (delegation: DelegationWithChainId) => {
      if (!currentAddress) return;
      const delegationToRevoke = toRevoke(delegation, currentAddress);
      const revokeReason =
        delegation.delegationStatus === DelegationStatus.THIRD_PARTY_DELEGATED
          ? RevokeReason.DISABLE_THIRD_PARTY
          : RevokeReason.DISABLE_SINGLE_NETWORK;

      navigate(ROUTES.SETTINGS__DELEGATIONS__REVOKE, {
        state: {
          address: currentAddress,
          delegationsToRevoke: [delegationToRevoke],
          initialIndex: 0,
          backTo: ROUTES.SETTINGS__DELEGATIONS,
          revokeReason,
        },
      });
    },
    [currentAddress, navigate],
  );

  const { rainbowDelegations, thirdPartyDelegations } = useMemo(() => {
    const rainbow =
      delegations?.filter(
        (d) => d.delegationStatus !== DelegationStatus.THIRD_PARTY_DELEGATED,
      ) ?? [];
    const thirdParty =
      delegations?.filter(
        (d) => d.delegationStatus === DelegationStatus.THIRD_PARTY_DELEGATED,
      ) ?? [];
    return { rainbowDelegations: rainbow, thirdPartyDelegations: thirdParty };
  }, [delegations]);

  const content = useMemo(
    () => (
      <Box paddingHorizontal="20px" paddingTop="20px">
        <Stack space="20px">
          {/* Smart Wallet Card */}
          <SmartWalletCard status={isActivated ? 'active' : 'disabled'} />

          {/* Activated Networks - Rainbow delegations */}
          {rainbowDelegations.length > 0 && (
            <Stack space="12px">
              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('delegations.activated_networks')}
              </Text>
              <Stack space="12px">
                {rainbowDelegations.map((delegation, i) => (
                  <DelegationItem
                    key={`${delegation.chainId}-${i}`}
                    delegation={delegation}
                    onRevoke={() => handleRevokeOne(delegation)}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {/* Other Smart Accounts - third-party delegations */}
          {thirdPartyDelegations.length > 0 && (
            <Stack space="12px">
              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('delegations.other_smart_accounts')}
              </Text>
              <Stack space="12px">
                {thirdPartyDelegations.map((delegation, i) => (
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
    ),
    [rainbowDelegations, thirdPartyDelegations, handleRevokeOne, isActivated],
  );

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
              <Menu>
                <MenuItem
                  first
                  last
                  leftComponent={
                    <Symbol
                      symbol="xmark.circle.fill"
                      size={18}
                      weight="semibold"
                      color="red"
                    />
                  }
                  titleComponent={
                    <MenuItem.Title
                      color="red"
                      text={i18n.t('delegations.disable_smart_wallet')}
                    />
                  }
                  onClick={handleDisable}
                />
              </Menu>
              <BackupInfo isActive={isActivated} />
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
              <BackupInfo isActive={isActivated} />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
