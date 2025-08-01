import { useCallback, useState } from 'react';
import { Chain } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { Row, Rows, Separator } from '~/design-system';
import { RainbowError, logger } from '~/logger';

import { AddEthereumChainActions } from './AddEthereumChainActions';
import { AddEthereumChainInfo } from './AddEthereumChainInfo';

interface ApproveRequestProps {
  approveRequest: (response: boolean) => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export const AddEthereumChain = ({
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
    rpcUrls: [rpcUrl],
    chainName,
    nativeCurrency: { symbol, name, decimals },
    blockExplorerUrls: [blockExplorerUrl],
  } = request.params?.[0] as {
    chainId: string;
    rpcUrls: string[];
    chainName: string;
    iconUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls: string[];
  };

  const [testnet, setTestnet] = useState(
    chainName.toLowerCase().includes('testnet'),
  );

  const addCustomChain = useNetworkStore((state) => state.addCustomChain);

  const onAcceptRequest = useCallback(async () => {
    try {
      setLoading(true);

      const chain: Chain = {
        id: Number(chainId),
        name: chainName || name,
        nativeCurrency: {
          symbol,
          decimals: 18,
          name: name || symbol,
        },
        rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } },
        testnet,
      };
      addCustomChain(+chainId, chain, rpcUrl, true);

      analytics.track(event.dappAddEthereumChainPromptApproved, {
        chainId: Number(chainId),
        rpcUrl,
        blockExplorerUrl,
        dappURL: dappMetadata?.url || '',
        dappDomain: dappMetadata?.appHost || '',
        dappName: dappMetadata?.appName,
      });

      // wait 1.2s for storages to sync (persist throttle on network store is 1s)
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      approveRequest(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.info('error adding ethereum chain');
      logger.error(new RainbowError(e.name), { message: e.message });
    } finally {
      setLoading(false);
    }
  }, [
    chainId,
    chainName,
    name,
    symbol,
    rpcUrl,
    testnet,
    addCustomChain,
    approveRequest,
    blockExplorerUrl,
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
  ]);

  const onRejectRequest = useCallback(() => {
    rejectRequest();
    analytics.track(event.dappAddEthereumChainPromptRejected, {
      chainId: Number(chainId),
      rpcUrl,
      blockExplorerUrl,
      dappURL: dappMetadata?.url || '',
      dappDomain: dappMetadata?.appHost || '',
      dappName: dappMetadata?.appName,
    });
  }, [
    blockExplorerUrl,
    chainId,
    dappMetadata?.url,
    dappMetadata?.appHost,
    dappMetadata?.appName,
    rejectRequest,
    rpcUrl,
  ]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <AddEthereumChainInfo
          appHostName={dappMetadata?.appHostName}
          appLogo={dappMetadata?.appLogo}
          appName={dappMetadata?.appName}
          dappStatus={dappMetadata?.status}
          suggestedNetwork={{
            chainId: Number(chainId),
            chainName,
            nativeCurrencyName: name,
            nativeCurrencySymbol: symbol,
            nativeCurrencyDecimals: decimals,
            rpcUrl,
            blockExplorerUrl,
          }}
          testnet={testnet}
          setTestnet={setTestnet}
        />
        <Separator color="separatorTertiary" />
      </Row>
      <Row height="content">
        <AddEthereumChainActions
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          loading={loading}
          dappStatus={dappMetadata?.status}
        />
      </Row>
    </Rows>
  );
};
