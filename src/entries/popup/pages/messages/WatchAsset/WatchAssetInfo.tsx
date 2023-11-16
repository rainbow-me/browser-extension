import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { Bleed, Box, Inline, Separator, Stack, Text } from '~/design-system';
import { TextInline } from '~/design-system/docs/components/TextInline';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';

import { AssetRow } from '../../home/Tokens';
import { BottomNetwork } from '../BottomActions';
import { ThisDappIsLikelyMalicious } from '../DappScanStatus';

export const WatchAssetInfo = ({
  appName,
  appLogo,
  dappStatus,
  asset,
  selectedChainId,
  setSelectedChainId,
  wrongNetwork,
}: {
  appHostName?: string;
  appName?: string;
  appLogo?: string;
  dappStatus?: DAppStatus;
  selectedChainId: ChainId;
  setSelectedChainId: (chainId: ChainId) => void;
  asset: ParsedUserAsset;
  wrongNetwork: boolean;
}) => {
  const isScamDapp = dappStatus === DAppStatus.Scam;
  return (
    <Box
      style={{
        paddingBottom: isScamDapp ? 20 : 10,
        minHeight: 475,
      }}
      paddingHorizontal="30px"
      paddingTop="64px"
      background="surfacePrimaryElevatedSecondary"
    >
      <Stack space="20px">
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
          padding="10px"
          borderRadius="24px"
          borderColor={'buttonStrokeSecondary'}
          borderWidth="1px"
          style={{
            height: '75px',
          }}
        >
          <AssetRow asset={asset} />
        </Box>
        {wrongNetwork && (
          <Box
            borderColor={'red'}
            borderRadius="24px"
            borderWidth="1px"
            padding="16px"
          >
            <Text
              size="12pt"
              weight="regular"
              color="labelSecondary"
              align="center"
            >
              {i18n.t('watch_asset.not_found')}
            </Text>
            <Box paddingTop="10px">
              <Inline alignHorizontal="center" alignVertical="center">
                <Box paddingRight="10px">
                  <Text
                    align="right"
                    size="12pt"
                    weight="semibold"
                    color="labelSecondary"
                  >
                    {i18n.t('approve_request.network')}
                  </Text>
                </Box>

                <SwitchNetworkMenu
                  type="dropdown"
                  chainId={selectedChainId}
                  onChainChanged={(chainId) => {
                    setSelectedChainId(chainId);
                  }}
                  triggerComponent={
                    <BottomNetwork
                      selectedChainId={selectedChainId}
                      displaySymbol
                    />
                  }
                />
              </Inline>
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
