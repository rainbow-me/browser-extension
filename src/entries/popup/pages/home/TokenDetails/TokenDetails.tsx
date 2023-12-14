import { useReducer } from 'react';
import { Navigate, To, useParams } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useFavoritesStore } from '~/core/state/favorites';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import {
  findCustomChainForChainId,
  isCustomChain,
  isNativeAsset,
  isTestnetChainId,
} from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
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
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { SideChainExplainerSheet } from '~/entries/popup/components/SideChainExplainer';
import { useCustomNetworkAsset } from '~/entries/popup/hooks/useCustomNetworkAsset';
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
  if (chainId === ChainId.mainnet) return null;

  const chainName =
    ChainNameDisplay[chainId] || findCustomChainForChainId(chainId)?.name;

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

function MoreOptions({ token }: { token: ParsedUserAsset }) {
  const explorer = getTokenBlockExplorer(token);
  const isNative = isNativeAsset(token.address, token.chainId);
  return (
    <DropdownMenu>
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
          {!isNative && (
            <DropdownMenuItem
              symbolLeft="doc.on.doc.fill"
              onSelect={() => copyAddress(token.address)}
            >
              <Text size="14pt" weight="semibold">
                {i18n.t('token_details.more_options.copy_address')}
              </Text>
              <Text size="11pt" color="labelTertiary" weight="medium">
                {truncateAddress(token.address)}
              </Text>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            symbolLeft="safari"
            external
            onSelect={() => window.open(getCoingeckoUrl(token), '_blank')}
          >
            CoinGecko
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
        </AccentColorProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TokenDetails() {
  const { uniqueId } = useParams<{ uniqueId: UniqueId }>();

  const { data: userAsset, isFetched } = useUserAsset(uniqueId);
  const { data: customAsset, isFetched: isCustomAssetFetched } =
    useCustomNetworkAsset(uniqueId);

  const { isWatchingWallet } = useWallets();

  const navigate = useRainbowNavigate();

  if (
    !uniqueId ||
    (isFetched && !userAsset && isCustomAssetFetched && !customAsset)
  ) {
    return <Navigate to={ROUTES.HOME} />;
  }

  const token = userAsset || customAsset;
  if (!token) return null;

  const isSwappable = !(
    isTestnetChainId({ chainId: token?.chainId }) || !!customAsset
  );

  const tokenBalance = {
    ...formatCurrencyParts(token.balance.amount),
    symbol: token.symbol,
  };
  const tokenNativeBalance = formatCurrencyParts(token.native.balance.amount);

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
            isSwappable ? (
              <Inline alignVertical="center" space="7px">
                <FavoriteButton token={token} />
                <MoreOptions token={token} />
              </Inline>
            ) : undefined
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
          <About token={token} />
        </Box>
      )}
    </AccentColorProvider>
  );
}
