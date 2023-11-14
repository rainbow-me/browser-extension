import { useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
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

  const onAcceptRequest = useCallback(() => {
    try {
      setLoading(true);

      // TODO - ADD ASSET

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
    approveRequest,
    chainId,
    symbol,
    decimals,
    assetAddress,
    dappMetadata?.appHost,
    dappMetadata?.appName,
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
          suggestedAsset={{
            chainId: Number(chainId),
            symbol,
            decimals,
            assetAddress,
          }}
        />
        <Separator color="separatorTertiary" />
      </Row>
      <Row height="content">
        <WatchAssetActions
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
        />
      </Row>
    </Rows>
  );
};
