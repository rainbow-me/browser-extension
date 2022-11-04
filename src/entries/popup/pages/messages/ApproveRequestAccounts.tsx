import React from 'react';
import { useEnsAvatar, useEnsName } from 'wagmi';

import { ChainType } from '~/core/references';
import { useCurrentAddressStore } from '~/core/state';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import {
  dappLogoOverride,
  dappNameOverride,
  getDappHostname,
} from '~/core/utils/connectedApps';
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
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';

interface ApproveRequestProps {
  approveRequest: () => void;
  rejectRequest: () => void;
  request: ProviderRequestPayload;
}

export function ApproveRequestAccounts({
  approveRequest,
  rejectRequest,
  request,
}: ApproveRequestProps) {
  const { currentAddress } = useCurrentAddressStore();
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: currentAddress });
  const { data: ensName } = useEnsName({ address: currentAddress });

  const meta = request?.meta;
  const url = meta?.sender.url || '';

  const hostName = getDappHostname(url);
  const logo = dappLogoOverride(url);
  const name = dappNameOverride(url);

  return (
    <Box>
      <Box
        style={{
          paddingTop: 64,
          paddingBottom: 42,
          paddingLeft: 50,
          paddingRight: 50,
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
              borderRadius="round"
              alignItems="center"
            >
              {logo ? <img src={logo} width="60px" height="60px" /> : null}
            </Box>
          </Inline>

          <Stack space="24px">
            <Text align="center" color="label" size="20pt" weight="semibold">
              {name} wants to connect to your wallet
            </Text>

            <Text align="center" color="accent" size="14pt" weight="bold">
              {hostName}
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
            Allow {name} to view your wallets address, balance, activity and
            request approval for transactions.
          </Text>
        </Stack>
      </Box>

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
                    <Text size="14pt" weight="semibold" color="labelSecondary">
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
                <Inline
                  alignHorizontal="right"
                  alignVertical="center"
                  space="4px"
                >
                  <ChainBadge chainType={ChainType.arbitrum} size={'small'} />
                  <Text
                    align="right"
                    size="14pt"
                    weight="semibold"
                    color="labelSecondary"
                  >
                    Network
                  </Text>
                  <SFSymbol
                    color="labelSecondary"
                    size={14}
                    symbol="chevronDownCircle"
                  />
                </Inline>
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
              >
                <Text color="label" size="14pt" weight="bold">
                  Connect to {name}
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
    </Box>
  );
}
