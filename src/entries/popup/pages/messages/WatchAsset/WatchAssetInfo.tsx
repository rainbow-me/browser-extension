import { getProvider } from '@wagmi/core';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { getCustomChainIconUrl } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainName } from '~/core/types/chains';
import { getChain } from '~/core/utils/chains';
import { Bleed, Box, Inline, Separator, Stack, Text } from '~/design-system';
import { TextInline } from '~/design-system/docs/components/TextInline';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

import { AssetRow } from '../../home/Tokens';
import { ThisDappIsLikelyMalicious } from '../DappScanStatus';
import { fetchAssetBalanceViaProvider } from '~/core/utils/assets';

export const WatchAssetInfo = ({
  appName,
  appLogo,
  dappStatus,
  suggestedAsset: { chainId, symbol, decimals, assetAddress },
}: {
  appHostName?: string;
  appName?: string;
  appLogo?: string;
  dappStatus?: DAppStatus;
  suggestedAsset: {
    chainId: number;
    symbol: string;
    decimals: number;
    assetAddress: Address;
  };
}) => {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const provider = getProvider({ chainId });
  const isScamDapp = dappStatus === DAppStatus.Scam;

  const logo = useMemo(
    () => getCustomChainIconUrl(chainId, assetAddress),
    [chainId, assetAddress],
  );

  const [asset, setAsset] = useState({
    address: assetAddress,
    chainId,
    chainName: (getChain({ chainId }).name || '') as ChainName,
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
    const parsedAsset = await fetchAssetBalanceViaProvider({
      parsedAsset: asset,
      currentAddress,
      currency: currentCurrency,
      provider,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setAsset(parsedAsset);
  }, [asset, currentAddress, currentCurrency, provider]);

  useEffect(() => {
    fetchAssetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      style={{
        paddingBottom: isScamDapp ? 20 : 42,
      }}
      paddingHorizontal="30px"
      paddingTop="64px"
      background="surfacePrimaryElevatedSecondary"
    >
      <Stack space="32px">
        <Box width="full">
          <Inline alignHorizontal="center" alignVertical="center">
            <DappIcon appLogo={appLogo} size="60px" />
          </Inline>
        </Box>
        <Box>
          <Text
            size="20pt"
            weight="semibold"
            color="labelSecondary"
            align="center"
          >
            <TextInline color="label">{appName}</TextInline>
            <br />
            {i18n.t('approve_request.allow_to_add_asset')}
          </Text>
        </Box>

        <Box alignItems="center" justifyContent="center" marginVertical="-4px">
          <Box style={{ width: '186px', margin: 'auto' }}>
            <Separator color="separatorTertiary" />
          </Box>
        </Box>
        {isScamDapp ? (
          <Bleed horizontal="30px">
            <ThisDappIsLikelyMalicious />
          </Bleed>
        ) : (
          <Text
            align="center"
            color="labelTertiary"
            size="14pt"
            weight="regular"
          >
            {i18n.t('approve_request.watch_asset_info_description', {
              appName,
            })}
          </Text>
        )}
        <Box
          padding="16px"
          borderRadius="24px"
          borderColor={'buttonStrokeSecondary'}
          borderWidth="1px"
          style={{
            height: '120px',
            overflow: 'auto',
          }}
        >
          <Box>
            <AssetRow asset={asset} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
