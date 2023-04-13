import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BytesLike } from '@ethersproject/bytes';
import React, { useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { methodRegistryLookupAndParse } from '~/core/utils/methodRegistry';
import {
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
} from '~/core/utils/numbers';
import { Box, Inline, Inset, Separator, Stack, Text } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';
import { TransactionFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import { useAppMetadata } from '~/entries/popup/hooks/useAppMetadata';
import { useAppSession } from '~/entries/popup/hooks/useAppSession';
import { useNativeAssetForNetwork } from '~/entries/popup/hooks/useNativeAssetForNetwork';

interface SendTransactionProps {
  request: ProviderRequestPayload;
}

export function SendTransactionInfo({ request }: SendTransactionProps) {
  const { appHostName, appLogo, appHost } = useAppMetadata({
    url: request?.meta?.sender?.url,
  });
  const { appSession } = useAppSession({ host: appHost });
  const [methodName, setMethodName] = useState('');
  const nativeAsset = useNativeAssetForNetwork({ chainId: appSession.chainId });
  const { currentCurrency } = useCurrentCurrencyStore();

  useEffect(() => {
    const fetchMethodName = async (
      data: BytesLike | undefined,
      to?: Address,
    ) => {
      if (!data) return;
      if (!to) {
        setMethodName(i18n.t('approve_request.contract_deployment'));
        return;
      }
      const methodSignaturePrefix = (data as string)?.substr(0, 10);
      let fallbackHandler;
      try {
        fallbackHandler = setTimeout(() => {
          setMethodName(i18n.t('approve_request.transaction_request'));
        }, 5000);
        const { name } = await methodRegistryLookupAndParse(
          methodSignaturePrefix,
          to,
        );
        if (name) {
          setMethodName(name);
          clearTimeout(fallbackHandler);
        }
      } catch (e) {
        setMethodName(i18n.t('approve_request.transaction_request'));
        clearTimeout(fallbackHandler);
      }
    };
    const txRequest = request?.params?.[0] as TransactionRequest;
    fetchMethodName(txRequest.data, txRequest.to as Address);
  }, [request?.params]);

  const { nativeAssetAmount, nativeCurrencyAmount } = useMemo(() => {
    if (!nativeAsset)
      return { nativeAssetAmount: null, nativeCurrencyAmount: null };
    switch (request.method) {
      case 'eth_sendTransaction':
      case 'eth_signTransaction': {
        const tx = request?.params?.[0] as RainbowTransaction;

        const nativeAssetAmount = convertRawAmountToBalance(
          tx?.value?.toString() ?? 0,
          nativeAsset,
        ).display;

        const nativeCurrencyAmount = convertRawAmountToNativeDisplay(
          tx?.value?.toString() ?? 0,
          nativeAsset?.decimals,
          nativeAsset?.price?.value as number,
          currentCurrency,
        ).display;
        return { nativeAssetAmount, nativeCurrencyAmount };
      }
      default:
        return { nativeAssetAmount: null, nativeCurrencyAmount: null };
    }
  }, [request, nativeAsset, currentCurrency]);

  return (
    <Box background="surfacePrimaryElevatedSecondary">
      <Inset top="40px" bottom="16px">
        <Stack space="10px">
          <Inset bottom="8px">
            <Stack space="16px">
              <Inline alignHorizontal="center">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    overflow: 'scroll',
                  }}
                  borderRadius="18px"
                  alignItems="center"
                >
                  {appLogo ? (
                    <ExternalImage src={appLogo} width="32" height="32" />
                  ) : null}
                </Box>
              </Inline>
              <Stack space="12px">
                <Text
                  align="center"
                  size="20pt"
                  weight="semibold"
                  color="labelSecondary"
                >
                  {appHostName}
                </Text>
                <Text align="center" size="20pt" weight="semibold">
                  {methodName}
                </Text>
              </Stack>
            </Stack>
          </Inset>

          <Inset vertical="64px" horizontal="50px">
            <Stack space="16px" alignHorizontal="center">
              <Text align="center" size="32pt" weight="heavy" color="label">
                {nativeCurrencyAmount || ''}
              </Text>
              <Box background="surfacePrimaryElevated" borderRadius="18px">
                <Inset vertical="6px" left="8px" right="10px">
                  <Inline
                    space="4px"
                    alignVertical="center"
                    alignHorizontal="center"
                  >
                    <ChainBadge chainId={ChainId.mainnet} size={'small'} />
                    <Text size="14pt" weight="semibold" color="label">
                      {nativeAssetAmount || ''}
                    </Text>
                  </Inline>
                </Inset>
              </Box>
            </Stack>
          </Inset>

          <Inset horizontal="20px">
            <TransactionFee
              analyticsEvents={{
                customGasClicked:
                  event.dappPromptSendTransactionCustomGasClicked,
                transactionSpeedSwitched:
                  event.dappPromptSendTransactionSpeedSwitched,
                transactionSpeedClicked:
                  event.dappPromptSendTransactionSpeedClicked,
              }}
              chainId={appSession.chainId}
              transactionRequest={request?.params?.[0] as TransactionRequest}
              plainTriggerBorder
            />
          </Inset>
        </Stack>
      </Inset>
      <Separator color="separatorTertiary" />
    </Box>
  );
}
