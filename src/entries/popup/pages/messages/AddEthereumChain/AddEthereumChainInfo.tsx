import { useState } from 'react';

import { DAppStatus } from '~/core/graphql/__generated__/metadata';
import { i18n } from '~/core/languages';
import {
  Bleed,
  Box,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { TextInline } from '~/design-system/docs/components/TextInline';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';
import { DappIcon } from '~/entries/popup/components/DappIcon/DappIcon';

import { ThisDappIsLikelyMalicious } from '../DappScanStatus';

export const AddEthereumChainInfo = ({
  appName,
  appLogo,
  dappStatus,
  suggestedNetwork: {
    chainId,
    chainName,
    nativeCurrencyName,
    nativeCurrencySymbol,
    nativeCurrencyDecimals,
    rpcUrl,
    blockExplorerUrl,
  },
}: {
  appHostName?: string;
  appName?: string;
  appLogo?: string;
  dappStatus?: DAppStatus;
  suggestedNetwork: {
    chainId: number;
    chainName: string;
    nativeCurrencyName: string;
    nativeCurrencySymbol: string;
    nativeCurrencyDecimals: number;
    rpcUrl: string;
    blockExplorerUrl: string;
  };
}) => {
  const [testnet, setTestnet] = useState(
    chainName.toLowerCase().includes('testnet'),
  );
  const isScamDapp = dappStatus === DAppStatus.Scam;

  return (
    <Box
      style={{
        minHeight: 462,
      }}
      paddingHorizontal="30px"
      paddingTop="64px"
      background="surfacePrimaryElevatedSecondary"
      height="full"
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
            {i18n.t('approve_request.allow_to_add_network')}
          </Text>
        </Box>

        <Box alignItems="center" justifyContent="center" marginVertical="-4px">
          <Box style={{ width: '186px', margin: 'auto' }}>
            <Separator color="separatorTertiary" />
          </Box>
        </Box>
        {isScamDapp ? (
          <Bleed horizontal="30px" vertical="6px">
            <ThisDappIsLikelyMalicious />
          </Bleed>
        ) : (
          <Text
            align="center"
            color="labelTertiary"
            size="14pt"
            weight="regular"
          >
            {i18n.t('approve_request.add_chain_info_description', {
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
            <Rows alignVertical="center" space="15px">
              {chainName && (
                <Row>
                  <Inline alignVertical="center" space="8px">
                    <Text size="14pt" weight="bold">
                      {i18n.t('add_chain.name')}:
                    </Text>
                    <Text size="14pt" weight="regular">
                      {chainName}
                    </Text>
                  </Inline>
                </Row>
              )}
              <Row>
                <Inline alignVertical="center" space="8px">
                  <Text size="14pt" weight="bold">
                    {i18n.t('add_chain.chain_id')}:
                  </Text>
                  <Text size="14pt" weight="regular">
                    {chainId}
                  </Text>
                </Inline>
              </Row>
              <Row>
                <Inline alignVertical="center" space="8px">
                  <Text size="14pt" weight="bold">
                    {i18n.t('add_chain.currency_name')}:
                  </Text>
                  <Text size="14pt" weight="regular">
                    {nativeCurrencyName}
                  </Text>
                </Inline>
              </Row>
              <Row>
                <Inline alignVertical="center" space="8px">
                  <Text size="14pt" weight="bold">
                    {i18n.t('add_chain.currency_symbol')}:
                  </Text>
                  <Text size="14pt" weight="regular">
                    {nativeCurrencySymbol}
                  </Text>
                </Inline>
              </Row>
              <Row>
                <Inline alignVertical="center" space="8px">
                  <Text size="14pt" weight="bold">
                    {i18n.t('add_chain.currency_decimals')}:
                  </Text>
                  <Text size="14pt" weight="regular">
                    {nativeCurrencyDecimals}
                  </Text>
                </Inline>
              </Row>
              <Row>
                <Text size="14pt" weight="bold">
                  {i18n.t('add_chain.rpc_url')}:
                  <br />
                  <Text size="14pt" weight="regular">
                    {rpcUrl}
                  </Text>
                </Text>
              </Row>
              {blockExplorerUrl && (
                <Row height="content">
                  <Text size="14pt" weight="bold">
                    {i18n.t('add_chain.block_explorer_url')}:
                    <br />
                    <Text size="14pt" weight="regular">
                      {blockExplorerUrl}
                    </Text>
                  </Text>
                </Row>
              )}
            </Rows>
          </Box>
        </Box>
      </Stack>
      <Box paddingVertical="12px" paddingHorizontal="20px">
        <Inline alignHorizontal="justify" alignVertical="center">
          <Text size="14pt" weight="bold">
            {i18n.t('add_chain.testnet')}:
          </Text>
          <Checkbox
            borderColor="accent"
            onClick={() => setTestnet((testnet) => !testnet)}
            selected={testnet}
          />
        </Inline>
      </Box>
    </Box>
  );
};
