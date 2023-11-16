import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address, erc20ABI } from 'wagmi';
import { getContract, getProvider } from 'wagmi/actions';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { getCustomChainIconUrl } from '~/core/resources/assets/customNetworkAssets';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useCustomRPCAssetsStore } from '~/core/state/customRPCAssets';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  fetchAssetBalanceViaProvider,
  fetchAssetWithPrice,
} from '~/core/utils/assets';
import { getChain } from '~/core/utils/chains';
import { Row, Rows, Separator } from '~/design-system';
import { RainbowError, logger } from '~/logger';

import { WatchAssetActions } from './WatchAssetActions';
import { WatchAssetInfo } from './WatchAssetInfo';

interface ApproveRequestProps {
  approveRequest: (response: null) => void;
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
  const { customRPCAssets, addCustomRPCAsset } = useCustomRPCAssetsStore();
  const [selectedChainId, setSelectedChainId] = useState<ChainId>(
    Number(chainId),
  );
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const logo = useMemo(
    () => getCustomChainIconUrl(selectedChainId, assetAddress),
    [selectedChainId, assetAddress],
  );

  const [wrongNetwork, setWrongNetwork] = useState(true);

  const [asset, setAsset] = useState<ParsedUserAsset>({
    address: assetAddress,
    chainId: Number(chainId),
    chainName: (getChain({ chainId: Number(chainId) }).name || '') as ChainName,
    decimals,
    symbol,
    isNativeAsset: false,
    name: symbol,
    uniqueId: `${assetAddress}_${chainId}`,
    native: {
      price: undefined,
      balance: { amount: '0', display: '0' },
    },
    price: { value: 0 },
    bridging: { isBridgeable: false, networks: [] },
    icon_url: logo,
    balance: { amount: '0', display: '0' },
  });

  const fetchAssetData = useCallback(async () => {
    try {
      const provider = getProvider({ chainId: Number(selectedChainId) });
      const assetWithMetadata = asset;
      const tokenContract = await getContract({
        address: assetWithMetadata.address,
        abi: erc20ABI,
        signerOrProvider: provider,
      });
      if (!decimals) {
        const tokenDecimals = await tokenContract.decimals();
        assetWithMetadata.decimals = tokenDecimals;
      }
      if (!symbol) {
        const tokenSymbol = await tokenContract.symbol();
        assetWithMetadata.symbol = tokenSymbol;
      }
      const tokenName = await tokenContract.name();
      assetWithMetadata.name = tokenName;
      assetWithMetadata.chainId = Number(selectedChainId);
      assetWithMetadata.chainName = (getChain({
        chainId: Number(selectedChainId),
      }).name || '') as ChainName;

      const parsedAsset = await fetchAssetBalanceViaProvider({
        parsedAsset: assetWithMetadata,
        currentAddress,
        currency: currentCurrency,
        provider,
      });

      const assetWithPrice = await fetchAssetWithPrice({
        parsedAsset,
        currency: currentCurrency,
      });

      if (assetWithPrice) {
        setAsset(assetWithPrice);
      } else {
        setAsset(parsedAsset);
      }

      setWrongNetwork(false);
    } catch (e) {
      setWrongNetwork(true);
    }
  }, [
    asset,
    currentAddress,
    currentCurrency,
    decimals,
    selectedChainId,
    symbol,
  ]);

  useEffect(() => {
    fetchAssetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChainId]);

  const onAcceptRequest = useCallback(() => {
    try {
      setLoading(true);

      const customAssetsForChain = customRPCAssets[Number(chainId)] || [];

      if (
        !customAssetsForChain
          .map(({ address }: { address: Address }) => address)
          .includes(asset.address)
      ) {
        const assetToAdd = {
          name: asset.name || symbol || '',
          address: asset.address as Address,
          symbol: asset.symbol || '',
          decimals: asset.decimals || 18,
        };

        addCustomRPCAsset({
          chainId: Number(chainId),
          customRPCAsset: assetToAdd,
        });
      }

      approveRequest(null);

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
    customRPCAssets,
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
    addCustomRPCAsset,
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
          wrongNetwork={wrongNetwork}
        />
        <Separator color="separatorTertiary" />
      </Row>
      <Row height="content">
        <WatchAssetActions
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
          disabled={wrongNetwork}
        />
      </Row>
    </Rows>
  );
};
