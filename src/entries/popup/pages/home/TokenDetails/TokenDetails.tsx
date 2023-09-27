import { useReducer } from 'react';
import { Navigate, To, useParams } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useFavoritesStore } from '~/core/state/favorites';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { handleAssetAccentColor } from '~/core/utils/colors';
import {
  FormattedCurrencyParts,
  formatCurrencyParts,
} from '~/core/utils/formatNumber';
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
} from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { TextProps } from '~/design-system/components/Text/Text';
import { Asterisks } from '~/entries/popup/components/Asterisks/Asterisks';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { SideChainExplainerSheet } from '~/entries/popup/components/SideChainExplainer';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { About } from './About';
import { PriceChart } from './PriceChart';

const HiddenValue = () => <Asterisks color="labelTertiary" size={10} />;

function BalanceValue({
  balance,
  nativeBalance,
}: {
  balance: FormattedCurrencyParts;
  nativeBalance: FormattedCurrencyParts;
}) {
  const { hideAssetBalances } = useHideAssetBalancesStore();

  const color: TextProps['color'] = hideAssetBalances
    ? 'labelTertiary'
    : 'label';

  return (
    <Box display="flex" justifyContent="space-between" gap="10px">
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary">
          {i18n.t('token_details.balance')}
        </Text>
        <Inline alignVertical="center">
          <Text
            size="14pt"
            weight="semibold"
            color={color}
            cursor="text"
            userSelect="all"
          >
            {hideAssetBalances ? <HiddenValue /> : balance.value}{' '}
            {balance.symbol}
          </Text>
        </Inline>
      </Box>
      <Box display="flex" flexDirection="column" gap="12px">
        <Text size="12pt" weight="semibold" color="labelTertiary" align="right">
          {i18n.t('token_details.value')}
        </Text>
        <Inline alignVertical="center">
          <Text
            size="14pt"
            weight="semibold"
            color={color}
            align="right"
            cursor="text"
            userSelect="all"
          >
            {nativeBalance.symbolAtStart && nativeBalance.symbol}
            {hideAssetBalances ? <HiddenValue /> : nativeBalance.value}
            {!nativeBalance.symbolAtStart && nativeBalance.symbol}
          </Text>
        </Inline>
      </Box>
    </Box>
  );
}

function SwapSend({ token }: { token: ParsedUserAsset }) {
  const navigate = useRainbowNavigate();
  const { setSelectedToken } = useSelectedTokenStore();
  const selectTokenAndNavigate = (to: To) => {
    setSelectedToken(token);
    navigate(to);
  };
  return (
    <Box display="flex" gap="8px">
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="arrow.triangle.swap"
        onClick={() => selectTokenAndNavigate(ROUTES.SWAP)}
      >
        {i18n.t('token_details.swap')}
      </Button>
      <Button
        height="32px"
        variant="flat"
        width="full"
        color="accent"
        symbol="paperplane.fill"
        onClick={() => selectTokenAndNavigate(ROUTES.SEND)}
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
        <Text size="12pt" weight="semibold" color="labelSecondary">
          {i18n.t('token_details.this_token_is_on_network', {
            symbol: tokenSymbol,
            chainName: ChainNameDisplay[chainId],
          })}
        </Text>
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

function MoreOptions({ token }: { token: ParsedUserAsset }) {
  const explorer = getTokenBlockExplorer(token);
  const isEth = [token.address, token.mainnetAddress].includes(ETH_ADDRESS);
  const { currentTheme } = useCurrentThemeStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <ButtonSymbol
            symbol="ellipsis.circle"
            height="32px"
            variant="transparentHover"
            color="labelSecondary"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AccentColorProviderWrapper
          color={handleAssetAccentColor(
            currentTheme,
            token.colors?.primary || token.colors?.fallback,
          )}
        >
          {!isEth && (
            <DropdownMenuItem
              symbolLeft="doc.on.doc.fill"
              onSelect={() => {
                navigator.clipboard.writeText(token.address);
                triggerToast({
                  title: i18n.t('wallet_header.copy_toast'),
                  description: truncateAddress(token.address),
                });
              }}
            >
              <Stack space="8px">
                <Text size="14pt" weight="semibold">
                  {i18n.t('token_details.more_options.copy_address')}
                </Text>
                <Text size="11pt" color="labelTertiary" weight="medium">
                  {truncateAddress(token.address)}
                </Text>
              </Stack>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            symbolLeft="safari"
            external
            onSelect={() => window.open(getCoingeckoUrl(token), '_blank')}
          >
            CoinGecko
          </DropdownMenuItem>
          {!isEth && (
            <DropdownMenuItem
              symbolLeft="binoculars.fill"
              external
              onSelect={() => window.open(explorer.url, '_blank')}
            >
              {i18n.t('token_details.view_on', { explorer: explorer.name })}
            </DropdownMenuItem>
          )}

          {/* <Separator color="separatorSecondary" />

          <DropdownMenuItem emoji="🙈">
            {i18n.t('token_details.more_options.hide')}
          </DropdownMenuItem>
          <DropdownMenuItem emoji="🆘">
            {i18n.t('token_details.more_options.report')}
          </DropdownMenuItem> */}
        </AccentColorProviderWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TokenDetails() {
  const { uniqueId } = useParams<{ uniqueId: UniqueId }>();
  const { currentTheme } = useCurrentThemeStore();

  const { data: token, isFetched } = useUserAsset(uniqueId);

  const { isWatchingWallet } = useWallets();

  const navigate = useRainbowNavigate();

  if (!uniqueId || (isFetched && !token)) return <Navigate to={ROUTES.HOME} />;
  if (!token) return null;

  const tokenBalance = {
    ...formatCurrencyParts(token.balance.amount),
    symbol: token.symbol,
  };
  const tokenNativeBalance = formatCurrencyParts(token.native.balance.amount);

  return (
    <AccentColorProviderWrapper
      color={handleAssetAccentColor(
        currentTheme,
        token.colors?.primary || token.colors?.fallback,
      )}
    >
      <Box
        display="flex"
        flexDirection="column"
        background="surfacePrimaryElevatedSecondary"
        borderColor="separatorTertiary"
        borderWidth="1px"
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
              <FavoriteButton token={token} />
              <MoreOptions token={token} />
            </Inline>
          }
        />
        <Box padding="20px" gap="16px" display="flex" flexDirection="column">
          <PriceChart token={token} />

          <Separator color="separatorTertiary" />

          <BalanceValue
            balance={tokenBalance}
            nativeBalance={tokenNativeBalance}
          />

          {!isWatchingWallet && token.balance.amount !== '0' && (
            <SwapSend token={token} />
          )}

          <NetworkBanner tokenSymbol={token.symbol} chainId={token.chainId} />
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap="24px"
        paddingHorizontal="20px"
        paddingVertical="24px"
      >
        {/* <TokenApprovals /> */}

        {/* <Separator color="separatorTertiary" /> */}

        <About token={token} />
      </Box>
    </AccentColorProviderWrapper>
  );
}
