import { useCallback, useEffect, useReducer } from 'react';
import { Navigate, To, useParams } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { useApprovals } from '~/core/resources/approvals/approvals';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useFavoritesStore } from '~/core/state/favorites';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { usePinnedAssetStore } from '~/core/state/pinnedAssets';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset, UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import {
  getChainName,
  isCustomChain,
  isNativeAsset,
  isTestnetChainId,
} from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import {
  FormattedCurrencyParts,
  formatCurrencyParts,
} from '~/core/utils/formatNumber';
import { convertRawAmountToDecimalFormat } from '~/core/utils/numbers';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { TextProps } from '~/design-system/components/Text/Text';
import { Asterisks } from '~/entries/popup/components/Asterisks/Asterisks';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '~/entries/popup/components/ExplainerSheet/ExplainerSheet';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { SideChainExplainerSheet } from '~/entries/popup/components/SideChainExplainer';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useCustomNetworkAsset } from '~/entries/popup/hooks/useCustomNetworkAsset';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useTokenDetailsShortcuts } from '~/entries/popup/hooks/useTokenDetailsShortcuts';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { TokenApprovalContextMenu } from '../Approvals/Approvals';
import { triggerRevokeApproval } from '../Approvals/utils';

import { About } from './About';
import { PriceChart } from './PriceChart';

const HiddenValue = () => <Asterisks color="labelTertiary" size={10} />;

function BalanceValue({
  balance,
  nativeBalance,
  chainId,
}: {
  balance: FormattedCurrencyParts;
  nativeBalance: FormattedCurrencyParts;
  chainId: ParsedUserAsset['chainId'];
}) {
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const color: TextProps['color'] = hideAssetBalances
    ? 'labelTertiary'
    : 'label';

  const getPrice = (
    nativeBalance: FormattedCurrencyParts,
    chainId: ParsedUserAsset['chainId'],
  ) => {
    if (isCustomChain(chainId) && nativeBalance.value === '0') {
      return '-';
    } else {
      const val = hideAssetBalances ? <HiddenValue /> : nativeBalance.value;
      return (
        (nativeBalance.symbolAtStart && nativeBalance.symbol + val) ||
        val + nativeBalance.symbol
      );
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary">
          {i18n.t('token_details.balance')}
        </Text>
        <Inline alignVertical="center">
          <TextOverflow
            size="14pt"
            weight="semibold"
            color={color}
            cursor="text"
            userSelect="all"
          >
            {hideAssetBalances ? <HiddenValue /> : balance.value}{' '}
            {balance.symbol}
          </TextOverflow>
        </Inline>
      </Box>
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary" align="right">
          {i18n.t('token_details.value')}
        </Text>
        <Inline alignVertical="center">
          <TextOverflow
            size="14pt"
            weight="semibold"
            color={color}
            align="right"
            cursor="text"
            userSelect="all"
          >
            {getPrice(nativeBalance, chainId)}
          </TextOverflow>
        </Inline>
      </Box>
    </Box>
  );
}

function SwapSend({
  token,
  isSwappable,
}: {
  token: ParsedUserAsset;
  isSwappable: boolean;
}) {
  const navigate = useRainbowNavigate();
  const { setSelectedToken } = useSelectedTokenStore();
  const selectTokenAndNavigate = (to: To) => {
    setSelectedToken(token);
    navigate(to);
  };
  const isBridgeable = token.bridging?.isBridgeable;

  return (
    <Box display="flex" gap="8px">
      {isSwappable && (
        <Button
          height="32px"
          variant="flat"
          width="full"
          color="accent"
          symbol="arrow.triangle.swap"
          onClick={() => selectTokenAndNavigate(ROUTES.SWAP)}
          tabIndex={0}
        >
          {i18n.t('token_details.swap')}
        </Button>
      )}
      {isBridgeable && (
        <Button
          height="32px"
          variant="flat"
          width="full"
          color="accent"
          symbol="arrow.turn.up.right"
          onClick={() => selectTokenAndNavigate(ROUTES.BRIDGE)}
        >
          {i18n.t('token_details.bridge')}
        </Button>
      )}
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="paperplane.fill"
        onClick={() => selectTokenAndNavigate(ROUTES.SEND)}
        tabIndex={0}
      >
        {i18n.t('token_details.send')}
      </Button>
    </Box>
  );
}

function NetworkBanner({
  tokenSymbol,
  chainId,
}: {
  tokenSymbol: string;
  chainId: ChainId;
}) {
  const [isExplainerOpen, toggleExplainer] = useReducer((s) => !s, false);
  const chainName = getChainName({ chainId });

  if (chainId === ChainId.mainnet) return null;

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        background="surfacePrimaryElevated"
        borderColor="separatorTertiary"
        borderWidth="1px"
        borderRadius="12px"
        padding="8px"
        gap="4px"
        onClick={toggleExplainer}
      >
        <ChainBadge chainId={chainId} size="14" />
        <TextOverflow size="12pt" weight="semibold" color="labelSecondary">
          {i18n.t('token_details.this_token_is_on_network', {
            symbol: tokenSymbol,
            chainName,
          })}
        </TextOverflow>
        <Box style={{ marginLeft: 'auto', height: 14 }}>
          <Symbol
            symbol="info.circle.fill"
            color="labelTertiary"
            size={14}
            weight="semibold"
          />
        </Box>
      </Box>
      <SideChainExplainerSheet
        chainId={chainId}
        show={isExplainerOpen}
        onDismiss={toggleExplainer}
      />
    </>
  );
}

function FavoriteButton({ token }: { token: ParsedUserAsset }) {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const isFavorite = favorites[token.chainId]?.includes(token.address);
  return (
    <ButtonSymbol
      symbol="star.fill"
      height="32px"
      variant="transparentHover"
      color={isFavorite ? 'yellow' : 'labelSecondary'}
      onClick={() => (isFavorite ? removeFavorite(token) : addFavorite(token))}
      tabIndex={0}
    />
  );
}

export const getCoingeckoUrl = ({
  address,
  mainnetAddress,
}: Pick<ParsedUserAsset, 'address' | 'mainnetAddress'>) => {
  if ([mainnetAddress, address].includes(ETH_ADDRESS))
    return `https://www.coingecko.com/en/coins/ethereum`;
  return `https://www.coingecko.com/en/coins/${mainnetAddress || address}`;
};

function MoreOptions({
  token,
  swappable,
}: {
  token: ParsedUserAsset;
  swappable: boolean;
}) {
  const { hiddenAssets, removeHiddenAsset, addHiddenAsset } =
    useHiddenAssetStore();

  const { pinnedAssets, removedPinnedAsset, addPinnedAsset } =
    usePinnedAssetStore();

  const { selectedToken, setSelectedToken } = useSelectedTokenStore();

  const { isWatchingWallet } = useWallets();

  const resetSelectedToken = useCallback(() => {
    if (selectedToken) setSelectedToken();
  }, [setSelectedToken, selectedToken]);

  useEffect(() => {
    // When component unmounts reset the selectedToken
    return resetSelectedToken;
  }, [resetSelectedToken]);

  const isHidden = useCallback(
    (asset: ParsedUserAsset) =>
      hiddenAssets.some(
        (uniqueId) => uniqueId === computeUniqueIdForHiddenAsset(asset),
      ),
    [hiddenAssets],
  );

  const hidden = isHidden(token);
  const explorer = getTokenBlockExplorer(token);
  const isNative = isNativeAsset(token.address, token.chainId);
  const pinned = pinnedAssets.some(
    ({ uniqueId }) => uniqueId === token.uniqueId,
  );

  const toggleHideToken = useCallback(() => {
    if (hidden) {
      removeHiddenAsset({ uniqueId: computeUniqueIdForHiddenAsset(token) });
      triggerToast({
        title: i18n.t('token_details.toast.unhide_token', {
          name: token.symbol,
        }),
      });
      return;
    }
    if (pinned) removedPinnedAsset({ uniqueId: token.uniqueId });
    addHiddenAsset({ uniqueId: computeUniqueIdForHiddenAsset(token) });
    triggerToast({
      title: i18n.t('token_details.toast.hide_token', {
        name: token.symbol,
      }),
    });
  }, [
    token,
    hidden,
    pinned,
    removedPinnedAsset,
    addHiddenAsset,
    removeHiddenAsset,
  ]);

  const togglePinToken = useCallback(() => {
    if (pinned) {
      removedPinnedAsset({ uniqueId: token.uniqueId });
      triggerToast({
        title: i18n.t('token_details.toast.unpin_token', {
          name: token.symbol,
        }),
      });
      return;
    }
    addPinnedAsset({ uniqueId: token.uniqueId });
    triggerToast({
      title: i18n.t('token_details.toast.pin_token', {
        name: token.symbol,
      }),
    });
  }, [token, pinned, addPinnedAsset, removedPinnedAsset]);

  const copyTokenAddress = useCallback(() => {
    copyAddress(token.address);
  }, [token]);

  const getTokenExists = useCallback(() => !!token, [token]);

  useTokenDetailsShortcuts({
    getTokenExists,
    toggleHideToken,
    togglePinToken,
    copyTokenAddress,
  });

  const onOpenChange = (open: boolean) => {
    setSelectedToken(open ? token : undefined);
  };

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <div>
          <ButtonSymbol
            symbol="ellipsis.circle"
            height="32px"
            variant="transparentHover"
            color="labelSecondary"
            tabIndex={0}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AccentColorProvider
          color={token.colors?.primary || token.colors?.fallback}
        >
          {!hidden && (
            <DropdownMenuItem
              symbolLeft="pin.fill"
              onSelect={togglePinToken}
              shortcut={shortcuts.tokens.PIN_ASSET.display}
            >
              <TextOverflow weight="semibold" size="14pt">
                {pinned
                  ? i18n.t('token_details.more_options.unpin_token', {
                      name: token.symbol,
                    })
                  : i18n.t('token_details.more_options.pin_token', {
                      name: token.symbol,
                    })}
              </TextOverflow>
            </DropdownMenuItem>
          )}
          {!isWatchingWallet && (
            <DropdownMenuItem
              symbolLeft="eye.slash.fill"
              onSelect={toggleHideToken}
              shortcut={shortcuts.tokens.HIDE_ASSET.display}
            >
              <TextOverflow weight="semibold" size="14pt">
                {hidden
                  ? i18n.t('token_details.more_options.unhide_token', {
                      name: token.symbol,
                    })
                  : i18n.t('token_details.more_options.hide_token', {
                      name: token.symbol,
                    })}
              </TextOverflow>
            </DropdownMenuItem>
          )}
          {swappable && (
            <>
              {!isNative && (
                <DropdownMenuItem
                  symbolLeft="doc.on.doc.fill"
                  onSelect={copyTokenAddress}
                  shortcut={shortcuts.home.COPY_ADDRESS.display}
                >
                  <Text size="14pt" weight="semibold">
                    {i18n.t('token_details.more_options.copy_address')}
                  </Text>
                  <Text size="11pt" color="labelTertiary" weight="medium">
                    {truncateAddress(token.address)}
                  </Text>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                symbolLeft="safari"
                external
                onSelect={() => window.open(getCoingeckoUrl(token), '_blank')}
              >
                {i18n.t('token_details.view_on_coingecko')}
              </DropdownMenuItem>
              {!isNative && explorer && (
                <DropdownMenuItem
                  symbolLeft="binoculars.fill"
                  external
                  onSelect={() => window.open(explorer.url, '_blank')}
                >
                  {i18n.t('token_details.view_on', { explorer: explorer.name })}
                </DropdownMenuItem>
              )}
            </>
          )}
        </AccentColorProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TokenDetails() {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { uniqueId } = useParams<{ uniqueId: UniqueId }>();

  const { data: userAsset, isFetched } = useUserAsset(uniqueId);
  const { data: customAsset, isFetched: isCustomAssetFetched } =
    useCustomNetworkAsset({ uniqueId });

  const { isWatchingWallet } = useWallets();

  const navigate = useRainbowNavigate();
  const token = userAsset || customAsset;

  const { data: approvals } = useApprovals(
    {
      address: currentAddress,
      chainIds: [Number(token?.chainId) as ChainId],
      currency: currentCurrency,
    },
    {
      enabled: !!Number(token?.chainId),
      select: (data) => {
        if (data) {
          const tokenApprovals = data.filter((approval) =>
            isLowerCaseMatch(approval.asset.asset_code, token?.address),
          );
          return tokenApprovals;
        }
        return null;
      },
    },
  );

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();

  const showTokenApprovalsExplainer = useCallback(() => {
    showExplainerSheet({
      show: true,
      header: {
        icon: (
          <Symbol
            symbol="checkmark.seal.fill"
            size={32}
            weight="semibold"
            color="blue"
          />
        ),
      },
      description: [
        i18n.t(
          'approvals.token_details.explainer.token_approval.description_1',
        ),
        i18n.t(
          'approvals.token_details.explainer.token_approval.description_2',
        ),
      ],
      title: i18n.t('approvals.token_details.explainer.token_approval.title'),
      actionButton: {
        label: i18n.t(
          'approvals.token_details.explainer.token_approval.action_label',
        ),
        action: hideExplainerSheet,
        labelColor: 'label',
      },
    });
  }, [hideExplainerSheet, showExplainerSheet]);

  if (
    !uniqueId ||
    (isFetched && !userAsset && isCustomAssetFetched && !customAsset)
  ) {
    return <Navigate to={ROUTES.HOME} />;
  }

  if (!token) return null;

  const isSwappable = !(
    isTestnetChainId({ chainId: token?.chainId }) || !!customAsset
  );

  const tokenBalance = {
    ...formatCurrencyParts(token.balance.amount),
    symbol: token.symbol,
  };
  const tokenNativeBalance = formatCurrencyParts(token.native.balance.amount);

  const tokenApprovals = approvals
    ?.map((approval) =>
      approval.spenders.map((spender) => ({
        approval,
        spender,
      })),
    )
    .flat();

  return (
    <AccentColorProvider
      color={token.colors?.primary || token.colors?.fallback}
    >
      <Box
        height="full"
        background="surfacePrimaryElevatedSecondary"
        borderColor="separatorTertiary"
        borderWidth="1px"
        isModal
        style={{ borderTop: 0, borderLeft: 0, borderRight: 0 }}
      >
        <Navbar
          leftComponent={
            <Navbar.BackButton
              onClick={() =>
                navigate(ROUTES.HOME, {
                  state: { skipTransitionOnRoute: ROUTES.HOME },
                })
              }
            />
          }
          rightComponent={
            <Inline alignVertical="center" space="7px">
              {isSwappable && <FavoriteButton token={token} />}
              <MoreOptions swappable={isSwappable} token={token} />
            </Inline>
          }
        />
        <Box padding="20px" gap="16px" display="flex" flexDirection="column">
          <PriceChart token={token} />

          <Separator color="separatorTertiary" />

          <BalanceValue
            balance={tokenBalance}
            nativeBalance={tokenNativeBalance}
            chainId={token.chainId}
          />

          {!isWatchingWallet && token.balance.amount !== '0' && (
            <SwapSend token={token} isSwappable={isSwappable} />
          )}

          <NetworkBanner tokenSymbol={token.symbol} chainId={token.chainId} />
        </Box>
      </Box>

      {isSwappable && (
        <Box
          display="flex"
          flexDirection="column"
          gap="24px"
          paddingHorizontal="20px"
          paddingVertical="24px"
        >
          {!isWatchingWallet && approvals?.length ? (
            <Box
              background="surfaceSecondaryElevated"
              padding="16px"
              borderRadius="16px"
            >
              <Stack space="12px">
                <Inline space="4px" alignVertical="center">
                  <Text size="14pt" weight="heavy" color="label">
                    {i18n.t('token_details.approvals')}
                  </Text>
                  <ButtonSymbol
                    symbol="info.circle.fill"
                    color="labelQuaternary"
                    height="28px"
                    variant="tinted"
                    onClick={showTokenApprovalsExplainer}
                  />
                </Inline>

                <Separator color="separatorTertiary" />
                {tokenApprovals?.map((approval, i) => {
                  return (
                    <Inline
                      key={i}
                      alignHorizontal="justify"
                      alignVertical="center"
                    >
                      <Inline space="12px" alignVertical="center">
                        <Symbol
                          weight="regular"
                          size={16}
                          symbol="doc.plaintext"
                          color="labelTertiary"
                        />
                        <Text
                          size="12pt"
                          weight="semibold"
                          color="labelTertiary"
                        >
                          {approval.spender.contract_name ||
                            truncateAddress(approval.spender.contract_address)}
                        </Text>
                      </Inline>
                      <Inline space="12px" alignVertical="center">
                        <Text
                          size="12pt"
                          weight="semibold"
                          color="labelTertiary"
                        >
                          {approval.spender?.quantity_allowed.toLowerCase() ===
                          'unlimited'
                            ? approval.spender?.quantity_allowed
                            : `${convertRawAmountToDecimalFormat(
                                approval.spender?.quantity_allowed || '0',
                                approval?.approval.asset.decimals,
                              )} ${approval?.approval.asset.symbol}`}
                        </Text>
                        <TokenApprovalContextMenu
                          type="dropdown"
                          chainId={token.chainId}
                          txHash={approval.spender.tx_hash}
                          contractAddress={approval.spender.contract_address}
                          onRevokeApproval={() => {
                            triggerRevokeApproval({
                              show: true,
                              approval: approval,
                            });
                          }}
                        >
                          <Box>
                            <Symbol
                              size={14}
                              weight="regular"
                              symbol="ellipsis.circle"
                              color="labelTertiary"
                            />
                          </Box>
                        </TokenApprovalContextMenu>
                      </Inline>
                    </Inline>
                  );
                })}
              </Stack>
            </Box>
          ) : null}
          <Separator color="separatorTertiary" />
          <About token={token} />
        </Box>
      )}
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
      />
    </AccentColorProvider>
  );
}
