import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { useAssetMetadata } from '~/core/resources/assets/assetMetadata';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useRainbowChainAssetsStore } from '~/core/state/rainbowChainAssets';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  fetchAssetBalanceViaProvider,
  fetchAssetWithPrice,
  getCustomChainIconUrl,
} from '~/core/utils/assets';
import { getChain } from '~/core/utils/chains';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { Row, Rows, Separator } from '~/design-system';
import { RainbowError, logger } from '~/logger';

import { WatchAssetActions } from './WatchAssetActions';
import { WatchAssetInfo } from './WatchAssetInfo';

interface ApproveRequestProps {
  approveRequest: (response: boolean | null) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export const WatchAsset = ({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) => {
  const [loading, setLoading] = useState(false);
  const { data: dappMetadata } = useDappMetadata({
    url: request?.meta?.sender?.url,
  });

  const {
    chainId,
    symbol,
    decimals,
    address: assetAddress,
  } = request.params?.[0] as {
    chainId: string;
    symbol: string;
    decimals: number;
    address: Address;
  };
  const { rainbowChainAssets, addRainbowChainAsset } =
    useRainbowChainAssetsStore();
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    Number(chainId),
  );
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const logo = useMemo(
    () => getCustomChainIconUrl(selectedChainId, assetAddress),
    [selectedChainId, assetAddress],
  );

  const { data: assetMetadata, isError: wrongNetwork } = useAssetMetadata(
    { assetAddress, chainId: selectedChainId },
    { enabled: !!assetAddress },
  );

  const [assetWithPrice, setAssetWithPrice] = useState<ParsedUserAsset>();

  const asset = useMemo(
    () => ({
      address: assetAddress,
      chainId: Number(selectedChainId),
      chainName: (getChain({ chainId: Number(selectedChainId) }).name ||
        '') as ChainName,
      decimals: assetMetadata?.decimals || decimals,
      symbol: assetMetadata?.symbol || symbol,
      isNativeAsset: false,
      name: assetMetadata?.name || symbol,
      uniqueId: `${assetAddress}_${chainId}`,
      native: assetWithPrice?.native || {
        price: undefined,
        balance: { amount: '0', display: '0' },
      },
      price: assetWithPrice?.price || { value: 0 },
      bridging: { isBridgeable: false, networks: [] },
      icon_url: logo,
      balance: assetWithPrice?.balance || { amount: '0', display: '0' },
    }),
    [
      assetAddress,
      assetMetadata?.decimals,
      assetMetadata?.name,
      assetMetadata?.symbol,
      assetWithPrice?.balance,
      assetWithPrice?.native,
      assetWithPrice?.price,
      chainId,
      decimals,
      logo,
      selectedChainId,
      symbol,
    ],
  );

  const isWrongNetwork = useMemo(() => {
    return wrongNetwork || !asset.name;
  }, [asset, wrongNetwork]);

  const fetchAssetData = useCallback(async () => {
    const assetWithMetadata = asset;

    // Get the balance onchain
    const parsedAsset = await fetchAssetBalanceViaProvider({
      parsedAsset: assetWithMetadata,
      currentAddress,
      currency: currentCurrency,
      provider: getProvider({ chainId: Number(selectedChainId) }),
    });

    // Attempt to get the price through the backend
    const assetWithPrice = await fetchAssetWithPrice({
      parsedAsset,
      currency: currentCurrency,
    });

    if (assetWithPrice) {
      setAssetWithPrice(assetWithPrice);
    } else {
      setAssetWithPrice(parsedAsset);
    }
  }, [asset, currentAddress, currentCurrency, selectedChainId]);

  useEffect(() => {
    fetchAssetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChainId]);

  const onAcceptRequest = useCallback(() => {
    try {
      setLoading(true);

      const rainbowChainAssetsForChain =
        rainbowChainAssets[Number(chainId)] || [];

      if (
        !rainbowChainAssetsForChain
          .map(({ address }: { address: Address }) => address)
          .includes(asset.address)
      ) {
        const assetToAdd = {
          name: asset.name || symbol || '',
          address: asset.address as Address,
          symbol: asset.symbol || '',
          decimals: asset.decimals || 18,
        };

        addRainbowChainAsset({
          chainId: Number(chainId),
          rainbowChainAsset: assetToAdd,
        });
      }

      approveRequest(true);

      analytics.track(event.dappPromptWatchAssetApproved, {
        chainId: Number(chainId),
        symbol,
        decimals: decimals,
        address: assetAddress,
        dappURL: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.info('error adding ethereum chain');
      logger.error(new RainbowError(e.name), { message: e.message });
    } finally {
      setLoading(false);
    }
  }, [
    rainbowChainAssets,
    chainId,
    asset.address,
    asset.name,
    asset.symbol,
    asset.decimals,
    approveRequest,
    symbol,
    decimals,
    assetAddress,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    addRainbowChainAsset,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    analytics.track(event.dappPromptWatchAssetRejected, {
      chainId: Number(chainId),
      symbol,
      decimals,
      address: assetAddress,
      dappURL: dappMetadata?.appHost || '',
      dappName: dappMetadata?.appName,
    });
  }, [
    assetAddress,
    chainId,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    decimals,
    rejectRequest,
    symbol,
  ]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <WatchAssetInfo
          appHostName={dappMetadata?.appHostName}
          appLogo={dappMetadata?.appLogo}
          appName={dappMetadata?.appName}
          dappStatus={dappMetadata?.status}
          asset={asset}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          wrongNetwork={isWrongNetwork}
        />
        <Separator color="separatorTertiary" />
      </Row>
      <Row height="content">
        <WatchAssetActions
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
          disabled={isWrongNetwork}
        />
      </Row>
    </Rows>
  );
};
