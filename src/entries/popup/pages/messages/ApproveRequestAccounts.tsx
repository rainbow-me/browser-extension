import React, { useMemo, useState } from 'react';
import { chain, useEnsAvatar, useEnsName } from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { truncateAddress } from '~/core/utils/truncateAddress';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';

import { ChainBadge } from '../../components/ChainBadge/ChainBadge';
import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../../components/Menu/Menu';
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';
import { useAppMetadata } from '../../hooks/useAppMetadata';

interface ApproveRequestProps {
  approveRequest: () => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

interface SelectedNetwork {
  network: string;
  chainId: number;
  name: string;
}

const supportedChains: { [key: string]: SelectedNetwork } = {
  [chain.mainnet.network]: {
    network: chain.mainnet.network,
    chainId: chain.mainnet.id,
    name: chain.mainnet.name,
  },
  [chain.optimism.network]: {
    network: chain.optimism.network,
    chainId: chain.optimism.id,
    name: chain.optimism.name,
  },
  [chain.polygon.network]: {
    network: chain.polygon.network,
    chainId: chain.polygon.id,
    name: chain.polygon.name,
  },
  [chain.arbitrum.network]: {
    network: chain.arbitrum.network,
    chainId: chain.arbitrum.id,
    name: chain.arbitrum.name,
  },
};

export function ApproveRequestAccounts({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { currentAddress } = useCurrentAddressStore();
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: currentAddress });
  const { data: ensName } = useEnsName({ address: currentAddress });
  const { appHostName, appLogo, appName } = useAppMetadata({
    url: request?.meta?.sender?.url || '',
  });

  const [selectedNetwork, setSelectedNetwork] = useState<SelectedNetwork>(
    supportedChains[chain.mainnet.network],
  );

  const networkselector = useMemo(() => {
    return (
      <Menu>
        <MenuTrigger asChild>
          <Box>
            <Inline alignHorizontal="right" alignVertical="center" space="4px">
              <ChainBadge chainId={selectedNetwork.chainId} size={'small'} />
              <Text
                align="right"
                size="14pt"
                weight="semibold"
                color="labelSecondary"
              >
                {selectedNetwork.name}
              </Text>
              <SFSymbol
                color="labelSecondary"
                size={14}
                symbol="chevronDownCircle"
              />
            </Inline>
          </Box>
        </MenuTrigger>

        <MenuContent>
          <MenuLabel>Switch Networks</MenuLabel>
          <MenuSeparator />
          <MenuRadioGroup
            value={selectedNetwork.network}
            onValueChange={(network) =>
              setSelectedNetwork(supportedChains[network])
            }
          >
            {Object.keys(supportedChains).map((chain, i) => {
              const { network, chainId, name } = supportedChains[chain];
              return (
                <MenuRadioItem key={i} value={network}>
                  <Inline space="8px" alignVertical="center">
                    <ChainBadge chainId={chainId} size="small" />
                    <Text color="label" size="14pt" weight="semibold">
                      {name}
                    </Text>
                  </Inline>

                  <MenuItemIndicator style={{ marginLeft: 'auto' }}>
                    <SFSymbol symbol="checkMark" size={11} />
                  </MenuItemIndicator>
                </MenuRadioItem>
              );
            })}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    );
  }, [selectedNetwork.chainId, selectedNetwork.name, selectedNetwork.network]);

  return (
    <Rows alignVertical="justify">
      <Row height="content">
        <Box
          style={{
            paddingLeft: 50,
            paddingRight: 50,
            paddingTop: 64,
            paddingBottom: 42,
          }}
          background="surfacePrimaryElevatedSecondary"
        >
          <Stack space="32px">
            <Inline alignHorizontal="center">
              <Box
                style={{
                  width: 60,
                  height: 60,
                  overflow: 'hidden',
                }}
                borderRadius="18px"
                alignItems="center"
              >
                {appLogo ? (
                  <img src={appLogo} width="100%" height="100%" />
                ) : null}
              </Box>
            </Inline>

            <Stack space="32px">
              <Text
                size="20pt"
                weight="semibold"
                color="labelSecondary"
                align="center"
              >
                {appName} wants to connect to your wallet
              </Text>

              <Text align="center" color="accent" size="20pt" weight="bold">
                {appHostName}
              </Text>
            </Stack>
            <Inline alignHorizontal="center">
              <Box style={{ width: '186px' }}>
                <Separator color="separatorTertiary" />
              </Box>
            </Inline>

            <Text
              align="center"
              color="labelTertiary"
              size="14pt"
              weight="regular"
            >
              Allow {appName} to view your wallets address, balance, activity
              and request approval for transactions.
            </Text>
          </Stack>
        </Box>
        {/* <Separator color="separatorTertiary" /> */}
      </Row>
      <Row height="content">
        <Box padding="20px">
          <Stack space="24px">
            <Columns alignVertical="center" alignHorizontal="justify">
              <Column>
                <Stack space="8px">
                  <Text size="12pt" weight="semibold" color="labelQuaternary">
                    Wallet
                  </Text>
                  <Box>
                    <Inline alignVertical="center" space="4px">
                      <Box
                        background="fill"
                        borderRadius="30px"
                        style={{
                          width: '18px',
                          height: '18px',
                          overflow: 'hidden',
                        }}
                      >
                        {ensAvatar && (
                          /* TODO: Convert to <Image> & Imgix/Cloudinary */
                          <img
                            src={ensAvatar}
                            width="100%"
                            height="100%"
                            loading="lazy"
                          />
                        )}
                      </Box>
                      <Text
                        size="14pt"
                        weight="semibold"
                        color="labelSecondary"
                      >
                        {ensName || truncateAddress(currentAddress)}
                      </Text>
                      <SFSymbol
                        color="labelSecondary"
                        size={14}
                        symbol="chevronDownCircle"
                      />
                    </Inline>
                  </Box>
                </Stack>
              </Column>
              <Column>
                <Stack space="8px">
                  <Text
                    align="right"
                    size="12pt"
                    weight="semibold"
                    color="labelQuaternary"
                  >
                    Network
                  </Text>

                  {networkselector}
                </Stack>
              </Column>
            </Columns>
            <Rows space="8px">
              <Row>
                <Box
                  as="button"
                  id="accept-button"
                  background="accent"
                  width="full"
                  onClick={approveRequest}
                  padding="16px"
                  borderRadius="round"
                  boxShadow="24px accent"
                >
                  <Text color="label" size="14pt" weight="bold">
                    Connect to {appName}
                  </Text>
                </Box>
              </Row>
              <Row>
                <Box
                  as="button"
                  id="reject-button"
                  onClick={rejectRequest}
                  width="full"
                  padding="16px"
                  borderRadius="round"
                >
                  <Text color="labelSecondary" size="14pt" weight="bold">
                    Cancel
                  </Text>
                </Box>
              </Row>
            </Rows>
          </Stack>
        </Box>
      </Row>
    </Rows>
  );
}
